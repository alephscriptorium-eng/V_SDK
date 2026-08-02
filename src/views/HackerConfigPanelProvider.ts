import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { BaseHackerPanelProvider } from './BaseHackerPanelProvider';
import { LogCategory } from '../loggingManager';
import { getLogger } from '../core/logging';

/**
 * WP-V71 · `handleMessage` recibe mensajes del webview, que es superficie no
 * confiable: el payload sale al canal por el redactor (WP-V71 CA4).
 */
const log = getLogger('HackerConfigPanel', LogCategory.WEBVIEW);

export interface ConfigGroup {
    name: string;
    icon: string;
    description: string;
    configs: ConfigItem[];
}

/**
 * WP-V102 · DE DÓNDE SALE CADA ACTIVO, COMO DATO Y NO COMO SUPOSICIÓN.
 *
 * Hasta este WP, todos los métodos de este panel resolvían contra
 * `workspaceFolders[0]` sin decirlo, y esa suposición callada era el defecto.
 * MEDIDO en ejecución (`tests/unit/views/hackerConfigPanelActivos.test.ts`,
 * §0): el extinto `_getWebviewConfigs()` ofrecía cuatro entradas contra el
 * workspace, y tres de ellas —`schemas/*.schema.json`— son activos que viajan
 * EN EL PAQUETE: no aparecen en `.vscodeignore` y `contributes.jsonValidation`
 * los cablea con rutas `./schemas/*` **relativas al paquete**.
 *
 *   · workspace = un proyecto cualquiera → el grupo salía VACÍO. Siempre.
 *   · workspace = este repositorio       → salían 3 schemas, y los MISMOS 3,
 *     con la misma ruta absoluta, ya los listaba `_getSchemaConfigs()`.
 *
 * Es decir: aquel método no aportó jamás un elemento propio, y el panel sólo
 * enseñaba los schemas a quien desarrolla la extensión.
 *
 * LA REGLA QUE QUEDA, y que el test vigila EJECUTANDO:
 *
 *   NOMBRAR UN FICHERO ES UNA PROMESA; ENUMERAR UN DIRECTORIO ES UNA PREGUNTA.
 *
 * Un nombre de fichero codificado promete algo que el árbol del producto tiene
 * que poder producir. «sample-config.json» no podía: lo podó WP-V13 en
 * `f615434`, junto con «ArrakisTheater_OperaConfig.json». Un directorio
 * enumerado no promete ningún fichero concreto, así que su ausencia es
 * descubrimiento y no mentira. Por eso los schemas ya no se nombran uno a uno:
 * se enumera el directorio. Es el argumento de WP-V100 aplicado aquí —
 * re-sincronizar la lista a mano deja intacto el mecanismo que la desincronizó.
 *
 * HASTA DÓNDE LLEGA ESO, EXACTAMENTE. No queda **ningún nombre de fichero**
 * codificado, que es la clase a la que pertenecía «sample-config.json». Sí
 * quedan dos literales de ESTRUCTURA —el directorio `'schemas'` y el sufijo
 * `'.schema.json'`—, y ésos **sí pueden quedarse rancios**: si el paquete
 * reorganiza sus activos, dejan de casar. Lo que tapa ese hueco no es la forma
 * del código, es **la ejecución**: §1 del test enrojece en los dos casos,
 * porque comprueba que con un workspace ajeno el panel sigue ofreciendo activos
 * del paquete. La estructura reduce la superficie; el rojo lo pone el test.
 */
export type OrigenActivo = 'paquete' | 'workspace';

export interface ConfigItem {
    id: string;
    name: string;
    description: string;
    type: 'vscode-setting' | 'config-file';
    icon: string;
    value?: any;
    filePath?: string;
    settingKey?: string;
    category: string;
    /** Dónde se buscó el fichero. Obligatorio en todo item `config-file`. */
    origen?: OrigenActivo;
}

export class HackerConfigPanelProvider extends BaseHackerPanelProvider {
    public static readonly viewType = 'alephscript.hackerConfigPanel';

    constructor(
        extensionUri: vscode.Uri,
        context: vscode.ExtensionContext
    ) {
        super(extensionUri, context);
    }

    public get viewType(): string {
        return HackerConfigPanelProvider.viewType;
    }

    protected initializePanel(): void {
        setTimeout(() => this._updateConfigs(), 1000);
    }

