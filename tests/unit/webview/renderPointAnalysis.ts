/**
 * WP-V66 (D1) · Derivación del censo de PUNTOS DE RENDER desde el AST.
 *
 * El censo anterior cerraba FICHEROS con una regex textual sobre el fuente.
 * Eso dejaba tres puertas abiertas: aliasar el objeto (`const wv = p.webview`),
 * partir los literales (`'<!DOCTYPE ' + 'html>'`) y añadir render en un fichero
 * YA censado (productor o asignador). Aquí la unidad deja de ser el fichero:
 *
 *  - PUNTO DE RENDER  = función cuyos literales PROPIOS forman HTML.
 *    Se derivan del AST, así que el aliasado es irrelevante (no se mira a qué
 *    se asigna) y los literales partidos se concatenan antes de mirar.
 *  - SUMIDERO (sink)  = todo sitio donde se asigna `.html`.
 *    Debe delegar en un punto de render censado; nada más puede llegar ahí.
 *
 * Este módulo NO es una suite: es la maquinaria, y se ejerce tanto sobre
 * `src/` real como sobre fuentes sintéticos hostiles (los bypass del informe).
 */
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

/** Documento completo de webview. */
export const DOC_SIGNAL = /<!DOCTYPE\s+html|<html[\s>]/i;

/** Fragmento HTML (se inyecta dentro de un documento). */
export const FRAG_SIGNAL =
    /<(?:div|span|button|body|head|script|iframe|section|table|thead|tbody|tr|td|th|ul|ol|li|p|h[1-6]|style|link|img|form|input|select|option|textarea|label|pre|code|canvas|nav|header|footer|main|article|aside|dialog|template|svg|meta|title|a)[\s>/]/i;

export type RenderKind = 'document' | 'fragment' | 'none';

export interface FnInfo {
    /** ruta relativa a la raíz del repo, con `/` */
    file: string;
    name: string;
    line: number;
    /** funciones envolventes, de fuera hacia dentro */
    ancestors: string[];
    /** literales que pertenecen a ESTA función (los de las anidadas, no) */
    literalText: string;
    kind: RenderKind;
    /** nombres simples de todo lo que esta función llama */
    callees: string[];
    /** toda sentencia `return` propia devuelve una llamada */
    pureDelegator: boolean;
    /** llama al motor de invariantes (guarda declarada) */
    validates: boolean;
}

export interface SinkInfo {
    file: string;
    line: number;
    code: string;
    /** nombre simple del callee, si el valor asignado es una llamada */
    callee?: string;
}

export interface FileAnalysis {
    functions: FnInfo[];
    sinks: SinkInfo[];
}

export interface TreeAnalysis extends FileAnalysis {
    files: string[];
}

const VALIDATOR_NAMES = ['findWebviewHtmlViolations', 'isSafeWebviewHtml'];

function isFunctionLike(node: ts.Node): node is ts.SignatureDeclaration {
    return (
        ts.isFunctionDeclaration(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isArrowFunction(node) ||
        ts.isFunctionExpression(node) ||
        ts.isGetAccessor(node) ||
        ts.isConstructorDeclaration(node)
    );
}

function literalTextOf(node: ts.Node): string | undefined {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        return node.text;
    }
    if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
        return node.text;
    }
    return undefined;
}

function nameOf(node: ts.Node, sf: ts.SourceFile): string {
    const named = node as any;
    if (named.name && typeof named.name.getText === 'function') {
        return named.name.getText(sf);
    }
    const p = node.parent;
    if (p && (ts.isVariableDeclaration(p) || ts.isPropertyAssignment(p) || ts.isPropertyDeclaration(p)) && (p as any).name) {
        return (p as any).name.getText(sf);
    }
    return `<anon@${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1}>`;
}

/** Nombre simple del destino de una llamada: `a.b.c()` → `c`. */
function calleeName(expr: ts.Expression, sf: ts.SourceFile): string | undefined {
    if (ts.isIdentifier(expr)) {
        return expr.text;
    }
    if (ts.isPropertyAccessExpression(expr)) {
        return expr.name.getText(sf);
    }
    return undefined;
}

/** Quita `await`, paréntesis, `as T`, `!` — lo que envuelve sin cambiar el valor. */
function unwrap(node: ts.Expression): ts.Expression {
    let cur: ts.Expression = node;
    for (;;) {
        if (ts.isAwaitExpression(cur) || ts.isParenthesizedExpression(cur)) {
            cur = cur.expression;
        } else if (ts.isAsExpression(cur) || ts.isNonNullExpression(cur) || ts.isTypeAssertionExpression(cur)) {
            cur = cur.expression;
        } else {
            return cur;
        }
    }
}

/** ¿La expresión es (o se reduce a) una llamada? Un ternario cuenta si ambas ramas lo son. */
function isCallShaped(expr: ts.Expression): boolean {
    const e = unwrap(expr);
    if (ts.isCallExpression(e)) {
        return true;
    }
    if (ts.isConditionalExpression(e)) {
        return isCallShaped(e.whenTrue) && isCallShaped(e.whenFalse);
    }
    return false;
}

