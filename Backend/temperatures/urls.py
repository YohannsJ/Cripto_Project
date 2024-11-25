from django.urls import path
from .views import TemperatureView

urlpatterns = [
    path('temperatures/', TemperatureView.as_view(), name='temperature'),
]
