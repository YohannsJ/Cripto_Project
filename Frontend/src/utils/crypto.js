import { AES, enc } from "crypto-js";
import * as elliptic from "elliptic";

// Inicializar la curva elíptica
const ec = new elliptic.ec("p256");

// Clave privada del frontend
const FRONTEND_PRIVATE_KEY = "<insertar_clave_privada_aqui>";

const privateKey = ec.keyFromPrivate(FRONTEND_PRIVATE_KEY, "hex");

// Función para descifrar los datos
export function decryptData(encryptedData) {
    const { ciphertext, iv, tag } = encryptedData;

    // Obtener la clave pública del sensor (esto debería venir en la respuesta de la API si es dinámico)
    const sensorPublicKey = "<insertar_clave_publica_del_sensor>";

    // Reconstruir la clave pública del sensor
    const publicKey = ec.keyFromPublic(sensorPublicKey, "hex");

    // Generar la clave compartida (ECDH)
    const sharedKey = privateKey.derive(publicKey.getPublic());

    // Derivar la clave AES a partir de la clave compartida
    const derivedKey = enc.Hex.stringify(sharedKey);

    // Descifrar los datos con AES-GCM
    try {
        const decrypted = AES.decrypt(ciphertext, derivedKey, {
            iv: enc.Base64.parse(iv),
            mode: AES.mode.GCM,
            padding: AES.pad.NoPadding,
        }).toString(enc.Utf8);

        return JSON.parse(decrypted); // Devuelve los datos descifrados
    } catch (error) {
        console.error("Error al descifrar los datos:", error);
        return null;
    }
}
