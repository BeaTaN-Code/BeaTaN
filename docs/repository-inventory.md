# Inventario del repositorio — beatan.com.co

Fecha de inspección: 2026-10-14 · Rama `main` · árbol de trabajo limpio al empezar (commit `b2f64d6`).

## Hechos confirmados

### Estructura previa al trabajo de la landing

| Ruta | Estado | Contenido |
|---|---|---|
| `/` (raíz) | **Sin punto de entrada.** No había `index.html`, `index.php`, `.htaccess`, `robots.txt` ni `sitemap.xml`. | Solo carpetas. |
| `/fest/` | **Vacía** (0 archivos; Git no la rastrea porque no tiene archivos). | — |
| `/flavor/` | **Vacía** (0 archivos; Git no la rastrea). | — |
| `/games/` | Sin `index.html` propio. | Solo contiene `fireandwater/`. |
| `/games/fireandwater/` | **Proyecto funcional y protegido.** | Build estático de Vite: `index.html`, `favicon.svg`, `assets/index-*.js`, `assets/index-*.css`, `assets/p2p-*.js`. |
| `/records/` | Sin `index.html` propio. | Solo contiene `venora/`. |
| `/records/venora/` | **Proyecto funcional y protegido.** | Build de React/Vite: `index.html`, `favicon.svg`, `icons.svg`, `assets/` (app.js, app.css, imágenes y versiones `web/`), `audio/` (wav, mp3, preview, story). ~459 MB. |

No existe `package.json`, lockfile, `node_modules/`, `dist/`, `.env` ni configuración de build en la raíz: ambos proyectos se suben ya compilados.

### `/games/fireandwater/` — «Lumen & Umbra»

- Título real: **Lumen & Umbra**. Descripción en su propio `<meta>`: plataformas cooperativo elemental, en solitario u online con un amigo mediante código de invitación.
- Multijugador navegador-a-navegador (`meta name="lumen-umbra-server"` vacío = sin servidor).
- Rutas de assets **relativas** (`./assets/...`): funciona en cualquier subruta.
- Hay builds antiguos (`index-CG7OzYAG.css`, `index-DnKnZr36.js`, `p2p-CjLwB4Bc.js`) que el `index.html` actual ya no referencia. **No se tocan**: borrarlos no es necesario y podría romper cachés.
- Textos internos en inglés y español.

### `/records/venora/` — «VÉNORA»

- Título: `VÉNORA — JOBICK C. | BeaTaN Records`. Álbum conceptual de **Jobick C.** con Lado A (*La Euforia*) y Lado B (*La Caída*).
- Rutas de assets **absolutas** (`/records/venora/assets/...`): solo funciona servido desde la raíz del dominio. Al probarlo localmente hay que levantar el servidor en la raíz del repo.
- `og:image` apunta a `https://beatan.com.co/records/venora/assets/web/cover.jpg`.
- Datos verificados dentro de `assets/app.js`:
  - Tracklist: 01 Bicho, 02 Muévelo, 03 Old School, 04 Sin Presión, 05 Pégate Lento, 06 Amor Inocente, 07 Fuimos, 08 Déjame Ir, 09 No Me Mires Así, 10 Nunca de Mí.
  - Enlace de streaming: `https://onerpm.link/293158401189`.
  - Redes del artista: Instagram `@jobick_c_music`, YouTube `@JobickC`, TikTok `@jobickc`.

### Historial reciente

- `281718f` añadió `/shop/` (PHP + `.htaccess`) y `b2f64d6` lo revirtió. Señala que el hosting ejecuta Apache/PHP, pero **no se reintroduce nada de `/shop/`**.

### Verificaciones externas (2026-10-14)

- `https://beatancode.com/master/index.html` → HTTP 200, TLS válido (curl sin errores de verificación). `<title>BeaTaNCode</title>`; descripción: desarrollo web, e-commerce, automatizaciones. No se inspeccionó código fuente ni backend.
- `https://beatan.com.co/records/venora/` → HTTP 200 (Vénora está desplegada en producción).

## Supuestos (no verificados)

- El hosting es Apache compartido y sirve `index.html` como índice de directorio (consistente con el `.htaccess` del commit revertido).
- `https://beatan.com.co/` es la URL canónica pública de la raíz una vez desplegada la landing.
- No se recibieron logos oficiales en el repositorio: las imágenes de marca vistas en conversación no están en el sistema de archivos.

## Archivos protegidos (no modificar)

- Todo `games/fireandwater/**`
- Todo `records/venora/**`

## Rutas libres usadas por el trabajo nuevo

`/index.html`, `/assets/`, `/docs/`, `/flavor/index.html`, `/fest/index.html`, `/records/index.html`, `/games/index.html` — ninguna existía antes.
