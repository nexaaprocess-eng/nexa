# NEXA Process: web (beta)

Web corporativa de **NEXA Process**: automatización de procesos de empresa con inteligencia artificial.

Es una web estática (HTML, CSS y JavaScript), sin dependencias ni proceso de compilación.

## Estructura

```
index.html        Página principal
faq.html          Preguntas frecuentes (enlazada desde el menú)
css/styles.css    Estilos, colores y animaciones
js/main.js        Interacciones: menú, animaciones al hacer scroll, demo de facturas, contadores
assets/logo.svg   Logo completo en vectorial
assets/favicon.svg  Símbolo "X" (icono de la pestaña)
```

Colores de marca (definidos al principio de `css/styles.css`):

| Color | Código |
|---|---|
| Azul marino | `#0B2F4F` |
| Verde | `#00A86B` |

## Verla en tu ordenador

Abre `index.html` con doble clic, o lanza un servidor local:

```bash
python3 -m http.server 8000
# y abre http://localhost:8000
```

## Publicarla gratis (sin dominio)

- **Netlify Drop**: entra en https://app.netlify.com/drop y arrastra la carpeta del proyecto.
- **GitHub Pages**: en el repositorio, ve a *Settings → Pages*, elige la rama y la carpeta `/ (root)`.

Cuando compres el dominio, se conecta desde el panel de Netlify o de GitHub Pages.

## Pendiente para más adelante

- **Redes sociales**: de momento no aparecen en la web. Cuando tengas perfiles, se añaden al pie de página de `index.html` y `faq.html`.
- **Formulario de contacto**: las solicitudes llegan por email con [Web3Forms](https://web3forms.com) (gratis). La clave de acceso está en `WEB3FORMS_KEY`, en `js/main.js` (se ve en Web3Forms → Nexa Process → Form Setup). El correo que recibe las solicitudes se elige en el panel de Web3Forms.
