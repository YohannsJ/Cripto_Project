DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'temperature_db',  # Nombre de tu BD
        'USER': 'admin',           # Usuario de PostgreSQL
        'PASSWORD': 'admin',       # Contraseña de PostgreSQL
        'HOST': 'db',              # Nombre del servicio en docker-compose
        'PORT': 5432,
    }
}
