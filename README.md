
# **Proyecto de Criptografía**

Este proyecto implementa un sistema de comunicación segura utilizando **intercambio de claves ECDH**, **cifrado AES** y **firmas digitales**. Además, incluye un **frontend** para la entrada y visualización de datos, y un **backend** para el procesamiento y almacenamiento en una base de datos PostgreSQL.



---
## Links asociados al proyecto:

 <!-- []: # (Links) -->
  * [Repositorio del proyecto](https://github.com/YohannsJ/Cripto_Project/)
  * [Video demostrativo](https://www.youtube.com/watch?v=RPNGKNoFwvk&feature=youtu.be)
  * [Documento .pdf del proyecto](/Proyecto_TEL252_Grupo4.pdf )
---
## **Estructura del Proyecto**

- **Frontend**: Aplicación **React** que gestiona la interacción con el usuario.
    - Componentes clave:
        - `TemperatureTable.jsx`: Visualiza los datos procesados y descifrados provenientes del backend.
        - `ApiComunication.jsx`: Realiza las solicitudes HTTP al backend.
- **Backend**: Servidor **Express** que implementa la lógica de intercambio de claves, cifrado, descifrado y verificación de datos.
- **Base de Datos**: **PostgreSQL** para el almacenamiento persistente de los datos recibidos de los sensores.

---

## **Configuración Docker**

El proyecto está diseñado para ejecutarse con Docker, utilizando contenedores para el backend y PostgreSQL. 

- **PostgreSQL**:
  - Puerto: `5432`.
  - Credenciales configurables en `docker-compose.yml`.
  - Volúmenes: Persisten los datos fuera del contenedor.
- **Backend**:
  - Puerto: `3000`.
  - Gestiona las API para recibir, verificar y descifrar datos.

### **Comandos Docker**

Para construir y ejecutar el proyecto:
```bash
docker-compose up --build
```

---

## **Cómo Ejecutar el Proyecto**

### **Requisitos Previos**

- **Docker** y **Docker Compose**.
- **Node.js** y **npm** (si se ejecuta localmente).

### **Pasos de Ejecución**

1. Clonar el repositorio.
2. Configurar credenciales y variables en `docker-compose.yml`.
3. Ejecutar con Docker:
   ```bash
   docker-compose up --build
   ```
4. Acceder a:
    - **Frontend**: [http://localhost:5173](http://localhost:5173).
    - **Backend**: [http://localhost:3000](http://localhost:3000).

---

## **Backend**

El servidor utiliza **Express** y se conecta a una base de datos **PostgreSQL**. Incluye las siguientes funcionalidades:

### **Endpoints**

1. **Obtener la clave pública del servidor**
    - **Método**: `GET`
    - **Ruta**: `/ecdh/public-key`
    - **Descripción**: Devuelve la clave pública del servidor para el intercambio de claves ECDH.
    - **Respuesta**:
        ```json
        {
          "serverPublicKey": "<clave pública en formato hexadecimal>"
        }
        ```

2. **Enviar datos cifrados desde el cliente**
    - **Método**: `POST`
    - **Ruta**: `/submit`
    - **Descripción**: Recibe datos cifrados, verifica su firma, los descifra y los almacena en la base de datos.
    - **Cuerpo de la solicitud**:
        ```json
        {
          "encryptedData": "<datos cifrados>",
          "iv": "<vector de inicialización>",
          "signature": "<firma digital>",
          "publicKey": "<clave pública del cliente>"
        }
        ```
    - **Respuesta exitosa**:
        ```json
        {
          "message": "Sensor data received and verified."
        }
        ```
    - **Errores comunes**:
        - `400`: Faltan campos requeridos o la firma no es válida.
        - `500`: Error interno en el servidor.

3. **Obtener datos descifrados**
    - **Método**: `GET`
    - **Ruta**: `/sensors/naturaly`
    - **Descripción**: Devuelve los datos descifrados almacenados en la base de datos.
    - **Respuesta**:
        ```json
        [
          {
            "campo1": "valor1",
            "campo2": "valor2",
            "upload_date": "2024-11-29T00:00:00Z"
          }
        ]
        ```

4. **Obtener datos crudos**
    - **Método**: `GET`
    - **Ruta**: `/sensors/raw`
    - **Descripción**: Devuelve los datos cifrados sin procesar directamente desde la base de datos.
    - **Respuesta**:
        ```json
        [
          {
            "id": 1,
            "encrypted_data": "<datos cifrados>",
            "upload_date": "2024-11-29T00:00:00Z"
          }
        ]
        ```

---

## **Comunicación API-Cliente**

### **Flujo de Comunicación**

1. **Intercambio de Claves ECDH**:
    - El cliente solicita la clave pública del servidor mediante el endpoint `/ecdh/public-key`.
    - Utilizando esta clave, el cliente genera un secreto compartido y cifra los datos que desea enviar.

2. **Envío de Datos**:
    - El cliente envía los datos cifrados, junto con su firma digital y vector de inicialización, al endpoint `/submit`.
    - El servidor:
        - Verifica la firma digital utilizando la clave pública del cliente.
        - Descifra los datos usando el secreto compartido derivado del intercambio ECDH.
        - Almacena los datos en la base de datos.

3. **Consulta de Datos**:
    - Los datos pueden consultarse descifrados mediante `/sensors/naturaly` o en su estado cifrado con `/sensors/raw`.

