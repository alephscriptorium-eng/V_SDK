/**
 * Probe WP-V71 · guion que arranca el código VIVO.
 *
 * Importa los módulos reales (no copias, no espejos) y los ejercita por sus
 * caminos migrados, para que las líneas capturadas sean las que la extensión
 * escribiría de verdad en «Output → Aleph-0».
 */
import { ProcessManager } from '../../src/processManager';
import { getLogger } from '../../src/core/logging';
import { LogCategory } from '../../src/loggingManager';

export async function conducir(): Promise<void> {
    // 1 · Arranque real de la extensión: el primer emisor del ciclo de vida.
    //     Réplica del punto vivo `src/extension.ts:16`.
    getLogger('extension', LogCategory.EXTENSION).info('AlephScript Extension is activating...');

    // 2 · ProcessManager REAL, por su API pública. Cada línea que salga de aquí
    //     la emite `src/processManager.ts`, no esta probe.
    const procesos = ProcessManager.getInstance();

    //     Lanzamiento con un token en la línea de comando: el caso que CA4 debe
    //     cerrar. Se pasa a propósito por la API pública, sin tocar el logger.
    await procesos.startProcess(
        'launcher',
        'node',
        ['launcher.js', '--api-key', 'sk-live-NO-DEBE-APARECER', '--port', '3000'],
        '/home/ada/proyectos/zigurat',
        3000
    );

    //     Segundo arranque del mismo proceso: rama «ya está corriendo».
    await procesos.startProcess('launcher', 'node', ['launcher.js'], '/tmp', 3000);

    //     Parada: otra operación, con su propio op=.
    await procesos.stopProcess('launcher');

    //     Parada de algo inexistente: rama de ausencia honesta.
    await procesos.stopProcess('no-existe');

    // 3 · Fallo con excepción: la pila es lo que se diagnostica en remoto.
    //     Réplica del punto vivo `src/core/managerFactory.ts:149`.
    const fallo = new Error('ECONNREFUSED 127.0.0.1:3000');
    getLogger('ManagerFactory', LogCategory.EXTENSION).error('Error disposing manager', {
        managerId: 'webView',
        error: fallo
    });

    // 4 · Superficie no confiable: payload de un par del mesh con credenciales.
    //     Réplica del punto vivo `src/core/AracneBotService.ts:197`.
    getLogger('AracneBot', LogCategory.SOCKET).info('Received VSCODE_COMMAND request', {
        data: {
            command: 'aleph0.abrirPanel',
            authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.PAYLOAD.FIRMA',
            author: 'ada@lovelace.dev'
        }
    });

    // 5 · URL del mesh con credenciales inline.
    //     Réplica del punto vivo `src/libs/alephscript-client.ts:96`.
    getLogger('AlephScriptClient', LogCategory.SOCKET).info('Connected', {
        client: 'vscode-extension',
        url: 'https://ada:CONTRASENA@mesh.local:3000/runtime?token=abc123',
        socketId: 'k3Jd9'
    });

    // 6 · Aviso de ausencia: sin runtime, ⏳ honesto (no error fatal).
    getLogger('AracneBot', LogCategory.SOCKET).warn(
        '⏳ aleph0.mesh.baseUrl (o host+port) no configurado — sin cliente Socket.IO'
    );
}
