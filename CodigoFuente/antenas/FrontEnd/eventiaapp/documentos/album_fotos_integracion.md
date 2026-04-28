# Integración del Módulo de Álbum y Fotos (Cloudflare R2)

Este documento detalla cómo el equipo de Frontend debe interactuar con el servicio de Álbum del evento para la subida y visualización de fotos.

## 1. Subida de Fotos

Para subir una foto, se debe realizar una petición `POST` enviando los datos como `multipart/form-data`.

**Endpoint:**
`POST /evento/{id_evento}/album/upload`

**Headers recomendados:**
*   `X-Device-Id`: (Opcional) Un identificador único del dispositivo/navegador para controlar límites de subida por usuario anónimo.

**Cuerpo de la petición (FormData):**

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `archivo` | File | El archivo de imagen (binario). |
| `nombre_invitado` | String | El nombre que se mostrará junto a la foto. |
| `mensaje` | String | (Opcional) Un comentario o dedicatoria. |
| `id_tramo` | Long | (Opcional) ID del tramo del evento. |
| `categoria` | String | (Opcional) Categoría para agrupar (ej: "Excursión"). |
| `tags` | String | (Opcional) Etiquetas separadas por espacio o coma. |
| `origen` | String | "WEB", "APP", "FOTOCABINA" o "ADMIN". |

**Respuesta exitosa (200 OK):**
Devuelve el objeto de la foto creada, incluyendo la `url_publica` (apuntando a Cloudflare R2).

---

## 2. Visualización de Fotos (Feed)

Para mostrar el muro de fotos (Live Wall) o la galería, se utiliza el endpoint de feed con paginación.

**Endpoint:**
`GET /evento/{id_evento}/album/feed`

**Parámetros de Query (Opcionales):**
*   `page`: Número de página (default 1).
*   `pageSize`: Cantidad de fotos por página (default 20).
*   `estado`: Filtra por estado (ej: "APROBADA").
*   `id_tramo`: Filtra fotos de un momento específico.
*   `es_destacada`: true/false.

**Respuesta:**
Objeto con `items` (lista de fotos) y `totalCount`.

---

## 3. Likes e Interacción

Para registrar un "Like" en una foto:

**Endpoint:**
`POST /evento/{id_evento}/album/foto/{id_foto}/like`

**Cuerpo (JSON):**
```json
{
  "device_id": "identificador-unico-del-dispositivo",
  "id_invitado": null // Opcional si está logueado
}
```

---

## Notas Técnicas para el Frontend

1.  **Moderación**: Si el evento tiene moderación activada, la foto subida devolverá un estado `PENDIENTE`. El Frontend debe informar al usuario que su foto será revisada antes de aparecer en el feed público.
2.  **URLs de Imágenes**: Las URLs devueltas por el API ya son absolutas y apuntan al bucket de Cloudflare R2 (`https://pub-....r2.dev/...`). No es necesario anteponer ninguna ruta base adicional.
3.  **Límites de Subida**: Si el backend devuelve un error 400 con el mensaje "Límite de subida alcanzado", el frontend debe deshabilitar el botón de subida para ese usuario.
4.  **Formatos**: Se recomiendan formatos estándar (JPG, PNG, WEBP). El backend aceptará el archivo siempre que el `FeatureGuard` lo permita según el plan del evento.
