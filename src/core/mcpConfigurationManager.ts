import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AlephScriptConfiguration, MCPServerConfig, MCPServersConfig, MCPWebsConfig, UIConfig } from '../mcpTypes';
import { LogCategory, createLogger } from '../loggingManager';
import {
    resolveMeshSocketUrl,
    resolveLauncherPort,
    ZIGURAT_PENDING,
    ALEPH0_SECTION,
    MCP_CONFIG_PATH_SUBKEY,
} from '../config/ziguratSettings';

/**
 * Nombre del fichero de ópera que `initialize()` busca en la raíz del
 * workspace **del usuario** cuando `aleph0.mcp.configPath` está vacía.
 *
 * WP-V100 · D16 — POR QUÉ ESTO ES UNA CONSTANTE Y NO UN LITERAL MÁS.
 * Hasta aquí el nombre se COMPONÍA una vez (el `path.join` de `initialize()`)
 * y se DESCRIBÍA tres veces con un nombre distinto —«sample-config.json»—: en
 * el docstring del método, en el comentario de la rama y en el log que anuncia
 * el hallazgo. Tres menciones muertas contra dos vivas, todas sobre la MISMA
 * línea de código. Re-sincronizar las copias habría dejado intacto el
 * mecanismo que las desincronizó; la constante lo quita: lo que se abre, lo
 * que se anuncia en el log y lo que se le pide al usuario son hoy la misma
 * expresión, no tres cadenas gemelas que alguien tiene que mantener a mano.
 *
 * Lo que queda a mano es la PROSA (docstring y comentario), que no puede
 * interpolar. Ésa la vigila `tests/unit/core/mcpConfigurationManager.test.ts`:
 * enrojece si cualquier nombre de fichero citado en este módulo deja de ser
 * el valor de esta constante.
 *
 * Lo que este WP NO hace, y tiene dueño abierto: retirar la marca «Arrakis»
 * es **WP-V47**; que el usuario elija el nombre —y que `initialize()` deje de
 * adoptarlo y auto-escribirlo en los ajustes sin preguntar— es **WP-V32**
 * (hallazgo H-11, `plan/REPORTES/WP-V23-config-intencional.md:1027`). Aquí
 * sólo se hace que los nombres concuerden: cero cambio de conducta.
 *
 * CONVENCIÓN QUE ESTE MÓDULO SOSTIENE, y que el test vigila: un nombre de
 * fichero MUERTO se escribe entre comillas angulares —«así»— y uno VIVO va
 * con la constante o con su literal. Es la misma marca que ya llevan el
 * comentario del constructor (comandos podados) y el de `launcher` (clave
 * demolida): nombrar algo muerto está permitido si se DECLARA muerto.
 *
 * Los dos ficheros candidatos históricos —éste y «sample-config.json»— los
 * podó WP-V13 en `f615434`, así que «buscar el que decía el comentario» no
 * era opción: no existe ninguno. La búsqueda apunta al workspace del usuario,
 * no al repo de la extensión, de modo que la poda **degrada, no rompe**
 * (`plan/CENSO-V12.md:363`).
 */
export const OPERA_CONFIG_FILENAME = 'ArrakisTheater_OperaConfig.json';

export class McpConfigurationManager {
    private static instance: McpConfigurationManager;
    private config: AlephScriptConfiguration | null = null;
    private configPath: string | null = null;
    private readonly logger = createLogger(LogCategory.EXTENSION, 'McpConfigurationManager');

    private constructor() {
        // WP-V13: el volcado heredado a la consola anunciaba los comandos
        // ArrakisTheater.LoadConfig / .DownloadConfig, podados en este WP
        // (censo V12 §8, fila 18). Sin ellos el mensaje era una instrucción falsa.
    }

    static getInstance(): McpConfigurationManager {
        if (!McpConfigurationManager.instance) {
            McpConfigurationManager.instance = new McpConfigurationManager();
        }
        return McpConfigurationManager.instance;
    }

