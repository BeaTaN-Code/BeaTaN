# Arquitectura — beatan.com.co

## Mapa del ecosistema

```
BeaTaN Group  (/)                         landing principal — nueva
├── BeaTaN Flavor   (/flavor/)            landing de marca — nueva, estado: en desarrollo
├── BeaTaN Fest     (/fest/)              landing de marca — nueva, Proyecto Scorpio en planeación
├── BeaTaN Records  (/records/)           landing del sello — nueva
│   └── VÉNORA      (/records/venora/)    PROTEGIDO — app React/Vite existente
├── BeaTaN Code     https://beatancode.com/master/index.html   EXTERNO — dominio y servidor propios
└── BeaTaN Games    (/games/)             catálogo — nuevo (categoría de proyectos, no empresa)
    └── Lumen & Umbra (/games/fireandwater/)   PROTEGIDO — build Vite existente
```

BeaTaN Code **no** vive en este repositorio. Solo se enlaza con `<a target="_blank" rel="noopener noreferrer">` y un texto para lectores de pantalla que avisa de la pestaña nueva. No se comparte autenticación, base de datos, despliegue ni assets.

## Archivos nuevos

```
index.html                 landing BeaTaN Group
flavor/index.html          landing BeaTaN Flavor
fest/index.html            landing BeaTaN Fest
records/index.html         landing BeaTaN Records (no toca records/venora/)
games/index.html           catálogo BeaTaN Games (no toca games/fireandwater/)
assets/css/beatan.css      sistema de diseño compartido (tokens, cabecera, pie, botones, chips, easter eggs)
assets/css/home.css        estilos exclusivos de la landing principal
assets/css/brand.css       base de páginas de marca + temas por marca (body[data-brand])
assets/js/beatan.js        menú, revelado, araña colgante, modo «Seda roja», cuenta regresiva, toast
assets/js/web.js           telaraña interactiva en canvas (solo en la raíz)
assets/svg/favicon.svg     marca provisional (araña geométrica original)
docs/*.md                  esta documentación
```

## Decisiones técnicas

- **HTML + CSS + JavaScript sin dependencias.** Sin bundler, sin Node en tiempo de ejecución, sin frameworks. Apto para hosting compartido (Apache sirve `index.html` como índice de directorio).
- **Rutas relativas** en todas las páginas nuevas (`assets/...` en la raíz, `../assets/...` en subcarpetas). Funcionan en el dominio y con cualquier servidor estático local levantado en la raíz del repo.
- **Vénora usa rutas absolutas** (`/records/venora/...`): para probarla localmente el servidor debe servir la raíz del repositorio.
- **Aislamiento:** todas las clases nuevas usan prefijo `bt-`. Ni Vénora ni Lumen & Umbra cargan `assets/`; las landings nuevas no cargan nada de sus carpetas excepto la imagen `records/venora/assets/web/cover.jpg` (solo lectura) como portada.
- **Mejora progresiva:** sin JavaScript todo el contenido y la navegación funcionan; la telaraña cae a un SVG estático y los elementos con revelado aparecen visibles.
- **Movimiento reducido:** `prefers-reduced-motion` desactiva animaciones CSS, el tejido inicial y la reacción al puntero del canvas; la red se dibuja una vez, estática.
- **Rendimiento del canvas:** el bucle `requestAnimationFrame` solo corre mientras hay energía (tejido inicial, puntero en movimiento, pulsos) y el canvas es visible (IntersectionObserver + `visibilitychange`). En reposo no hay redibujado continuo. DPR limitado a 2.
- **Tipografías:** Google Fonts (Syne, Instrument Serif, Manrope, IBM Plex Mono) con `display=swap`; los dos proyectos existentes ya cargan Google Fonts, así que no se introduce un tercero nuevo.
- **SEO:** cada página tiene `title`, `description`, Open Graph y `canonical` sobre `https://beatan.com.co/` (dominio verificado en producción). No se creó `robots.txt` ni `sitemap.xml` (no existían; ver pendientes).

## Sistema de diseño

| Token | Valor | Uso |
|---|---|---|
| `--bt-ink` | `#07060a` | fondo base |
| `--bt-text` | `#ece8e6` | texto principal |
| `--bt-muted` | `#a8a2a4` | texto secundario (≈ 8:1 sobre fondo) |
| `--bt-red` / `--bt-red-text` | `#e3262f` / `#ff5c63` | acento del grupo / acento apto para texto |
| `--bt-accent*` | por marca | Flavor ámbar, Fest violeta, Records rojo, Games violeta/dorado, Code cian (solo en su panel) |

Cada marca comparte cabecera, pie, rejilla y tipografía, pero cambia acento, tono de fondo e ilustración: se ven emparentadas, no idénticas.

## Identidad provisional

No se recibieron logos oficiales en el repositorio. La marca usa un wordmark tipográfico («BeaTaN») y una araña geométrica original dibujada en SVG. Ambos son provisionales y fáciles de reemplazar (el SVG está repetido en línea en cada cabecera/pie y en `assets/svg/favicon.svg`).

## Contacto y datos configurables

`index.html` → sección `#contacto`: marcada con el comentario `CONFIGURABLE`. Correo y redes del grupo figuran como «Por anunciar» porque no hay canales oficiales verificados. Las redes que sí aparecen (Instagram, YouTube y TikTok de Jobick C.; enlace de streaming de ONErpm) se tomaron del bundle publicado de Vénora.

## Monetización futura (desactivada)

No hay anuncios, analítica, pagos ni suscripciones. No se cargó ningún script publicitario ni se inventó un ID de AdSense.

Posibles ubicaciones cuando haya contenido útil y políticas cumplidas:
- Un futuro blog/notas de lanzamientos de Records (contenido editorial real).
- Una futura sección de guías/recetas de Flavor (si existe contenido propio).
- Nunca en: páginas de estado «en desarrollo», la experiencia de Vénora, el juego, formularios o páginas vacías.

Oportunidades de producto basadas en lo que existe (solo ideas, nada construido):
- Records: preventa/merch o edición física de VÉNORA cuando haya distribución confirmada.
- Fest: boletería oficial de Proyecto Scorpio cuando existan fechas, lugar y proveedor confirmados.
- Games: versión con más niveles o soporte de donaciones para Lumen & Umbra si gana jugadores.
- Code: el sitio externo ya ofrece servicios; la landing solo dirige tráfico hacia él.

## Pendientes recomendados

- Confirmar canales oficiales de contacto y redes del grupo, y reemplazar los «Por anunciar».
- Crear una imagen Open Graph (1200×630, raster) para la raíz y las marcas; hoy solo Records tiene `og:image` (portada de Vénora).
- Valorar `robots.txt` y `sitemap.xml` tras el despliegue.
- Sustituir la marca provisional por logos oficiales cuando existan.
- Proyecto Scorpio: actualizar `fest/index.html` cuando haya lugar, line-up o boletería confirmados (las fechas actuales son tentativas).
