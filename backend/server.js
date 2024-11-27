const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ec: EC } = require('elliptic');
const CryptoJS = require('crypto-js'); // Import crypto-js for AES decryption
const { Pool } = require('pg');

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'db', // Nombre del servicio Docker para PostgreSQL
  database: 'sensor_data',
  password: 'postgres', // Cambia esto según tu configuración
  port: 5432,
});

// Crear la tabla si no existe
pool.query(`
  CREATE TABLE IF NOT EXISTS sensors (
    id SERIAL PRIMARY KEY,
    public_key TEXT NOT NULL,
    encrypted_data TEXT NOT NULL,
    iv TEXT NOT NULL,
    verification_status TEXT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`)
  .then(() => console.log('Tabla "sensors" verificada/creada.'))
  .catch(err => console.error('Error al crear/verificar la tabla:', err));

const ec = new EC('secp256k1');
const app = express();

// ECDH Server Key Pair
const serverECDHKey = ec.genKeyPair();
const serverPublicKey = serverECDHKey.getPublic('hex');

// Enable CORS
app.use(cors());
app.use(bodyParser.json());

// ECDH: Server Public Key
app.get('/ecdh/public-key', (req, res) => {
  res.json({ serverPublicKey });
});

// Submit encrypted sensor data
app.post('/submit', async (req, res) => {
  const { encryptedData, iv, signature, publicKey } = req.body;

  if (!encryptedData || !iv || !signature || !publicKey) {
    console.error('Missing required fields in request.');
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    console.log('Datos recibidos:', { encryptedData, iv, signature, publicKey });

    console.log('Received Public Key:', publicKey);
    const key = ec.keyFromPublic(publicKey, 'hex'); // Client's Public Key
    const isValid = key.verify(encryptedData, signature); // Verify Signature
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
    // Generar la fecha actual
    const uploadDate = new Date();

    await pool.query(
      `INSERT INTO sensors (public_key, encrypted_data, iv, verification_status, upload_date)
       VALUES ($1, $2, $3, $4, $5)`,
      [publicKey, encryptedData, iv, isValid ? 'Valid' : 'Invalid', uploadDate]
    );

    res.json({ message: 'Sensor data received and verified.' });
  } catch (err) {
    console.error('Error during processing:', err.message);
    res.status(500).json({ error: 'Error processing sensor data.', details: err.message });
  }
});

// Get all sensor data
app.get('/sensors/naturaly', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sensors');
    const decryptedData = result.rows.map((row) => {
      try {
        const key = ec.keyFromPublic(row.public_key, 'hex');
        const sharedSecret = serverECDHKey.derive(key.getPublic()).toString('hex');
        const keyHex = CryptoJS.enc.Hex.parse(sharedSecret);
        const ivHex = CryptoJS.enc.Hex.parse(row.iv);

        const decryptedBytes = CryptoJS.AES.decrypt(row.encrypted_data, keyHex, { iv: ivHex });
        const decryptedStr = decryptedBytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedStr) {
          console.error('Datos descifrados vacíos para el registro:', row);
          return null;
        }

        console.log('Datos descifrados:', decryptedStr);

        const decryptedJson = JSON.parse(decryptedStr);
        return {
          ...decryptedJson,
          upload_date: row.upload_date,
        };
      } catch (error) {
        console.error('Error al procesar registro:', error);
        console.error('Registro problemático:', {
          iv: row.iv,
          encrypted_data: row.encrypted_data,
          upload_date: row.upload_date
        });
        return null;
      }
    }).filter(item => item !== null); // Eliminar registros que fallaron

    res.json(decryptedData);
  } catch (err) {
    console.error('Error fetching sensors:', err.message);
    res.status(500).json({ error: 'Error fetching sensors.', details: err.message });
  }
});

// Get raw sensor data
app.get('/sensors/raw', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, encrypted_data, upload_date FROM sensors');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching raw sensors:', err.message);
    res.status(500).json({ error: 'Error fetching raw sensors.', details: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
