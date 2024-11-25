from rest_framework import serializers
from .models import Temperature

# Funcion que se encarga de serializar los datos de la temperatura
class TemperatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Temperature # Indicar el modelo a serializar
        fields = '__all__' # Indicar que se serializan todos los campos
