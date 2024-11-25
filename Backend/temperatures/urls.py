from django.urls import path
from .views import TemperatureView
# URL para acceder a las vistas de la aplicación de temperaturas
urlpatterns = [
    path('temperatures/', TemperatureView.as_view(), name='temperature'),
]
