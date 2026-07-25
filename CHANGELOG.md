# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/es/1.1.0/);
versionado [SemVer](https://semver.org/lang/es/). Las entradas se
derivan del backlog cerrado (`plan/BACKLOG.md`) — se copian los WP ✅,
no se inventa texto.

## [Unreleased]

## [0.2.0] — 2026-07-25 · re-release local Ola F (sin Release público: DV-14 deferred)

Gate **R6-V PASS** · acta: `plan/REPORTES/ACTA-RE-RELEASE-0.2.0.md`.

### Changed

- **WP-V14 · Marca del producto** — la cara de usuario pasa a
  **Aleph-0 (ℵ₀)**: displayName, configuration.title, categorías,
  contenedor de actividad con icono propio, README; licencia canónica
  por regla escrita del ecosistema (puntero Animus Iocandi +
  GPL-3.0-or-later, patrón g-sdk).
- **WP-V15 · Espacios de nombres** — extension-id
  `scriptorium.aleph-0`; 99/99 comandos bajo prefijo `aleph0.`
  (4 excepciones `.focus` declaradas); 13 claves de settings →
  `aleph0.*` con tabla de migración en README; guía de prueba v2.
- **WP-V16 · Falsedad silenciosa** — el probe importa el parser real
  (rompe al mutarlo, demostrado); nombre del `.vsix` derivado de la
  versión sin literales; lint real que puede fallar; guardas del
  release declaradas (⏳ estáticas); tabla de qué verifica el pipeline.
- **WP-V17 · Puerta de permisos** — la ausencia de `reparto_required`
  deja de conceder permiso (fail-closed + ⏳ honesto); 36 tests de
  invariantes del contrato; verificado además contra servidor vivo en
  el gate (payload real publica la clave y los 8 motivos).

### Removed

- **WP-V13 · Poda** — 23 filas del censo + 1 poda de nivel comando:
  árbol 552→300 ficheros; `coverage/` destrackeado; tag de archivo
  `archive/pre-poda-ola-f` previo a todo borrado (DV-12).

### Added

- **WP-V12 · Censo y veredicto** — `plan/CENSO-V12.md`: 69 filas
  (27 queda / 19 re-contenido / 23 poda) con mapa de arrastre; errata
  post-fusión asentada.

## [0.1.0] — 2026-07-25 · v1 «lista para probar» (Olas 0–D · R5-V)

WP-V01…WP-V10: fundación del carril, import del legado, dependencia
standalone, empaquetado v0, config única, catálogo dinámico, identidad
y lectura, mutación y autoría, elenco, v1 + Release `v0.1.0`.
Detalle: `plan/BACKLOG.md` y `plan/REPORTES/WP-V0*.md`.
