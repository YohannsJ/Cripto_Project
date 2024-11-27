import time
import json
import random
import requests
from ecdsa import SigningKey, VerifyingKey, SECP256k1
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
from Crypto.Random import get_random_bytes

# URL del backend
SERVER_URL = "http://localhost:3000/submit"

# Generar par de claves ECDSA para el cliente
client_private_key = SigningKey.generate(curve=SECP256k1)
client_public_key = client_private_key.verifying_key.to_string().hex()

# Obtener clave pública del servidor
def fetch_server_public_key():
    response = requests.get("http://localhost:3000/ecdh/public-key")
    response.raise_for_status()
    return response.json()["serverPublicKey"]

server_public_key = fetch_server_public_key()

# Derivar clave compartida
def derive_shared_secret(server_public_key_hex):
    # Simula una clave compartida a partir de las claves públicas (en sistemas reales usa ECDH)
    shared_secret = server_public_key_hex[:32]  # Usar parte de la clave pública del servidor como simulación
    return shared_secret

shared_secret = derive_shared_secret(server_public_key)

# Función para cifrar los datos usando AES
def encrypt_data(shared_secret, sensor_data):
    key = bytes.fromhex(shared_secret)
    iv = get_random_bytes(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    encrypted_data = cipher.encrypt(pad(json.dumps(sensor_data).encode("utf-8"), AES.block_size))
    return encrypted_data.hex(), iv.hex()

# Función para firmar los datos
def sign_data(data_hex):
    message = bytes.fromhex(data_hex)
    signature = client_private_key.sign(message)
    return signature.hex()

# Enviar datos al backend
def send_data(sensor_id, temperature, latitude, longitude):
    sensor_data = {
        "id": sensor_id,
        "temperature": temperature,
        "latitude": latitude,
        "longitude": longitude,
    }

    # Cifrar los datos
    encrypted_data, iv = encrypt_data(shared_secret, sensor_data)

    # Firmar los datos cifrados
    signature = sign_data(encrypted_data)

    # Construir el cuerpo de la solicitud
    payload = {
        "encryptedData": encrypted_data,
        "iv": iv,
        "signature": signature,
        "publicKey": client_public_key,
    }

    # Enviar datos al servidor
    try:
        response = requests.post(SERVER_URL, json=payload)
        response.raise_for_status()
        print(f"Datos enviados correctamente: {response.json()['message']}")
    except requests.exceptions.RequestException as e:
        print(f"Error al enviar datos: {e}")

# Generar datos falsos para los sensores
def simulate_sensors():
    sensor_ids = [1, 2, 3, 4, 5]  # Lista de IDs de sensores
    while True:
        for sensor_id in sensor_ids:
            temperature = round(random.uniform(20.0, 35.0), 2)  # Temperatura aleatoria
            latitude = round(random.uniform(-90.0, 90.0), 6)    # Latitud aleatoria
            longitude = round(random.uniform(-180.0, 180.0), 6) # Longitud aleatoria

            print(f"Simulando datos para Sensor {sensor_id}...")
            send_data(sensor_id, temperature, latitude, longitude)

            # Esperar antes de enviar los datos del siguiente sensor
            time.sleep(2)  # 2 segundos entre cada envío

# Iniciar la simulación
if __name__ == "__main__":
    simulate_sensors()
