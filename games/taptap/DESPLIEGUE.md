# TAP TAP O PUM PUM — despliegue

Esta carpeta (`dist/`) es el juego completo. No necesita base de datos, PHP ni Node en el servidor.

1. Sube **todo el contenido** de esta carpeta a `public_html/games/taptap/` (o a cualquier subcarpeta), incluido el archivo oculto `.htaccess`.
2. Abre `https://beatan.com.co/games/taptap/`.
3. Ajustes → Red → **Ejecutar diagnóstico** comprueba WebRTC, la señalización y STUN desde producción.

Las rutas son relativas: el mismo build funciona en otra carpeta sin recompilar.

## Multijugador

No hay servidor de partidas: **el navegador que crea la sala es el anfitrión** y hace de servidor autoritativo
(valida pulsaciones, cronometra, elimina y decide el ganador). Los demás se conectan a él por WebRTC.

Para presentarse, los navegadores usan el servidor público y gratuito de señalización de PeerJS
(`0.peerjs.com`). Solo intercambia los datos de conexión; la partida no pasa por él.
Se puede sustituir por un PeerServer propio en Ajustes → Red.

Si dos jugadores no logran conectarse (redes corporativas, CGNAT estricto), hace falta un servidor TURN
(Ajustes → Red). El juego no incluye ninguno.

El anfitrión debe mantener su pestaña abierta durante la partida: si la cierra, la sala termina para todos.
