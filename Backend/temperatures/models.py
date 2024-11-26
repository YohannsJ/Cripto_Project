from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Temperature(models.Model):
    sensor_id = models.CharField(max_length=100)
    value = models.FloatField(default=0.0) 
    timestamp = models.DateTimeField(auto_now_add=True)
    latitude = models.FloatField(
        null=True, blank=True,
        validators=[MinValueValidator(-90.0), MaxValueValidator(90.0)]
    )
    longitude = models.FloatField(
        null=True, blank=True,
        validators=[MinValueValidator(-180.0), MaxValueValidator(180.0)]
    )

    def __str__(self):
        return f"{self.sensor_id} - {self.value}°C"
