from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from cryptography.fernet import Fernet
import base64
import os

# Generar una clave segura (puedes almacenar esto como variable de entorno)
ENCRYPTION_KEY = base64.urlsafe_b64encode(os.urandom(32))
class Temperature(models.Model):
    sensor_id = models.CharField(max_length=100)
    ciphertext = models.TextField(null=True, blank=True)  # Permitir valores nulos temporalmente
    iv = models.TextField(null=True, blank=True)
    tag = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    # value = models.FloatField()
    # timestamp = models.DateTimeField(auto_now_add=True)
    # latitude = models.FloatField(
    #     null=True, blank=True,
    #     validators=[MinValueValidator(-90.0), MaxValueValidator(90.0)]
    # )
    # longitude = models.FloatField(
    #     null=True, blank=True,
    #     validators=[MinValueValidator(-180.0), MaxValueValidator(180.0)]
    # )