# Instituto Pilola - Configuración y Despliegue en EasyPanel

Este repositorio contiene la estructura inicial para desplegar un sitio web estático optimizado con Nginx en EasyPanel.

## Estructura del Proyecto

- `index.html`: La página web (actualmente un marcador de prueba).
- `Dockerfile`: Archivo de configuración de Docker para construir la imagen del contenedor.
- `nginx.conf`: Configuración personalizada para el servidor Nginx (Gzip, Caché, Rutas).
- `.gitignore`: Exclusiones para Git.

---

## Paso 1: Configurar GitHub

Para subir este código a tu cuenta de GitHub, sigue estos pasos:

1. Ve a [GitHub](https://github.com/) e inicia sesión.
2. Haz clic en el botón **New** (Nuevo) para crear un nuevo repositorio.
3. Configura el repositorio:
   - **Repository name**: `instituto-pilola` (o el nombre que prefieras).
   - **Public/Private**: Elige la privacidad que desees.
   - **NO** marques las opciones de inicializar con README, .gitignore o licencia (ya los tenemos creados localmente).
4. Haz clic en **Create repository**.
5. Copia la URL del repositorio remoto. Tendrá un formato como este:
   `https://github.com/TU_USUARIO/instituto-pilola.git`
6. En tu terminal, abre la carpeta del proyecto y ejecuta los siguientes comandos para enlazar y subir el código:

```bash
# Enlazar el repositorio remoto (reemplaza TU_USUARIO por tu nombre de usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/instituto-pilola.git

# Subir los archivos a la rama principal (main)
git push -u origin main
```

---

## Paso 2: Configurar EasyPanel

Una vez que tu código esté en GitHub, sigue estos pasos en EasyPanel para desplegarlo:

1. Inicia sesión en tu panel de **EasyPanel**.
2. Ve al proyecto donde deseas alojar la página o crea uno nuevo.
3. Haz clic en **+ App** (o **Add Service**) y selecciona la opción de **Git** (GitHub/Gitlab).
4. Configura los detalles del origen:
   - **Repository URL**: `https://github.com/TU_USUARIO/instituto-pilola`
   - **Branch**: `main`
   - **Credentials**: Si tu repositorio es privado, asegúrate de conectar tu cuenta de GitHub en EasyPanel o proporcionar una clave SSH/Token de acceso.
5. Configura el método de construcción (**Build**):
   - En la pestaña de configuración del servicio, asegúrate de que el **Build Method** esté configurado como **Dockerfile** (generalmente EasyPanel lo detectará de forma automática al ver el archivo en la raíz).
6. Haz clic en **Deploy**.
7. ¡Listo! EasyPanel descargará tu repositorio de GitHub, construirá la imagen Docker usando Nginx Alpine, y expondrá la aplicación.
8. En la pestaña **Domains**, podrás ver la URL temporal asignada o configurar tu propio dominio.
