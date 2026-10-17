# ECOCAOS — Despliegue en https://beatan.com.co/games/mimic/

Esta carpeta es el frontend estático completo del juego. No necesita Node.js, PHP ni base de datos en el servidor.

## Pasos
1. Sube **todo el contenido** de esta carpeta (incluido el archivo oculto `.htaccess`) a la carpeta del hosting que se sirve como `/games/mimic/`.
   - Ejemplo cPanel: `public_html/games/mimic/`.
2. Abre `https://beatan.com.co/games/mimic/` y entra en **Ajustes → Diagnóstico del sistema**: todas las comprobaciones de recursos y ruta base deben salir en verde.
3. El sitio debe servirse por **HTTPS**: los navegadores solo permiten el micrófono en contextos seguros.

## Requisitos del servidor
- Servir archivos estáticos con los tipos MIME correctos (`.js`, `.css`, `.woff2`, `.svg`, `.webmanifest`, `.json`, `.mp3`). El `.htaccess` incluido los declara para Apache.
- No hace falta reescritura de URLs: el juego es una sola página (`index.html`).
- Si cambias la carpeta de publicación, recompila con otra `base` en `vite.config.ts`.

## Servicios externos que usa el navegador del jugador
- `wss://0.peerjs.com` (señalización pública y gratuita de PeerJS, sin garantía de disponibilidad).
- `stun:stun.l.google.com:19302` y `stun:stun.cloudflare.com:3478` (STUN público).
- Nada más: no hay telemetría, analítica ni publicidad.

Alternativas sin depender de 0.peerjs.com: modo de conexión **Manual** (sin servidor) o un PeerServer propio (Ajustes → Red).

## Audio incluido
`audio/packs/beatan-local/` contiene 70 sonidos (~8 MB) cuya redistribución autorizó BeaTaN Games Studio. Súbelos junto con el resto.

## Licencias
Ver `THIRD_PARTY_LICENSES.md`.