    protected getHtmlContent(webview: vscode.Webview): string {
        const bodyContent = `
            <div class="config-panels" id="configPanels">
                <div class="loading-message">
                    <span class="blinking-text">>>> SCANNING QUANTUM CONFIGURATIONS...</span>
                </div>
            </div>
            
            <div class="system-controls">
                <button class="hacker-btn primary" data-action="refreshConfigs">
                    🔄 RESCAN_CONFIG_MATRIX
                </button>
                <button class="hacker-btn secondary" data-action="openWorkspaceSettings">
                    ⚙️ WORKSPACE_SETTINGS
                </button>
                <button class="hacker-btn secondary" data-action="openUserSettings">
                    👤 USER_SETTINGS
                </button>
            </div>
        `;

        return this.generateBaseHtml(
            webview,
            'hacker-config-panel.js',
            'hacker-config-panel.css',
            'ARRAKIS_CONFIG_MATRIX',
            bodyContent
        );
    }

    protected handleMessage(message: any): void {
        log.info('Received message from webview', { message });
        vscode.window.showInformationMessage(`HackerConfigPanel received: ${message.command}`);
        
        switch (message.command) {
            case 'openVSCodeSetting':
                log.info('Opening VS Code setting', { settingKey: message.settingKey });
                this._openVSCodeSetting(message.settingKey);
                break;
            case 'openConfigFile':
                log.info('Opening config file', { filePath: message.filePath });
                this._openConfigFile(message.filePath);
                break;
            case 'refreshConfigs':
                log.info('Refreshing configs');
                this._refreshConfigs();
                break;
            case 'openWorkspaceSettings':
                log.info('Opening workspace settings');
                this._openWorkspaceSettings();
                break;
            case 'openUserSettings':
                log.info('Opening user settings');
                this._openUserSettings();
                break;
            default:
                log.info('Unknown command from webview', { command: message.command });
                vscode.window.showWarningMessage(`Unknown command: ${message.command}`);
        }
    }

