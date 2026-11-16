# Mi Día — PWA

Aplicación web progresiva para Android. No requiere cuenta ni conexión después de la primera carga. Los datos se guardan localmente en el navegador del teléfono.

## Publicar gratis
La PWA necesita una dirección HTTPS para poder instalarse desde Chrome. Este ZIP contiene el sitio listo para publicar en un alojamiento estático HTTPS, por ejemplo GitHub Pages o Netlify.

### Con GitHub Pages
1. Crea una cuenta gratuita en GitHub si no tienes una.
2. Crea un repositorio nuevo llamado `mi-dia`.
3. Sube **el contenido** de esta carpeta (index.html, styles.css, app.js, manifest.webmanifest, sw.js e icons) a la raíz del repositorio.
4. En el repositorio abre Settings → Pages.
5. En “Build and deployment”, elige “Deploy from a branch”, rama `main`, carpeta `/ (root)`, y guarda.
6. Espera a que GitHub Pages publique el sitio. Abre la URL que muestra Pages desde Chrome en tu Android.
7. En Chrome: menú ⋮ → “Instalar aplicación” o “Agregar a pantalla principal”.

## Funciones
- Configuración inicial de objetivos diarios permanentes.
- Pendientes arriba y realizados abajo; marcar/desmarcar.
- Agregar objetivos desde el día o desde Ajustes; editar y eliminar objetivos permanentes.
- Reinicio cuando se detecta el cambio de fecha local. Al abrir la app o volver a ella se comprueba la fecha; si permanece abierta, revisa periódicamente y cerca de medianoche.
- Historial con resultados diarios; los días en que no se abrió la app no se inventan.
- Exportar copia JSON de los datos desde Ajustes.

## Privacidad y límites
Todo se guarda en `localStorage` del navegador. No hay cuenta ni sincronización entre dispositivos. No borres los datos del sitio ni desinstales/borres los datos del navegador sin exportar una copia. La fuente tipográfica remota es decorativa; la app funciona sin ella.
