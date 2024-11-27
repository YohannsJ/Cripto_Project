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
`)  .then(() => console.log('Tabla "sensors" verificada/creada.'))
.catch(err => console.error('Error al crear/verificar la tabla:', err));


const ec = new EC('secp256k1');
const app = express();

// ECDH Server Key Pair
const serverECDHKey = ec.genKeyPair();
const serverPublicKey = serverECDHKey.getPublic('hex');

// In-memory storage for sensor data
// const sensorDataList = [];

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
      // sensorDataList.push({
      //   publicKey,
      //   encryptedData,
      //   decryptedData,
      //   verificationStatus: isValid ? 'Valid' : 'Invalid',
      // });
  
      // Guardar en la base de datos

      res.json({ message: 'Sensor data received and verified.' });
    } catch (err) {
      console.error('Error during processing:', err.message);
      res.status(500).json({ error: 'Error processing sensor data.', details: err.message });
    }
});

// Get all sensor data
// app.get('/sensors', (req, res) => {
//   res.json(sensorDataList);
// });
// Ruta para obtener todos los sensores desde la base de datos
app.get('/sensors/naturaly', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sensors');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching sensors:', err.message);
    res.status(500).json({ error: 'Error fetching sensors.', details: err.message });
  }
});

app.post('/sensors', async (req, res) => {
  const { signature, publicKey, n } = req.body;

  if ( !publicKey || !n) {
    return res.status(400).json({ error: 'Faltan campos requeridos: signature, publicKey o n.', body: req.body });
  }

  try {
    // Verificar la firma con la clave pública del cliente
    // console.log('Firma recibida:', signature);
    console.log('Clave pública recibida:', publicKey);
    const key = ec.keyFromPublic(publicKey, 'hex');
    // const isValid = key.verify('FETCH_SENSORS', signature); // Mensaje arbitrario para firmar

    // if (!isValid) {
    //   return res.status(403).json({ error: 'Firma inválida o no autorizada.' });
    // }

    // Consultar los datos de la base de datos
    const result = await pool.query('SELECT encrypted_data, public_key, iv, upload_date FROM sensors ORDER BY upload_date DESC LIMIT $1', [n]);

    // Derivar clave compartida (shared secret) para descifrar los datos
    const sharedSecret = serverECDHKey.derive(key.getPublic()).toString('hex');
    const keyHex = CryptoJS.enc.Hex.parse(sharedSecret);
      
    // Descifrar cada registro
    const decryptedData = result.rows.map((row) => {
      const ivHex = CryptoJS.enc.Hex.parse(row.iv);
      const decryptedBytes = CryptoJS.AES.decrypt(row.encrypted_data, keyHex, { iv: ivHex });
      const decryptedJson = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
      return {
        ...decryptedJson,
        upload_date: row.upload_date,
      };
    });
    
    // Enviar datos descifrados
    res.json({ data: decryptedData });
  } catch (err) {
    console.error('Error al obtener y descifrar sensores:', err.message);
    res.status(500).json({ error: 'Error al procesar la solicitud.', details: err.message });
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
