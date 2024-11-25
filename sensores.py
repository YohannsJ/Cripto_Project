import requests
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import os
import base64
import threading
import time

# Simulación de la clave pública de la API
API_PUBLIC_KEY = b"""-----BEGIN PUBLIC KEY-----
<insert_api_public_key_here>
-----END PUBLIC KEY-----"""

# Generar claves privadas para cada sensor
sensor_private_keys = [ec.generate_private_key(ec.SECP256R1()) for _ in range(5)]
sensor_ids = [f"sensor_{i}" for i in range(5)]


def encrypt_data(sensor_id, sensor_private_key, data):
    """Cifra los datos utilizando ECC con la clave pública de la API."""
    # Cargar la clave pública de la API
    api_public_key = serialization.load_pem_public_key(API_PUBLIC_KEY)

    # Generar una clave compartida (ECDH)
    shared_key = sensor_private_key.exchange(ec.ECDH(), api_public_key)

    # Derivar una clave simétrica a partir de la clave compartida
    derived_key = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=b"sensor-encryption"
    ).derive(shared_key)

    # Cifrar los datos con AES-GCM
    iv = os.urandom(12)  # Vector de inicialización
    cipher = Cipher(algorithms.AES(derived_key), modes.GCM(iv))
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(data.encode()) + encryptor.finalize()

    return {
        "ciphertext": base64.b64encode(ciphertext).decode(),
        "iv": base64.b64encode(iv).decode(),
        "tag": base64.b64encode(encryptor.tag).decode()
    }


def send_data(sensor_id, sensor_private_key):
    """Envía datos simulados cifrados a la API."""
    url = "http://localhost:8000/api/temperatures/"

    while True:
        # Simular datos de temperatura
        value = round(20 + os.urandom(1)[0] % 15, 2)  # Temperatura simulada entre 20 y 35°C
        data = {
            "sensor_id": sensor_id,
            "value": value,
        }

        # Cifrar los datos
        encrypted_data = encrypt_data(sensor_id, sensor_private_key, str(data))

        # Enviar los datos cifrados a la API
        try:
            response = requests.post(url, json=encrypted_data)
            print(f"[{sensor_id}] Enviado: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"[{sensor_id}] Error al enviar datos: {e}")

        # Enviar datos cada 5 segundos
        time.sleep(5)


if __name__ == "__main__":
    # Crear un hilo para cada sensor simulado
    threads = []
    for sensor_id, private_key in zip(sensor_ids, sensor_private_keys):
        thread = threading.Thread(target=send_data, args=(sensor_id, private_key))
        thread.start()
        threads.append(thread)

    # Esperar a que los hilos finalicen (en este caso, nunca finalizarán)
    for thread in threads:
        thread.join()
