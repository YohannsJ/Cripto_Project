import time
import random
import requests

# Configuración de la API
api_url = 'http://localhost:8000/api/temperatures/?Content-Type=application/json'  # Reemplaza con la URL de tu API
headers = {'Content-Type': 'application/json'}

# Función para simular la lectura de un sensor de temperatura
def leer_temperatura():
    # Genera una temperatura aleatoria entre 20 y 30 grados Celsius
    temperatura = round(random.uniform(20.0, 30.0), 2)
    return temperatura

# Bucle principal para enviar datos periódicamente
intervalo_segundos = 60  # Intervalo de tiempo entre lecturas (en segundos)

while True:
    # Leer la temperatura simulada
    temperatura = leer_temperatura()
    # Crear el payload en formato JSON
    payload = {
        'sensor_id': 'sensor_001',
        # 'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        'value': temperatura,
        "latitude": 53,
        "longitude":30
    }
    # Enviar la solicitud POST a la API
    try:
        response = requests.post(api_url, json=payload, headers=headers)
        if response.status_code == 200 or response.status_code == 201:
            print(f'Datos enviados correctamente: {payload}, time: {time.strftime("%Y-%m-%d %H:%M:%S")}')
        else:
            print(f'Error al enviar datos: {response.status_code} - {response.text}')
    except requests.exceptions.RequestException as e:
        print(f'Error de conexión: {e}')
    # Esperar el intervalo de tiempo antes de la siguiente lectura
    time.sleep(intervalo_segundos)
