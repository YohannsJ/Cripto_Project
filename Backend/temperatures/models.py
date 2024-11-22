from django.db import models

class Temperature(models.Model):
    sensor_id = models.CharField(max_length=100)
    value = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sensor_id} - {self.value}°C"
