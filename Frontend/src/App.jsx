import React, { useState } from 'react';
import { Stepper, Step, StepLabel } from '@mui/material';
import TemperatureTable from './components/TemperatureTable';
import {
  generateKeyPair,
  fetchServerPublicKey,
  computeSharedSecret,
  encryptData,
  signData,
  submitData,
} from './components/ApiComunication';

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

  const handleGenerateKeyPair = () => {
    const keyPair = generateKeyPair();
    setClientKeyPair(keyPair);
    setActiveStep(1);
  };

  const handleFetchServerPublicKey = async () => {
    try {
      const publicKey = await fetchServerPublicKey();
      setServerPublicKey(publicKey);
      setActiveStep(2);
    } catch (error) {
      alert('Error fetching server public key');
    }
  };

  const handleComputeSharedSecret = () => {
    const secret = computeSharedSecret(clientKeyPair, serverPublicKey);
    setSharedSecret(secret);
    setActiveStep(3);
  };

  const handleEncryptData = () => {
    if (!isFormComplete()) {
      alert('Please fill out the entire form before encrypting.');
      return;
    }
    const encrypted = encryptData(sharedSecret, sensorData);
    setEncryptedData(encrypted);
    setTamperedData('');
    setActiveStep(4);
  };

  const handleSignData = () => {
    const signature = signData(clientKeyPair, encryptedData);
    setSignature(signature);
    setActiveStep(5);
  };

  const handleSubmitData = async (data) => {
    try {
      const message = await submitData(data, signature, clientKeyPair.getPublic('hex'));
      setResponseMessage(message);
      setSensorList((prevList) => [...prevList, { ...sensorData, signature }]);
    } catch (error) {
      setResponseMessage(error);
    }
  };

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

      <Stepper activeStep={activeStep} style={{ marginBottom: '20px' }}>
        <Step><StepLabel>Generate Key Pair</StepLabel></Step>
        <Step><StepLabel>Fetch Server Public Key</StepLabel></Step>
        <Step><StepLabel>Compute Shared Secret</StepLabel></Step>
        <Step><StepLabel>Encrypt Data</StepLabel></Step>
        <Step><StepLabel>Sign Data</StepLabel></Step>
      </Stepper>

      <div style={{ display: 'flex', justifyContent: 'space-evenly', marginBottom: '20px', flexWrap: 'nowrap' }}>
        <button onClick={handleGenerateKeyPair}>Generate Key Pair</button>
        <button onClick={handleFetchServerPublicKey}>Fetch Server Public Key</button>
        <button onClick={handleComputeSharedSecret}>Compute Shared Secret</button>
        <button onClick={handleEncryptData}>Encrypt Data</button>
        <button onClick={handleSignData}>Sign Data</button>
      </div>

      <form style={{ marginBottom: '20px' }}>
        <input type="text" name="id" placeholder="Sensor ID" value={sensorData.id} onChange={handleInputChange} required />
        <input type="text" name="temperature" placeholder="Temperature" value={sensorData.temperature} onChange={handleInputChange} required />
        <input type="text" name="latitude" placeholder="Latitude" value={sensorData.latitude} onChange={handleInputChange} required />
        <input type="text" name="altitude" placeholder="Altitude" value={sensorData.altitude} onChange={handleInputChange} required />
      </form>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        <button onClick={() => handleSubmitData(encryptedData)}>Submit Original Data</button>
      </div>

      <h2>Data Overview</h2>
      <p><strong>Original Encrypted Data:</strong> {JSON.stringify(encryptedData)}</p>
      <p><strong>Response:</strong> {responseMessage}</p>

      <h2>Sensor List</h2>
      {sensorList.length > 0 && (
        <div>
          {sensorList.map((sensor, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <p><strong>ID:</strong> {sensor.id}</p>
              <p><strong>Temperature:</strong> {sensor.temperature}</p>
            </div>
          ))}
        </div>
      )}

      <TemperatureTable clientKeyPair={clientKeyPair} signature={signature}/>
    </div>
  );
}

export default App;
