# Bulk Elasticsearch Uploader

Este script permite cargar en masa documentos a un índice de Elasticsearch utilizando un archivo JSON como fuente. Los datos se dividen en paquetes y se suben de forma asincrónica.

## 🚀 Características

- Lectura de datos desde un archivo JSON.
- División en paquetes para cargas por lotes.
- Subida a Elasticsearch utilizando `fetch` con autenticación por API Key.
- Registro de elementos que no pudieron subirse.
- Uso de variables de entorno para mantener configuraciones sensibles fuera del código.

## 📦 Requisitos

- Node.js >= 18
- Elasticsearch accesible mediante HTTP
- Archivo `.env` con la configuración requerida

## 📁 Estructura esperada del archivo de datos

El archivo JSON debe contener un array de objetos, por ejemplo:

```json
[
  { "id": 1, "name": "Item 1" },
  { "id": 2, "name": "Item 2" }
]
````

## ⚙️ Configuración

Crea un archivo `.env` en la raíz del proyecto basado en este ejemplo:

```env
FILE=./data.json
HOST=http://localhost:9200
INDEX_NAME=my-index
API_KEY=your-api-key
PACKAGES_SIZE=500
```

### Variables

* `FILE`: Ruta al archivo `.json` con los datos.
* `HOST`: URL del host de Elasticsearch.
* `INDEX_NAME`: Nombre del índice en Elasticsearch.
* `API_KEY`: Clave de autenticación para Elasticsearch.
* `PACKAGES_SIZE`: Cantidad de elementos por paquete (por defecto: 500).

## ▶️ Cómo ejecutar

Ejecuta el script con Node.js:

```bash
node script.js
```

El script te pedirá confirmación antes de iniciar el proceso.

## 🐞 Errores

Todos los elementos que no pudieron subirse correctamente se guardarán en el archivo `not_uploaded.json` al final del proceso.

## 📄 Licencia

MIT — Libre uso, modificación y distribución.

---
**Nota:** Asegúrate de no subir tu archivo `.env` a repositorios públicos. Agrega `.env` a tu `.gitignore`.