    /**
     * Initialize configuration from `ArrakisTheater_OperaConfig.json` or VS Code settings.
     *
     * WP-V100: este docstring decía «sample-config.json» — un fichero que este
     * método no ha buscado nunca. El nombre que compone la ruta es
     * `OPERA_CONFIG_FILENAME`; ver ahí por qué el defecto era de mecanismo.
     */
    async initialize(): Promise<void> {
        try {
            // Ruta del fichero de piezas MCP: única clave (WP-V23)
            const vscodeConfig = vscode.workspace.getConfiguration(ALEPH0_SECTION);
            let configPath = vscodeConfig.get<string>(MCP_CONFIG_PATH_SUBKEY);

            // If no path in settings, look for ArrakisTheater_OperaConfig.json in workspace
            if (!configPath && vscode.workspace.workspaceFolders) {
                const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
                const defaultConfigPath = path.join(workspaceRoot, OPERA_CONFIG_FILENAME);

                if (fs.existsSync(defaultConfigPath)) {
                    configPath = defaultConfigPath;
                    this.logger.info(`Found ${OPERA_CONFIG_FILENAME} at: ${configPath}`);
                    // Auto-update settings to remember this path
                    await this.updateVSCodeSettings(configPath);
                }
            }

            if (configPath && fs.existsSync(configPath)) {
                await this.loadConfigFromFile(configPath);
            } else {
                this.logger.warn(
                    `${ZIGURAT_PENDING} Sin archivo Opera ni flota inventada — configure aleph0.* o cargue ${OPERA_CONFIG_FILENAME}`
                );
                this.setEmptyPendingConfiguration();
            }
        } catch (error) {
            this.logger.error('Failed to initialize configuration:', error);
            this.setEmptyPendingConfiguration();
        }
    }

