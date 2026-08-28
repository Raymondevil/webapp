# Guía Completa de Despliegue en Producción (Docker + Cloudflare Tunnel)

Esta guía explica paso a paso cómo desplegar, actualizar y mantener la aplicación en producción utilizando **Docker Compose** y **Cloudflare Tunnel**.

---

## 📋 Arquitectura del Despliegue

El sistema consta de dos servicios orquestados en [compose.yml](file:///media/proyecto/webapp/compose.yml):

1. **`fotoseltigre` (Aplicación Web)**:
   - Construido a partir de [Dockerfile](file:///media/proyecto/webapp/Dockerfile) con Node 22 y React Router 7.
   - Escucha internamente en el puerto `8080` (`127.0.0.1:8080`).
   - Almacena la base de datos (SQLite/D1) y archivos (R2) en el volumen persistente `fotoseltigre-data`.

2. **`tunnel` (Cloudflare Tunnel / `cloudflared`)**:
   - Conecta de forma segura el contenedor con la red de Cloudflare sin necesidad de abrir puertos en tu router o firewall.
   - Comparte la red interna `fotoseltigre-tunnel` con la aplicación, redirigiendo el tráfico a `http://fotoseltigre:8080`.

---

## 🚀 1. Despliegue Inicial desde Cero

### Paso 1: Configurar el archivo `compose.yml`

Verifica que el archivo [compose.yml](file:///media/proyecto/webapp/compose.yml) contenga la definición de ambos servicios y el token de tu túnel:

```yaml
services:
  fotoseltigre:
    build:
      context: .
    image: fotoseltigre:latest
    container_name: fotoseltigre
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:8080"
    networks:
      - tunnel
    volumes:
      - fotoseltigre-data:/app/.wrangler

  tunnel:
    image: cloudflare/cloudflared:latest
    container_name: fotoseltigre-cloudflared
    restart: unless-stopped
    command: tunnel --no-autoupdate --protocol http2 run --token <TU_TOKEN_DE_CLOUDFLARE>
    networks:
      - tunnel
    depends_on:
      - fotoseltigre

networks:
  tunnel:
    name: fotoseltigre-tunnel

volumes:
  fotoseltigre-data:
    name: fotoseltigre-data
```

> **Nota:** La bandera `--protocol http2` garantiza la estabilidad de la conexión evitando problemas de bloqueo de paquetes UDP/QUIC en ciertos proveedores de internet.

---

### Paso 2: Compilar y levantar los contenedores

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
cd /media/proyecto/webapp
docker compose up -d --build
```

Este comando descargará las imágenes necesarias, compilará el frontend y el servidor de producción, y arrancará los dos contenedores en segundo plano.

---

### Paso 3: Configurar el dominio en Cloudflare Zero Trust

1. Entra al panel de [Cloudflare Zero Trust](https://one.dash.cloudflare.com/).
2. Dirígete a **Networks** > **Tunnels** y selecciona tu túnel (ej. `eltigre-fotos`).
3. Ve a la pestaña **Public Hostnames** y haz clic en **Add a public hostname** (o edita el existente):
   - **Hostname:** Tu dominio o subdominio (ej. `fotoseltigre.shop` o `www.fotoseltigre.shop`).
   - **Service Type:** `HTTP`
   - **URL:** `fotoseltigre:8080` (o `http://fotoseltigre:8080`).
4. Guarda los cambios. El tráfico HTTPS hacia tu dominio llegará automáticamente al contenedor.

---

## 🔄 2. Actualizar la Aplicación (Nuevos Cambios de Código)

Cada vez que agregues fotos, modifiques componentes, estilos o rutas:

```bash
cd /media/proyecto/webapp

# Reconstruir la imagen y reiniciar el contenedor
docker compose up -d --build
```

> **Los datos no se pierden:** Las fotos subidas, pedidos y la base de datos se conservan intactos en el volumen `fotoseltigre-data`.

---

## 🔍 3. Monitoreo y Comandos Frecuentes

| Acción | Comando |
| :--- | :--- |
| **Ver estado de los contenedores** | `docker compose ps` |
| **Ver registros de ambos contenedores** | `docker compose logs -f` |
| **Ver registros sólo de la aplicación** | `docker compose logs -f fotoseltigre` |
| **Ver registros sólo del túnel** | `docker compose logs -f tunnel` |
| **Probar respuesta local (HTTP 200)** | `curl -I http://127.0.0.1:8080` |
| **Detener servicios (conservando datos)**| `docker compose down` |
| **Iniciar servicios ya construidos** | `docker compose up -d` |

---

## 💾 4. Respaldos y Restauración

### Crear una copia de seguridad del volumen

Guarda una copia comprimida de la base de datos y archivos subidos:

```bash
docker run --rm -v fotoseltigre-data:/datos -v "$(pwd)":/respaldo alpine tar czf /respaldo/fotoseltigre-data-respaldo-$(date +%Y%m%d).tar.gz -C /datos .
```

### Restaurar una copia de seguridad

Si necesitas restaurar los datos en una nueva máquina o tras un formateo:

```bash
docker run --rm -v fotoseltigre-data:/datos -v "$(pwd)":/respaldo alpine tar xzf /respaldo/fotoseltigre-data-respaldo-AAAAMMDD.tar.gz -C /datos
```

---

## ⚠️ 5. Advertencias de Seguridad y Buenas Prácticas

1. **Nunca borrar volúmenes por error:**  
   Evita ejecutar `docker compose down -v` o `docker volume rm fotoseltigre-data`, ya que eliminaría de forma permanente los pedidos y fotos cargadas.
2. **Tokens y Secretos:**  
   Si requieres cambiar la contraseña de administración o el token de Cloudflare, actualízalos en la configuración antes de desplegar.
3. **Reinicio automático:**  
   Gracias a `restart: unless-stopped`, si el servidor se reinicia o sufre un corte de energía, los contenedores arrancarán automáticamente al encender.