/** Recorre los hijos de `fn` sin entrar en funciones anidadas. */
function walkOwn(fn: ts.Node, visit: (n: ts.Node) => void): void {
    const step = (node: ts.Node) => {
        if (node !== fn && isFunctionLike(node)) {
            return;
        }
        visit(node);
        ts.forEachChild(node, step);
    };
    ts.forEachChild(fn, step);
}

export function analyzeSource(relFile: string, text: string): FileAnalysis {
    const sf = ts.createSourceFile(relFile, text, ts.ScriptTarget.ES2020, true);
    const functions: FnInfo[] = [];
    const sinks: SinkInfo[] = [];

    const lineOf = (n: ts.Node) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;

    const visit = (node: ts.Node, ancestors: string[]) => {
        let childAncestors = ancestors;

        // las declaraciones sin cuerpo (abstract, sobrecargas) no rinden nada
        if (isFunctionLike(node) && (node as any).body) {
            const name = nameOf(node, sf);
            let literalText = '';
            const callees: string[] = [];
            let pureDelegator = true;
            let hasReturnValue = false;

            walkOwn(node, n => {
                const lit = literalTextOf(n);
                if (lit !== undefined) {
                    literalText += lit;
                }
                if (ts.isCallExpression(n)) {
                    const cn = calleeName(n.expression, sf);
                    if (cn) {
                        callees.push(cn);
                    }
                }
                if (ts.isReturnStatement(n) && n.expression) {
                    hasReturnValue = true;
                    if (!isCallShaped(n.expression)) {
                        pureDelegator = false;
                    }
                }
            });
            // los arrow con cuerpo-expresión no tienen ReturnStatement
            if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) {
                hasReturnValue = true;
                if (!isCallShaped(node.body)) {
                    pureDelegator = false;
                }
            }

            const kind: RenderKind = DOC_SIGNAL.test(literalText)
                ? 'document'
                : FRAG_SIGNAL.test(literalText)
                    ? 'fragment'
                    : 'none';

            functions.push({
                file: relFile,
                name,
                line: lineOf(node),
                ancestors: [...ancestors],
                literalText,
                kind,
                callees,
                pureDelegator: pureDelegator && hasReturnValue,
                validates: callees.some(c => VALIDATOR_NAMES.includes(c))
            });
            childAncestors = [...ancestors, name];
        }

        // sumidero: `<lo que sea>.html = <expr>`  (el alias del objeto da igual)
        if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            const l = node.left;
            const isHtmlTarget =
                (ts.isPropertyAccessExpression(l) && l.name.getText(sf) === 'html') ||
                (ts.isElementAccessExpression(l) && /^['"`]html['"`]$/.test(l.argumentExpression.getText(sf)));
            if (isHtmlTarget) {
                const rhs = unwrap(node.right);
                sinks.push({
                    file: relFile,
                    line: lineOf(node),
                    code: node.getText(sf).replace(/\s+/g, ' ').slice(0, 120),
                    callee: ts.isCallExpression(rhs) ? calleeName(rhs.expression, sf) : undefined
                });
            }
        }

        // sumidero: `{ html: ... }` u `{ html }` como argumento de una llamada
        // (p. ej. `Object.assign(panel.webview, { html })`)
        if (
            (ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node)) &&
            node.name &&
            node.name.getText(sf) === 'html' &&
            node.parent &&
            ts.isObjectLiteralExpression(node.parent) &&
            node.parent.parent &&
            ts.isCallExpression(node.parent.parent) &&
            node.parent.parent.arguments.some(a => a === node.parent)
        ) {
            const value = ts.isPropertyAssignment(node) ? unwrap(node.initializer) : undefined;
            sinks.push({
                file: relFile,
                line: lineOf(node),
                code: node.parent.parent.getText(sf).replace(/\s+/g, ' ').slice(0, 120),
                callee: value && ts.isCallExpression(value) ? calleeName(value.expression, sf) : undefined
            });
        }

        ts.forEachChild(node, n => visit(n, childAncestors));
    };

    ts.forEachChild(sf, n => visit(n, []));
    return { functions, sinks };
}

export function listTsFiles(dir: string): string[] {
    const out: string[] = [];
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        if (fs.statSync(full).isDirectory()) {
            out.push(...listTsFiles(full));
        } else if (name.endsWith('.ts') && !name.endsWith('.d.ts')) {
            out.push(full);
        }
    }
    return out;
}

export function analyzeTree(srcRoot: string, repoRoot: string): TreeAnalysis {
    const functions: FnInfo[] = [];
    const sinks: SinkInfo[] = [];
    const files: string[] = [];
    for (const full of listTsFiles(srcRoot)) {
        const rel = path.relative(repoRoot, full).replace(/\\/g, '/');
        files.push(rel);
        const a = analyzeSource(rel, fs.readFileSync(full, 'utf8'));
        functions.push(...a.functions);
        sinks.push(...a.sinks);
    }
    return { functions, sinks, files };
}

export function renderPointId(fn: { file: string; name: string }): string {
    return `${fn.file}::${fn.name}`;
}