    /**
     * Load configuration from file
     */
    private async loadConfigFromFile(filePath: string): Promise<void> {
        try {
            const configContent = fs.readFileSync(filePath, 'utf8');
            this.config = JSON.parse(configContent) as AlephScriptConfiguration;
            this.configPath = filePath;
            this.logger.info(`Configuration loaded from: ${filePath}`);
        } catch (error) {
            this.logger.error(`Failed to load config from ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * Configuración vacía / pendiente (hostil-omite).
     * Sin rutas absolutas de otra máquina, sin flota fija, sin puertos inventados.
     */
    private setEmptyPendingConfiguration(): void {
        const launcherPort = resolveLauncherPort();

        this.config = {
            "app": {
                "type": "arrakis-theater-opera"
            },
            "launcher": {
                // WP-V23 · corrección D1: aquí venía `aleph0.ollama.baseUrl`.
                // La clave se demolió porque su única cadena de lectura estaba
                // muerta (`getOllamaUrl()` y `getLauncherConfig()`: 0 llamadas).
                "ollamaUrl": "",
                "requiredModel": "",
                "mcpServiceLauncherPort": launcherPort ?? 0,
                "healthCheckTimeout": 30000,
                "shutdownGracePeriod": 5000
            },
            "game": {
                "id": "",
                "name": "",
                "description": `${ZIGURAT_PENDING} sin configuración — aleph0.* / OperaConfig`,
                "mcpServerId": "",
                "graphId": "",
                "userId": "",
                "sessionId": "",
                "agentConfigs": []
            },
            "mcp": {
                "servers": {},
                "webs": {}
            },
            "orchestration": {
                "enableReplay": false,
                "replayBufferSize": 0,
                "enableLogging": true,
                "enableCrossChannelRouting": false,
                "messageTimeout": 10000
            },
            "ui": []
        };
        this.configPath = null;
        this.logger.info(`${ZIGURAT_PENDING} McpConfigurationManager en modo pendiente (servers/webs vacíos)`);
    }

    /**
     * Get MCP servers configuration
     */
    getMcpServers(): MCPServersConfig {
        return this.config?.mcp?.servers || {};
    }

    getMcpWebs(): MCPWebsConfig {
        return this.config?.mcp?.webs || {};
    }

    /**
     * Get specific MCP server configuration
     */
    getMcpServer(serverId: string): MCPServerConfig | undefined {
        return this.config?.mcp?.servers?.[serverId];
    }

    /**
     * Get all MCP server IDs
     */
    getMcpServerIds(): string[] {
        return Object.keys(this.config?.mcp?.servers || {});
    }

    /**
     * Get MCP server port
     */
    getMcpServerPort(serverId: string): number | undefined {
        return this.config?.mcp?.servers?.[serverId]?.port;
    }

    /**
     * Get launcher configuration
     */
    getLauncherConfig() {
        return this.config?.launcher;
    }

    /**
     * Get Ollama URL — del fichero de ópera; vacío = ⏳.
     * WP-V23 · D1: ya no consulta ajustes. No había clave que consultar con
     * efecto: este método no lo llama nadie (poda pendiente, ver reporte V23).
     */
    getOllamaUrl(): string {
        return this.config?.launcher?.ollamaUrl || '';
    }

    /**
     * Get MCP service launcher port — aleph0.pieza.launcher.port, luego archivo; undefined = ⏳.
     */
    getMcpServiceLauncherPort(): number | undefined {
        const fromSettings = resolveLauncherPort();
        if (fromSettings !== undefined) {
            return fromSettings;
        }
        const fromFile = this.config?.launcher?.mcpServiceLauncherPort;
        if (typeof fromFile === 'number' && fromFile > 0) {
            return fromFile;
        }
        return undefined;
    }

    /**
     * Get UI configurations
     */
    getUiConfigs(): UIConfig[] {
        return this.config?.ui || [];
    }

    /**
     * Get specific UI configuration
     */
    getUiConfig(uiId: string): UIConfig | undefined {
        return this.config?.ui?.find(ui => ui.id === uiId);
    }

    /**
     * Socket URL por defecto: aleph0.ciudad.*, luego UI primaria del archivo.
     *
     * ⚠️ WP-V23 · D2 — ESTE MÉTODO SÍ INVENTA HOST. El comentario anterior
     * decía «no inventa localhost:puerto» y la línea de abajo lo desmiente:
     * sin ajuste, si el fichero de ópera trae una UI primaria con puerto,
     * devuelve `ws://localhost:<puerto>` — un valor plausible y equivocado,
     * sin ⏳, sin log y sin nombrar la clave que falta.
     *
     * **6 llamadas** consumen este valor: `bootstrap/assembleContext.ts:109`,
     * `socketMonitor.ts:282` (desde su wrapper privado homónimo de `:278`) y
     * `socketMonitor.ts:308`, `treeViews/configsTreeView.ts:472`,
     * `treeViews/socketsTreeView.ts:85,232`.
     *
     * ⚠️ WP-V100 — LAS COORDENADAS DE ARRIBA ESTABAN MAL Y EL BARRIDO LAS
     * APROBABA. Este bloque decía `:280`/`:276`/`:643`/`:429` y `:428-430`:
     * las cinco RESUELVEN a líneas existentes, así que un barrido que sólo
     * comprueba que el fichero tiene esa línea las da por buenas. Cuatro
     * llevaban deriva corta (+2, +2, +8) y una era otro sitio entero
     * —«socketMonitor.ts:643» es JavaScript de la webview, no una llamada—.
     * Es el MISMO mecanismo que D16 en este fichero: una cita que resuelve y
     * miente. El conteo («6 llamadas») sí era verdadero. Re-medido y fijado
     * por `tests/unit/core/mcpConfigurationManager.test.ts`, que enrojece si
     * cualquiera de estas coordenadas deja de nombrar el método.
     *
     * Y devolver `''` **tampoco salva la superficie**: `socketsTreeView.ts:92`
     * convierte el vacío en `'localhost:3000'` (y el caso de arriba lo pinta
     * como `localhost:7777`, sin esquema). `configsTreeView.ts:474`
     * **escribe** este valor en el fichero que genera, en 2 de sus 3
     * plantillas (`:483` y `:499`): lo que persiste es el retorno de este
     * método. El invento ocurre con o sin fichero de ópera.
     *
     * ⚠️ WP-V101 — DOS CORRECCIONES A ESTE MISMO BLOQUE, y las dos son de la
     * familia que este fichero documenta:
     *
     *   · LAS COORDENADAS DE `configsTreeView.ts` VOLVIERON A DERIVAR, y esta
     *     vez las movió el WP siguiente al que las fijó. V100 declaró el coste
     *     («si alguien mueve esas líneas, el rojo aparece aquí») y se cumplió a
     *     la primera: su test enrojeció por una edición legítima que no cambió
     *     ningún hecho. Es la quinta generación de la misma deriva.
     *
     *     Y AQUÍ VA EL MATIZ, PORQUE LA VERSIÓN CORTA DE ESTO ERA FALSA: el
     *     instrumento de anclas (`scripts/anclas-censo.mjs`) **no** es inmune
     *     al desplazamiento sin más. **Anclar el HECHO —qué token, en qué
     *     fichero, cuántas veces— sí lo es; anclar la CITA de un documento
     *     vivo NO lo es, y a cambio te escribe la corrección exacta.** Que
     *     siguiera verde sobre la edición de `configsTreeView.ts` no prueba lo
     *     primero: prueba que ningún ancla cubre ese fichero. Sobre uno que sí
     *     cubre, un desplazamiento que no cambia ningún hecho lo pone rojo en
     *     su mitad de citas. Medido, no supuesto.
     *     (El registro no se nombra aquí a propósito: §2 de este módulo
     *     prohíbe nombres `.json` vivos ajenos, y la convención «…» marca
     *     nombres MUERTOS — usarla para uno vivo sería mentir.)
     *   · «sólo cae al literal cuando no hay config cargada» ERA VERDAD Y YA NO
     *     LO ES. Hoy cae al literal siempre que la URL sale vacía, venga de
     *     donde venga: `isConfigLoaded()` preguntaba «¿hay fichero de ópera?»,
     *     no «¿tengo URL?», y el `''` acababa persistido en un campo que los
     *     schemas empaquetados declaran `required` con `pattern: "^wss?://"`.
     *
     * Aquí sólo se corrige la MENTIRA del comentario: quitar el `localhost`
     * es cambio de conducta y cae en WP-V31 (endpoints por variable, nunca
     * por número). Ver `plan/REPORTES/WP-V23-config-intencional.md` §12-DD2.
     */
    getDefaultSocketUrl(): string {
        const fromSettings = resolveMeshSocketUrl();
        if (fromSettings) {
            return fromSettings;
        }
        const primaryUi = this.config?.ui?.find(ui => ui.config.isPrimary);
        const port = primaryUi?.config?.port;
        if (typeof port === 'number' && port > 0) {
            return `ws://localhost:${port}`;
        }
        return '';
    }

    /**
     * Get orchestration configuration
     */
    getOrchestrationConfig() {
        return this.config?.orchestration;
    }

    /**
     * Get game configuration
     */
    getGameConfig() {
        return this.config?.game;
    }

    /**
     * Get the full configuration object
     */
    getFullConfig(): AlephScriptConfiguration | null {
        return this.config;
    }

    /**
     * Check if configuration is loaded
     */
    isConfigLoaded(): boolean {
        return this.config !== null;
    }

    /**
     * Reload configuration from file
     */
    async reloadConfig(): Promise<void> {
        if (this.configPath) {
            await this.loadConfigFromFile(this.configPath);
        } else {
            await this.initialize();
        }
    }

    /**
     * Update VS Code settings to point to the configuration file
     */
    async updateVSCodeSettings(configPath: string): Promise<void> {
        // WP-V23: una sola clave que escribir (antes se escribían dos con el
        // mismo valor, en dos espacios de nombres distintos).
        const config = vscode.workspace.getConfiguration(ALEPH0_SECTION);
        await config.update(MCP_CONFIG_PATH_SUBKEY, configPath, vscode.ConfigurationTarget.Workspace);

        this.logger.info(`Updated VS Code settings to use configuration file: ${configPath}`);
    }

    /**
     * Get the current configuration file path
     */
    getConfigurationPath(): string | null {
        return this.configPath;
    }

    /**
     * Save current configuration to the loaded file (if any)
     */
    async saveConfiguration(): Promise<void> {
        if (!this.configPath || !this.config) {
            throw new Error('No configuration file loaded or no configuration to save');
        }

        try {
            const configJson = JSON.stringify(this.config, null, 2);
            fs.writeFileSync(this.configPath, configJson, 'utf8');
            this.logger.info(`Configuration saved to: ${this.configPath}`);
        } catch (error) {
            this.logger.error(`Failed to save configuration to ${this.configPath}:`, error);
            throw error;
        }
    }

    /**
     * Update a specific section of the configuration
     */
    async updateConfiguration(updates: Partial<AlephScriptConfiguration>): Promise<void> {
        if (!this.config) {
            throw new Error('No configuration loaded');
        }

        // Deep merge the updates
        this.config = this.mergeConfigurations(this.config, updates);

        // Save if we have a file path
        if (this.configPath) {
            await this.saveConfiguration();
        }
    }

    /**
     * Deep merge two configuration objects
     */
    private mergeConfigurations(base: AlephScriptConfiguration, updates: Partial<AlephScriptConfiguration>): AlephScriptConfiguration {
        const result = JSON.parse(JSON.stringify(base)); // Deep clone

        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                const value = updates[key as keyof AlephScriptConfiguration];
                if (value !== undefined) {
                    if (typeof value === 'object' && !Array.isArray(value)) {
                        result[key as keyof AlephScriptConfiguration] = {
                            ...result[key as keyof AlephScriptConfiguration],
                            ...value
                        };
                    } else {
                        result[key as keyof AlephScriptConfiguration] = value;
                    }
                }
            }
        }

        return result;
    }
}