    private async _openVSCodeSetting(settingKey: string): Promise<void> {
        try {
            // Use an exact ID query to reveal the specific setting in the Settings UI
            const query = `@id:${settingKey}`;
            await vscode.commands.executeCommand('workbench.action.openSettings', query);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open setting: ${error}`);
        }
    }

    private async _openConfigFile(filePath: string): Promise<void> {
        try {
            const uri = vscode.Uri.file(filePath);
            await vscode.window.showTextDocument(uri);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open config file: ${error}`);
        }
    }

    private async _openWorkspaceSettings(): Promise<void> {
        try {
            await vscode.commands.executeCommand('workbench.action.openWorkspaceSettings');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open workspace settings: ${error}`);
        }
    }

    private async _openUserSettings(): Promise<void> {
        try {
            await vscode.commands.executeCommand('workbench.action.openSettings');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open user settings: ${error}`);
        }
    }

    private _refreshConfigs(): void {
        this._updateConfigs();
    }

    private _updateConfigs(): void {
        if (this._view) {
            const configGroups = this._getConfigGroups();
            this.postMessage({
                command: 'updateConfigs',
                data: configGroups
            });
        }
    }

    private _getConfigGroups(): ConfigGroup[] {
        return [
            {
                name: "EXTENSION SETTINGS",
                icon: "⚡",
                description: "VS Code settings specific to Aleph-0",
                configs: this._getExtensionSettings()
            },
            {
                // WP-V102: el grupo «WEBVIEW CONFIGURATIONS» se retiró aquí. Sus
                // 3 entradas de schema eran los mismos ficheros —misma ruta
                // absoluta— que ya listaba este grupo, así que en los dos
                // workspaces MEDIDOS (este repositorio, y un proyecto ajeno sin
                // `sample-config.json` propio) no se pierde ningún elemento.
                //
                // ⚠ CUALIFICACIÓN, y va aquí a propósito porque la tesis de este
                // WP es que la prosa que nombra ficheros es una promesa: la
                // cuarta entrada, «sample-config.json», NO era un fantasma para
                // un usuario que tenga ese fichero en la raíz de su workspace.
                // Medido: en ese caso el cambio es −1 / +3, y esa entrada SE
                // PIERDE. Se retira igualmente, y la razón no es que no exista:
                // es que su `name`/`description` («Sample Configuration»,
                // «Sample webview configuration template») la ofrecían como
                // PLANTILLA DEL PRODUCTO, y este producto no tiene ninguna —
                // WP-V13 podó las dos históricas y WP-V23 cerró la configuración
                // en `aleph0.*`. Ofrecer un fichero ajeno bajo ese rótulo es la
                // misma falsedad, sólo que con el fichero presente.
                name: "SCHEMA DEFINITIONS",
                icon: "📋",
                description: "JSON schemas: los que envía la extensión y los del workspace",
                configs: this._getSchemaConfigs()
            },
            {
                name: "THEATRICAL CONTENT",
                icon: "🎭",
                description: "Theatrical agent configurations and content",
                configs: this._getTheatricalConfigs()
            },
            {
                name: "DEVELOPMENT CONFIGS",
                icon: "🛠️",
                description: "Build, test, and development configurations",
                configs: this._getDevConfigs()
            }
        ];
    }

    private _getExtensionSettings(): ConfigItem[] {
    // Use unscoped configuration to allow fetching values from multiple sections
    const allConfig = vscode.workspace.getConfiguration();
        const settings: ConfigItem[] = [];

        // Core extension settings (must match contributes.configuration in package.json)
        // WP-V23: espacio de nombres único `aleph0.*`. Las claves que no tenían
        // ningún lector se demolieron; este panel ya no las muestra.
        const extensionSettings = [
            { key: 'aleph0.superficie.statusBar.visible', name: 'Status Bar: Visible', description: 'Show/hide the hacker panel quick access buttons in status bar' },
            { key: 'aleph0.logging.level', name: 'Logging Level', description: 'Minimum log level to display' },
            { key: 'aleph0.logging.enabledCategories', name: 'Logging Categories', description: 'Log categories to enable' },
            { key: 'aleph0.logging.showTimestamp', name: 'Logging: Show Timestamp', description: 'Show timestamp in log entries' },
            { key: 'aleph0.logging.showLevel', name: 'Logging: Show Level', description: 'Show log level in log entries' },
            { key: 'aleph0.logging.showCategory', name: 'Logging: Show Category', description: 'Show category in log entries' },
            { key: 'aleph0.logging.showSource', name: 'Logging: Show Source', description: 'Show source in log entries' },
            { key: 'aleph0.logging.maxEntries', name: 'Logging: Max Entries', description: 'Maximum number of log entries to keep in memory' }
        ];

        extensionSettings.forEach(setting => {
            const value = allConfig.get(setting.key);
            settings.push({
                id: setting.key,
                name: setting.name,
                description: setting.description,
                type: 'vscode-setting',
                icon: '⚙️',
                value: value,
                settingKey: setting.key,
                category: 'extension'
            });
        });

        return settings;
    }

    /** Raíz contra la que se resuelve un activo, según su origen declarado. */
    private _raizDe(origen: OrigenActivo): string | undefined {
        return origen === 'paquete'
            ? this._extensionUri.fsPath
            : vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    }

    /**
     * Los schemas de validación, enumerados en los DOS sitios donde pueden
     * estar: el paquete —que es donde viven de verdad y de donde los toma
     * `contributes.jsonValidation`— y el workspace del usuario.
     *
     * Sin un solo nombre de fichero codificado: lo que se ofrece existe porque
     * se acaba de leer del directorio, no porque una lista lo prometa y un
     * `existsSync` tape el fallo. Los dos literales de estructura que quedan
     * —`'schemas'` y `'.schema.json'`— sí pueden caducar; quien lo caza es §1
     * del test, ejecutando, no la forma de este método.
     */
    private _getSchemaConfigs(): ConfigItem[] {
        const configs: ConfigItem[] = [];
        const vistos = new Set<string>();

        for (const origen of ['paquete', 'workspace'] as OrigenActivo[]) {
            const raiz = this._raizDe(origen);
            if (!raiz) { continue; }

            const schemaDir = path.join(raiz, 'schemas');
            if (!fs.existsSync(schemaDir)) {
                // El paquete SÍ los envía (`.vscodeignore` no los excluye y
                // `contributes.jsonValidation` los necesita). Si faltan, es un
                // defecto de empaquetado y se dice: nada de excepción silenciosa.
                if (origen === 'paquete') {
                    log.warn('El paquete no trae schemas/ — revisar empaquetado', { schemaDir });
                }
                continue;
            }

            for (const file of fs.readdirSync(schemaDir).filter(f => f.endsWith('.schema.json'))) {
                const filePath = path.join(schemaDir, file);
                // Quien desarrolla la extensión abre este mismo repositorio como
                // workspace: allí paquete y workspace son el MISMO fichero, y sin
                // esto se ofrecería dos veces —que es exactamente lo que pasaba
                // hasta hoy, repartido entre dos grupos distintos.
                if (vistos.has(filePath)) { continue; }
                vistos.add(filePath);

                const base = file.replace('.schema.json', '');
                configs.push({
                    id: `${origen}:${file}`,
                    name: base.replace(/-/g, ' ').toUpperCase(),
                    description: `JSON schema for ${base} validation (${origen})`,
                    type: 'config-file',
                    icon: '📋',
                    filePath: filePath,
                    category: 'schema',
                    origen
                });
            }
        }

        return configs;
    }

    /**
     * Contenido teatral **del usuario**. Se resuelve contra el workspace y eso
     * es correcto: `theatrical-content/` es una convención del usuario, no un
     * activo del paquete, y sigue cableada en `contributes.customEditors`. Que
     * un directorio falte aquí es descubrimiento, no una promesa incumplida.
     *
     * WP-V102 retira la tercera entrada, `src/theatrical` con patrón `*.ts`:
     *   · MEDIDO — `readdirSync('src/theatrical')` devuelve `['core']` y el
     *     filtro `.ts` deja CERO, porque la lectura no es recursiva. No producía
     *     nada ni siquiera con este repositorio abierto como workspace.
     *   · `src/**` está en `.vscodeignore`, así que ese directorio NO viaja en
     *     el paquete: ningún usuario instalado puede tenerlo.
     *   · Y ofrecía código fuente `.ts` bajo el rótulo «configuración».
     */
    private _getTheatricalConfigs(): ConfigItem[] {
        const configs: ConfigItem[] = [];
        const workspacePath = this._raizDe('workspace');

        if (!workspacePath) return configs;

        const theatricalDirs = [
            { dir: 'theatrical-content/configurations', name: 'Agent Configurations' },
            { dir: 'theatrical-content/content', name: 'Content Definitions' }
        ];

        theatricalDirs.forEach(config => {
            const dirPath = path.join(workspacePath, config.dir);
            if (fs.existsSync(dirPath)) {
                const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));

                files.forEach(file => {
                    const filePath = path.join(dirPath, file);
                    configs.push({
                        id: `theatrical-${file}`,
                        name: file,
                        description: `${config.name} - ${file}`,
                        type: 'config-file',
                        icon: '🎭',
                        filePath: filePath,
                        category: 'theatrical',
                        origen: 'workspace'
                    });
                });
            }
        });

        return configs;
    }

    /**
     * Ficheros de desarrollo **del usuario**. Aquí sí se nombran ficheros, y es
     * legítimo por dos razones que conviene no confundir con el defecto que
     * cierra este WP: (1) no son artefactos de ESTE producto sino convenciones
     * de terceros —npm, TypeScript, jest, VS Code—, y (2) el árbol del producto
     * los produce todos, cosa que el test comprueba EJECUTANDO. Filtrar por
     * existencia el árbol del usuario es descubrimiento; filtrar por existencia
     * los activos del propio producto es tapar un fallo.
     */
    private _getDevConfigs(): ConfigItem[] {
        const configs: ConfigItem[] = [];
        const workspacePath = this._raizDe('workspace');

        if (!workspacePath) return configs;

        const devFiles = [
            { file: 'package.json', name: 'Package Configuration', description: 'NPM package and extension manifest' },
            { file: 'tsconfig.json', name: 'TypeScript Config', description: 'TypeScript compiler configuration' },
            { file: 'tsconfig.build.json', name: 'Build TypeScript Config', description: 'TypeScript build configuration' },
            { file: 'jest.config.js', name: 'Jest Configuration', description: 'Jest testing framework configuration' },
            { file: '.vscode/tasks.json', name: 'VS Code Tasks', description: 'VS Code task runner configuration' },
            { file: '.vscode/launch.json', name: 'Debug Configuration', description: 'VS Code debug launch configuration' }
        ];

        devFiles.forEach(configFile => {
            const filePath = path.join(workspacePath, configFile.file);
            if (fs.existsSync(filePath)) {
                configs.push({
                    id: configFile.file,
                    name: configFile.name,
                    description: configFile.description,
                    type: 'config-file',
                    icon: '🛠️',
                    filePath: filePath,
                    category: 'development',
                    origen: 'workspace'
                });
            }
        });

        return configs;
    }
}