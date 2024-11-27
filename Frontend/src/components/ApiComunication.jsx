import axios from 'axios';
import { ec as EC } from 'elliptic';
import CryptoJS from 'crypto-js';

const ec = new EC('secp256k1');

// Generar par de claves ECDH
export const generateKeyPair = () => {
  const keyPair = ec.genKeyPair();
  console.log('Generated Key Pair:', {
    privateKey: keyPair.getPrivate('hex'),
    publicKey: keyPair.getPublic('hex'),
  });
  return keyPair;
};

// Obtener clave pública del servidor
export const fetchServerPublicKey = async () => {
  try {
    const response = await axios.get('http://localhost:3000/ecdh/public-key');
    console.log('Server Public Key:', response.data.serverPublicKey);
    return response.data.serverPublicKey;
  } catch (error) {
    console.error('Error fetching server public key:', error);
    throw error;
  }
};

// Calcular la clave compartida
export const computeSharedSecret = (clientKeyPair, serverPublicKey) => {
  const secret = clientKeyPair.derive(ec.keyFromPublic(serverPublicKey, 'hex').getPublic()).toString('hex');
  console.log('Shared Secret:', secret);
  return secret;
};

// Cifrar datos
export const encryptData = (sharedSecret, sensorData) => {
  const key = CryptoJS.enc.Hex.parse(sharedSecret);
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(sensorData), key, { iv });
  const encryptedData = { data: encrypted.toString(), iv: iv.toString(CryptoJS.enc.Hex) };
  console.log('Encrypted Data:', encryptedData);
  return encryptedData;
};

// Firmar datos
export const signData = (clientKeyPair, encryptedData) => {
  const signature = clientKeyPair.sign(encryptedData.data).toDER('hex');
  console.log('Signature:', signature);
  return signature;
};

// Enviar datos al servidor
export const submitData = async (encryptedData, signature, clientPublicKey) => {
  try {
    const response = await axios.post('http://localhost:3000/submit', {
      encryptedData: encryptedData.data,
      iv: encryptedData.iv,
      signature,
      publicKey: clientPublicKey,
    });
    console.log('Server Response:', response.data.message);
    return response.data.message;
  } catch (error) {
    console.error('Error submitting data:', error);
    throw error.response.data.error;
  }
};
