from .models import Temperature
from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework import status # type: ignore
from temperature_api.encryption_utils import encrypt_with_aes, decrypt_with_aes

class TemperatureView(APIView):
    def post(self, request):
        """Recibir datos cifrados del sensor, descifrarlos y almacenarlos."""
        encrypted_data = request.data

        # Aquí deberías implementar la lógica para descifrar los datos si es necesario
        # Por simplicidad, asumiremos que llegan cifrados para almacenamiento con AES
        encrypted_db_data = encrypt_with_aes(str(encrypted_data))

        # Guardar los datos cifrados en la base de datos
        Temperature.objects.create(
            sensor_id=encrypted_data.get("sensor_id"),
            ciphertext=encrypted_db_data["ciphertext"],
            iv=encrypted_db_data["iv"],
            tag=encrypted_db_data["tag"]
        )

        return Response({"message": "Datos almacenados correctamente"}, status=status.HTTP_201_CREATED)

    def get(self, request):
        """Obtener datos descifrados según autenticación."""
        # Verificar autenticación del usuario (simplificado para este ejemplo)
        # if not request.user.is_authenticated:
        #     return Response({"error": "No autorizado"}, status=status.HTTP_401_UNAUTHORIZED)

        # Obtener y descifrar los datos de la base de datos
        temperatures = Temperature.objects.all()
        decrypted_data = [
            {
                "sensor_id": temp.sensor_id,
                "data": decrypt_with_aes({
                    "ciphertext": temp.ciphertext,
                    "iv": temp.iv,
                    "tag": temp.tag
                }),
                "timestamp": temp.timestamp
            }
            for temp in temperatures
        ]

        return Response(decrypted_data, status=status.HTTP_200_OK)
