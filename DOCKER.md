# Despliegue con Docker y Cloudflare Tunnel

La aplicación se ejecuta en el contenedor `fotoseltigre`, en el puerto `8080`.
El puerto se publica únicamente en `127.0.0.1`, por lo que no queda accesible
directamente desde Internet. La aplicación y cloudflared se unen a la red
privada `fotoseltigre-tunnel`; allí cloudflared resuelve la aplicación como
`fotoseltigre`.

Las cargas hechas desde el panel de administración se almacenan en el volumen
Docker `fotoseltigre-data`. Ese volumen conserva las fotos, videos, pedidos y
catálogo cuando se actualiza o se recrea el contenedor. No lo elimines si deseas
conservar esa información.

## Actualizar la aplicación

Cada vez que modifiques código, estilos o archivos dentro de `public/`, abre una
terminal en la carpeta del proyecto y ejecuta:

```bash
cd /media/proyecto/webapp
docker compose up -d --build
```

Este comando crea una imagen nueva y reemplaza el contenedor sin borrar las
fotos, videos, pedidos ni códigos de descarga, ya que se conservan en el
volumen `fotoseltigre-data`.

Comprueba que arrancó correctamente:

```bash
docker compose ps
docker compose logs --tail 50 fotoseltigre
curl -I http://127.0.0.1:8080
```

La última orden debe responder `HTTP/1.1 200 OK`. Para ver registros en tiempo
real, usa `docker compose logs -f fotoseltigre` y sal con `Ctrl+C`.

Si sólo cambiaste la configuración del túnel en el panel de Cloudflare, no hace
falta reconstruir esta aplicación.

### Importante: no borrar los datos

No ejecutes `docker compose down -v` ni `docker volume rm fotoseltigre-data`:
ambos eliminarían el almacenamiento persistente de las cargas, pedidos y
códigos de descarga. Un `docker compose down` sin `-v` sí conserva los datos.

## Copia de seguridad de las cargas

Antes de cambios grandes, guarda una copia del volumen en el directorio actual:

```bash
docker run --rm -v fotoseltigre-data:/datos -v "$(pwd)":/respaldo alpine tar czf /respaldo/fotoseltigre-data-respaldo.tar.gz -C /datos .
```

El archivo `fotoseltigre-data-respaldo.tar.gz` incluye las fotos, videos y la
base de datos local. Guárdalo también fuera de esta computadora.

## Conectar el túnel existente

En el túnel **eltigre-fotos**, agrega o edita el *Public Hostname*:

| Campo | Valor |
| --- | --- |
| Hostname | `fotoseltigre.shop` o `www.fotoseltigre.shop` |
| Service type | `HTTP` |
| URL | `http://fotoseltigre:8080` |

Si usas ambos dominios, crea una entrada para cada uno y usa exactamente el
servicio `HTTP` con la URL `http://fotoseltigre:8080`. No uses `HTTPS` ni el
puerto `80`, porque este contenedor escucha en HTTP por el puerto `8080`.

Une una vez el contenedor ya existente de cloudflared a esta red:

```bash
docker network connect fotoseltigre-tunnel <contenedor-cloudflared>
```

Si el túnel está administrado desde el panel de
Cloudflare (token), el cambio de hostname se aplica desde el panel sin reiniciar
el túnel. Para una configuración local, el ingreso equivalente es:

```yaml
ingress:
  - hostname: fotoseltigre.shop
    service: http://fotoseltigre:8080
  - service: http_status:404
```
