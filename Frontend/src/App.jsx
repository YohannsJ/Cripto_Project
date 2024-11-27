import React, { useState } from 'react';
import axios from 'axios';
import { ec as EC } from 'elliptic';
import CryptoJS from 'crypto-js';
import { Stepper, Step, StepLabel } from '@mui/material';

const ec = new EC('secp256k1');

function App() {
  const [clientKeyPair, setClientKeyPair] = useState(null);
  const [serverPublicKey, setServerPublicKey] = useState('');
  const [sharedSecret, setSharedSecret] = useState('');
  const [sensorData, setSensorData] = useState({ id: '', temperature: '', latitude: '', altitude: '' });
  const [encryptedData, setEncryptedData] = useState('');
  const [tamperedData, setTamperedData] = useState('');
  const [signature, setSignature] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [sensorList, setSensorList] = useState([]);

  // Generate ECDH key pair
  const generateKeyPair = () => {
    const keyPair = ec.genKeyPair();
    setClientKeyPair(keyPair);
    setActiveStep(1);
    console.log('Generated Key Pair:', {
      privateKey: keyPair.getPrivate('hex'),
      publicKey: keyPair.getPublic('hex'),
    });
  };

  // Fetch server public key
  const fetchServerPublicKey = async () => {
    const response = await axios.get('http://localhost:3000/ecdh/public-key');
    setServerPublicKey(response.data.serverPublicKey);
    setActiveStep(2);
    console.log('Server Public Key:', response.data.serverPublicKey);
  };

  // Compute shared secret
  const computeSharedSecret = () => {
    const secret = clientKeyPair.derive(ec.keyFromPublic(serverPublicKey, 'hex').getPublic()).toString('hex');
    setSharedSecret(secret);
    setActiveStep(3);
    console.log('Shared Secret:', secret);
  };

  // Encrypt data
  const encryptData = () => {
    if (!isFormComplete()) {
      alert('Please fill out the entire form before encrypting.');
      return;
    }

    const key = CryptoJS.enc.Hex.parse(sharedSecret);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(sensorData), key, { iv });
    setEncryptedData({ data: encrypted.toString(), iv: iv.toString(CryptoJS.enc.Hex) });
    setTamperedData(''); // Reset tampered data
    setActiveStep(4);
    console.log('Encrypted Data:', { data: encrypted.toString(), iv: iv.toString(CryptoJS.enc.Hex) });
  };

  // Simulate tampering
  const tamperData = () => {
    const tampered = 'tampered_data';
    setTamperedData({ ...encryptedData, data: tampered });
    console.log('Tampered Data:', { ...encryptedData, data: tampered });
  };

  // Sign data
  const signData = () => {
    const signature = clientKeyPair.sign(encryptedData.data).toDER('hex');
    setSignature(signature);
    setActiveStep(5);
    console.log('Signature:', signature);
  };

  // Submit data
  const submitData = async (data) => {
    if (!isFormComplete()) {
      alert('Please fill out the entire form before submitting.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/submit', {
        encryptedData: data.data,
        iv: data.iv,
        signature,
        publicKey: clientKeyPair.getPublic('hex'),
      });

      setResponseMessage(response.data.message);
      // Add the sensor to the list
      const newSensor = { ...sensorData, signature };
      setSensorList((prevList) => [...prevList, newSensor]);
    } catch (error) {
      setResponseMessage(error.response.data.error);
    }
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSensorData((prevData) => ({ ...prevData, [name]: value }));
  };

  
  const isFormComplete = () => {
    return Object.values(sensorData).every((field) => field.trim() !== '');
  };

  return (
    <div style={{ margin: '20px' }}>
      <h1>Sensor Data</h1>

      {/* Workflow  */}
      <Stepper activeStep={activeStep} style={{ marginBottom: '20px' }}>
        <Step><StepLabel>Generate Key Pair</StepLabel></Step>
        <Step><StepLabel>Fetch Server Public Key</StepLabel></Step>
        <Step><StepLabel>Compute Shared Secret</StepLabel></Step>
        <Step><StepLabel>Encrypt Data</StepLabel></Step>
        <Step><StepLabel>Sign Data</StepLabel></Step>
      </Stepper>

      {/* Workflow Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-evenly', marginBottom: '20px', flexWrap: 'nowrap' }}>
        <button onClick={generateKeyPair}>Generate Key Pair</button>
        <button onClick={fetchServerPublicKey}>Fetch Server Public Key</button>
        <button onClick={computeSharedSecret}>Compute Shared Secret</button>
        <button onClick={encryptData}>Encrypt Data</button>
        <button onClick={signData}>Sign Data</button>
      </div>

      {/* Form for Sensor Data */}
      <form style={{ marginBottom: '20px' }}>
        <input type="text" name="id" placeholder="Sensor ID" value={sensorData.id} onChange={handleInputChange} required />
        <input type="text" name="temperature" placeholder="Temperature" value={sensorData.temperature} onChange={handleInputChange} required />
        <input type="text" name="latitude" placeholder="Latitude" value={sensorData.latitude} onChange={handleInputChange} required />
        <input type="text" name="altitude" placeholder="Altitude" value={sensorData.altitude} onChange={handleInputChange} required />
      </form>

      {/* Submit Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        <button onClick={() => submitData(encryptedData)}>Submit Original Data</button>
      </div>

      {/* Tampering Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-evenly', marginBottom: '20px', flexWrap: 'nowrap' }}>
        <button onClick={tamperData}>Simulate Tampering</button>
        <button onClick={() => submitData(tamperedData)}>Submit Tampered Data</button>
      </div>
      {/* Data Overview */}
      <h2>Data Overview</h2>
      <p><strong>Original Encrypted Data:</strong> {JSON.stringify(encryptedData)}</p>
      <p><strong>Tampered Encrypted Data:</strong> {JSON.stringify(tamperedData)}</p>
      <p><strong>Response:</strong> {responseMessage}</p>
      {/* Sensor List */}
      <h2>Sensor List</h2>
      {sensorList.length > 0 && (
        <div>
          {sensorList.map((sensor, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <p><strong>ID:</strong> {sensor.id}</p>
                <p><strong>Temperature:</strong> {sensor.temperature}</p>
                <p><strong>Latitude:</strong> {sensor.latitude}</p>
                <p><strong>Altitude:</strong> {sensor.altitude}</p>
              </div>
              <p style={{ textAlign: 'center', fontStyle: 'italic', marginTop: '5px' }}><strong>Signature:</strong> {sensor.signature}</p>
            </div>
          ))}
        </div>
      )}

      
    </div>
  );
}

export default App;
