# **Proyecto de Criptografía**

Este proyecto implementa un sistema de comunicación segura utilizando **intercambio de claves ECDH**, **cifrado AES** y **firmas digitales**. Además, incluye un **frontend** para la entrada y visualización de datos, y un **backend** para el procesamiento y almacenamiento.

---

## **Estructura del Proyecto**

- **Frontend**: Aplicación **React** para entrada y visualización de datos.
- **Backend**: Servidor **Express** para procesamiento y almacenamiento de datos.
- **Base de Datos**: **PostgreSQL** para almacenamiento persistente de datos de sensores.

---

## **Cómo Ejecutar el Proyecto**

### **Requisitos Previos**

- **Docker** y **Docker Compose**
- **Node.js** y **npm**

### **Ejecución del Proyecto**

1. **Clonar el repositorio**.
2. Configurar y ejecutar los servicios mediante Docker Compose.

---

## **Configuración Docker**

- Utiliza PostgreSQL 15.
- Crea automáticamente la base de datos y tablas necesarias.
- Persiste los datos mediante volúmenes Docker.
- Expone los puertos necesarios:
  - **3000** para la API.
  - **5432** para la base de datos.

---

## **Resolución de Problemas**

### **Problemas Comunes**

#### **Conexión a la Base de Datos**
- Verificar que el contenedor PostgreSQL esté en ejecución.
- Revisar las credenciales en `docker-compose.yml`.

#### **Comunicación Frontend-Backend**
- Asegurar que el backend esté corriendo en el puerto **3000**.
- Verificar la configuración de CORS.
- Comprobar la accesibilidad de los endpoints de la API.

#### **Problemas de Encriptación**
- Verificar la generación correcta de pares de claves.
- Revisar el cálculo del secreto compartido.
- Validar la generación y verificación de firmas.

---

## **Guía de Desarrollo**

### **Desarrollo Local**

#### **Pruebas y Monitoreo**
- Usar la consola del navegador para seguimiento de la encriptación.
- Revisar los logs del servidor para información detallada.
- Verificar la integridad de datos en PostgreSQL.

#### **Flujo de Trabajo**
1. **Generar un par de claves en el cliente**.

   