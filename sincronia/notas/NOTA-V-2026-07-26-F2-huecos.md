# NOTA · V · F2 — respuesta honesta: **no estaría lista**, y estos son los huecos

| dato | valor |
| ---- | ----- |
| Emisor | carril **V** · Aleph-0 (ℵ₀) |
| Pregunta | si mañana el swarm cierra el backlog, ¿está lista la extensión? |
| **Respuesta** | **No.** Con los 45 de F2 tendrías una extensión que **habla con la Ciudad**; no un **producto VS Code terminado** |
| Backlog | `C:\S_LAB\v-sdk\plan\BACKLOG.md` — ahora **63 WPs / 13 lanes** |

## Por qué no

Los lanes A–K resuelven **el dominio**: entrar, ver, mandar, configurar,
observar, saldar deuda. Ninguno resuelve **el envase**. Si el swarm los
cierra todos y nadie mira lo que faltaba, sale algo que funciona en la
máquina donde se escribió y se rompe en la de al lado.

## Los tres huecos que me quitarían el sueño

| # | hueco | por qué es grave |
| - | ----- | ---------------- |
| **1** | **No hay arnés de Extension Host** (`WP-V68`, ahora `P0`) | **Nada interactivo se verifica jamás.** No es casualidad que los pasos 5–10 de mi guía lleven dos rondas en `⏳`: no es pereza, es que **no existe la herramienta**. Sin esto, «lista» seguirá siendo una opinión mía, y ya sabemos lo que vale un `✅` sin evidencia |
| **2** | **Nadie gobierna la ejecución del swarm** (`WP-V77`/`V78`, `P0`) | En mi Ola F tres WPs tocaban `package.json` y hubo que secuenciarlos a mano — y **aun así el lote se rompió**. Con 60 WPs y sin grafo de contención, mañana se pisan seguro. `package.json` lo tocan cinco WPs; `extensionBootstrap.ts`, tres |
| **3** | **Los webviews no tienen CSP** (`WP-V66`) | Cuatro paneles con HTML propio y sin política de contenido. Es un agujero de seguridad y además choca de frente con el **cerco**: hoy nada me impide que uno cargue de fuera |

## Los otros doce

Ciclo de vida y activación perezosa · estado persistente declarado y
regenerable · **superficie de error** (hoy tengo el principio `⏳` pero no
la pantalla) · resiliencia cuando el mesh cae y vuelve · tema y
accesibilidad (mis paneles heredados ignoran el tema del usuario) · canal
de log para depurar en máquina ajena · menús y `when` coherentes ·
multi-root y workspace sin carpeta · primer arranque · coste de
activación · migración de ajustes y `engines.vscode` real ·
desinstalación limpia.

Y uno que me señala a mí mismo: **`WP-V76` · CA del centro vacío**. Llevo
toda la sesión diciendo que el centro es del usuario y **no tengo ni una
prueba que lo verifique**. Es exactamente la clase de afirmación que yo
mismo rechazaría de otro.

## Qué pediría antes de soltar el swarm

★ Por orden, y son tres:

1. **`WP-V77` primero, siempre.** El grafo de contención antes que
   cualquier lote. Sin él, paralelizar es apostar.
2. **`WP-V68` en el primer lote.** El arnés de test antes que las
   superficies que va a tener que probar. Construir vistas sin poder
   ejecutarlas es fabricar `⏳` a escala.
3. **`WP-V79`** (plantilla de brief con las trampas ya censadas: `npx`
   roto, `coverage/` trackeado, `.map` y locks colándose en el `.vsix`,
   evidencia contra artefacto real). Un worker nuevo no debería volver a
   tropezar en nada de eso: ya está pagado.

## Lo que sí estaría

Con A–K cerrados: entra a la Ciudad, la ve sin mentir, la manda, edita el
env de la demo, lee volúmenes distinguiendo manifiesto de estado, y no
arrastra la deuda vieja. **Es mucho.** Solo que «lo que hace» y «estar
lista» no son la misma frase, y prefiero decirlo hoy que descubrirlo
contigo delante de una instalación ajena.

— **V** · Aleph-0 (ℵ₀)
