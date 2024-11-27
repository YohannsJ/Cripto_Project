const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ec: EC } = require('elliptic');
const CryptoJS = require('crypto-js'); // Import crypto-js for AES decryption

const ec = new EC('secp256k1');
const app = express();

// ECDH Server Key Pair
const serverECDHKey = ec.genKeyPair();
const serverPublicKey = serverECDHKey.getPublic('hex');

// In-memory storage for sensor data
const sensorDataList = [];

// Enable CORS
app.use(cors());
app.use(bodyParser.json());

// ECDH: Server Public Key
app.get('/ecdh/public-key', (req, res) => {
  res.json({ serverPublicKey });
});

// Submit encrypted sensor data
app.post('/submit', (req, res) => {
    const { encryptedData, iv, signature, publicKey } = req.body;
  
    if (!encryptedData || !iv || !signature || !publicKey) {
      console.error('Missing required fields in request.');
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      console.log('Received Public Key:', publicKey);
      const key = ec.keyFromPublic(publicKey, 'hex');
      const isValid = key.verify(encryptedData, signature);
      console.log('Signature Validation:', isValid ? 'Success' : 'Failure');
  
      if (!isValid) {
        return res.status(400).json({ error: 'Signature verification failed.' });
      }
  
      const sharedSecret = serverECDHKey.derive(key.getPublic()).toString('hex');
      console.log('Derived Shared Secret:', sharedSecret);
  
      const keyHex = CryptoJS.enc.Hex.parse(sharedSecret);
      const ivHex = CryptoJS.enc.Hex.parse(iv);
  
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, keyHex, { iv: ivHex });
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
      console.log('Decrypted Data:', decryptedData);
  
      sensorDataList.push({
        publicKey,
        encryptedData,
        decryptedData,
        verificationStatus: isValid ? 'Valid' : 'Invalid',
      });
  
      res.json({ message: 'Sensor data received and verified.' });
    } catch (err) {
      console.error('Error during processing:', err.message);
      res.status(500).json({ error: 'Error processing sensor data.', details: err.message });
    }
});

// Get all sensor data
app.get('/sensors', (req, res) => {
  res.json(sensorDataList);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
