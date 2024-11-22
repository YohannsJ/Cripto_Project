from rest_framework import viewsets # type: ignore
from .models import Temperature
from .serializers import TemperatureSerializer

class TemperatureViewSet(viewsets.ModelViewSet):
    queryset = Temperature.objects.all()
    serializer_class = TemperatureSerializer
