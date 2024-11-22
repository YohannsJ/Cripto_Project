# Backend

Creado con Python, django, django-rest-framework y postgresql.
Envueltos en un contenedor de Docker.


Partimos creando el archivo `Dockerfile` con:
- 


Luego los archivos django con el comando:
```bash
python -m django startproject temperature_api .
python manage.py startapp temperatures
```

Hacemos cambios personalizados en los archivos ya creados y creamos los archivos de configuración de la base de datos y de la aplicación.

Creamos el archivo `requirements.txt` con las dependencias necesarias para el proyecto.


