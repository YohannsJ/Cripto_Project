from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import os
import base64

# Generar la clave privada y pública de la API
API_PRIVATE_KEY = ec.generate_private_key(ec.SECP256R1())
API_PUBLIC_KEY = API_PRIVATE_KEY.public_key()

# Clave maestra para cifrado en la base de datos (AES)
MASTER_KEY = os.urandom(32)

def encrypt_with_aes(data):
    """Cifrar datos con AES y la clave maestra."""
    iv = os.urandom(12)
    cipher = Cipher(algorithms.AES(MASTER_KEY), modes.GCM(iv))
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(data.encode()) + encryptor.finalize()
    return {
        "ciphertext": base64.b64encode(ciphertext).decode(),
        "iv": base64.b64encode(iv).decode(),
        "tag": base64.b64encode(encryptor.tag).decode()
    }

def decrypt_with_aes(encrypted_data):
    """Descifrar datos almacenados con AES."""
    cipher = Cipher(
        algorithms.AES(MASTER_KEY),
        modes.GCM(
            base64.b64decode(encrypted_data["iv"]),
            base64.b64decode(encrypted_data["tag"])
        )
    )
    decryptor = cipher.decryptor()
    plaintext = decryptor.update(base64.b64decode(encrypted_data["ciphertext"])) + decryptor.finalize()
    return plaintext.decode()

def decrypt_sensor_data(sensor_private_key, encrypted_data):
    """Descifrar datos enviados por los sensores con ECC."""
    shared_key = sensor_private_key.exchange(ec.ECDH(), API_PUBLIC_KEY)
    derived_key = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=b"sensor-data"
    ).derive(shared_key)

    iv = base64.b64decode(encrypted_data["iv"])
    tag = base64.b64decode(encrypted_data["tag"])
    ciphertext = base64.b64decode(encrypted_data["ciphertext"])

    cipher = Cipher(algorithms.AES(derived_key), modes.GCM(iv, tag))
    decryptor = cipher.decryptor()
    plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    return plaintext
