# Changelog

## 2026-10-14 — Universo web BeaTaN Group

### Añadido
- `index.html`: landing principal de BeaTaN Group con telaraña interactiva en canvas, cuatro universos con dirección de arte propia, proyectos reales (VÉNORA, Lumen & Umbra), filosofía y contacto configurable.
- `flavor/index.html`: landing gastronómica (carpeta antes vacía). Estado «en desarrollo», sin menú, precios ni pedidos inventados.
- `fest/index.html`: landing de eventos (carpeta antes vacía) con Proyecto Scorpio, fechas tentativas 14–16 nov 2026, cuenta regresiva y ficha honesta (lugar, line-up y boletería por confirmar).
- `records/index.html`: landing del sello con VÉNORA (tracklist, estreno 11 dic 2026, enlaces de streaming y redes del artista tomados de la app existente).
- `games/index.html`: catálogo con Lumen & Umbra.
- `assets/css/{beatan,home,brand}.css`, `assets/js/{beatan,web}.js`, `assets/svg/favicon.svg`: sistema de diseño compartido sin dependencias.
- `docs/`: inventario, arquitectura, easter eggs y este changelog.

### Sin cambios (protegido)
- `records/venora/**` y `games/fireandwater/**`: ningún archivo modificado, movido ni borrado (verificado con `git diff --stat`).

### Validación realizada
- Servidor estático local en la raíz del repo (`python -m http.server`) y navegador integrado:
  - Las cinco landings revisadas visualmente en escritorio (≈1024 px) y móvil (375 px).
  - Sin desbordamiento horizontal en móvil en ninguna página (`scrollWidth === clientWidth`).
  - Menú móvil: abre, cierra con Escape y devuelve el foco al botón.
  - Easter eggs 1, 2 y 4 probados (incluida la activación por teclado real).
  - Consola sin errores.
  - `/records/venora/` y `/games/fireandwater/` cargan desde los enlaces nuevos.
- Comprobación automática de enlaces: 14 rutas/recursos internos con HTTP 200, todas las anclas `#` existen.
- Enlaces externos con HTTP 200: BeaTaN Code, ONErpm, Instagram, YouTube, TikTok, Google Fonts.
- `node --check` sobre los dos archivos JS.

### No verificado
- Comportamiento con `prefers-reduced-motion` activo en un navegador real: solo revisado en código (CSS y JS).
- Lectores de pantalla reales, Safari/iOS y Firefox.
- Despliegue en el hosting de producción.
