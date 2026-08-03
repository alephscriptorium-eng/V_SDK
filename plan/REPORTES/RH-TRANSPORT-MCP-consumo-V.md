# RH-TRANSPORT · consumo V del MCP producto H

| dato | valor |
| ---- | ----- |
| agente | worker-RH-transport (carril V, ajuste mínimo) |
| fecha | 2026-08-03 |
| tip base | `b856b9e` (RH-18) |
| cierra | discovery sin sibling · sin fixtures-only para producto |

## Cambio

- `src/experiencia/catalogFromEnv.ts` — lee `H_SDK_MCP_HOST` + `H_SDK_MCP_PORT`.
- `ExperienciaHService` / `ExperienciaSession` fusionan la fila env al catálogo.
- Tests: env contrato + discovery; integración real env-gated.

## Cómo apuntar a H vivo

```bash
# terminal H
cd C:/S_LAB/h-sdk
H_SDK_MCP_HOST=127.0.0.1 H_SDK_MCP_PORT=18765 bun run mcp

# terminal V / IDE
export H_SDK_MCP_HOST=127.0.0.1
export H_SDK_MCP_PORT=18765
# refresh experiencia → pending_external_contract (resources 0.1.0 reales)
```

Alternativa: fila launcher `{ id: h-sdk, port, capabilities: ['h.experiencia'] }`
con host del launcher.

## Evidencia

```text
H_SDK_MCP_HOST=127.0.0.1 H_SDK_MCP_PORT=<vivo> \
  npx jest tests/unit/experiencia/experienciaHService.test.ts \
  -t "MinimalMcpClient lee resources reales" --no-coverage
→ PASS (phase ≠ complete; resourceVersion 0.1.0)
```
