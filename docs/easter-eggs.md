# Descubrimientos ocultos (easter eggs)

Todos son opcionales, no bloquean la navegación, no reproducen sonido, no redirigen ni recogen datos. Respetan `prefers-reduced-motion`.

| # | Nombre | Dónde | Cómo se activa | Qué pasa |
|---|---|---|---|---|
| 1 | **La araña colgante** | Todas las landings nuevas (oculta en pantallas < 600 px) | Hacer scroll; hacer clic o pulsar Enter sobre la araña | La araña baja por su hilo según el avance de la página (máx. 55 % de la ventana). Al tocarla sube y muestra una frase distinta cada vez. Es un `<button>` con etiqueta accesible. |
| 2 | **Pulsar la red** | Hero de la raíz | Clic/toque en la telaraña o botón «Toca la red» | Una onda viaja desde el punto tocado y la seda brilla con gotas de rocío. Al séptimo pulso la red se tiñe de rojo y aparece «Siete pulsos. La red te reconoce.» |
| 3 | **Hilos de marca** | Hero de la raíz (≥ 860 px) | Pasar el puntero sobre las etiquetas Flavor / Fest / Records / Code alrededor de la red | El radio de la telaraña que sostiene esa marca se ilumina en rojo. |
| 4 | **Modo «Seda roja»** | Todas las landings nuevas | Escribir `beatan` en cualquier parte que no sea un campo de texto, o el botón «Seda roja» del pie | La seda y las líneas de la interfaz se tiñen de rojo y el fondo gana un resplandor carmesí. Se recuerda en `localStorage` (si está disponible). Se desactiva igual. No usa modificadores ni bloquea ninguna tecla (no llama a `preventDefault`). |
| 5 | **Mensaje en consola** | Todas las landings nuevas | Abrir las herramientas de desarrollo | Un saludo con una pista sobre el modo «Seda roja». |
| 6 | **La araña en el pan** | `/flavor/` | Mirar con atención la ilustración | Una pequeña araña roja oscura está escondida en el pan de la hamburguesa. |
| 7 | **Surcos de telaraña** | Raíz (panel Records) y `/records/` | Mirar el vinilo; en la raíz, pasar el puntero o enfocar el panel | Los surcos del disco están cruzados por radios de telaraña; en la raíz el disco gira y el brazo baja solo al interactuar. |

## Implementación

- 1, 4, 5: `assets/js/beatan.js` + estilos `.bt-dangler`, `.bt-silk`, `.bt-toast` en `assets/css/beatan.css`.
- 2, 3: `assets/js/web.js` (función `pluck`, `highlight`).
- 6: SVG en línea dentro de `flavor/index.html`.
- 7: SVG en línea en `index.html` y `records/index.html`; animación en `home.css` / `brand.css`.

Los avisos usan un `role="status"` con `aria-live="polite"`, así que los lectores de pantalla los anuncian sin robar el foco.
