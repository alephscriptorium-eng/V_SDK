# RONDA 1 — DEVELOPMENT

## Tareas
- [x] Auditar `extension.ts`
- [x] Definir interfaces MCP (`src/mcpTypes.ts`)
- [x] Registrar comandos base (incl. `mcpSocketManager.activate`)

## Cambios Propuestos/Realizados
- Contratos MCP: `IMcpClient`, `IMcpServerDescriptor` (archivo `src/mcpTypes.ts`)
- OutputChannel existente: `MCP Socket Manager` (reutilizado)
- Activación robusta en `package.json` y `src/extension.ts`

## Notas Técnicas
- Mantener acoplamiento bajo entre UI y backend (patrón adaptador).

## Pruebas
- Activación de la extensión
- Listado de comandos

## Decisiones (ADR)
- ADR-001: MCP via HTTP con `mcp.json` dinámico.

## Bloqueos
- N/A

## Próximos Pasos
- Implementar TreeViews (R2)
