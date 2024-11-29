import React, { useState } from 'react';
import { Stepper, Step, StepLabel, Slider } from '@mui/material';
import TemperatureTable from './components/TemperatureTable';
import Swal from 'sweetalert2';
import {
  generateKeyPair,
  fetchServerPublicKey,
  computeSharedSecret,
  encryptData,
  signData,
  submitData,
} from './components/ApiComunication';
import './app.css';

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
  const [uploadCount, setUploadCount] = useState(0);
  const [numEntries, setNumEntries] = useState(5);

  const handleGenerateKeyPair = () => {
    const keyPair = generateKeyPair();
    setClientKeyPair(keyPair);
    setActiveStep(1);
    Swal.fire('Key Pair Generated', `Public Key: ${keyPair.getPublic('hex')}<br>Private Key: ${keyPair.getPrivate('hex')}`, 'success');
  };

  const handleFetchServerPublicKey = async () => {
    try {
      const publicKey = await fetchServerPublicKey();
      setServerPublicKey(publicKey);
      setActiveStep(2);
      Swal.fire('Server Public Key Fetched', `Server Public Key: ${publicKey}`, 'success');
    } catch (error) {
      Swal.fire('Error', 'Error fetching server public key', 'error');
    }
  };

  const handleComputeSharedSecret = () => {
    const secret = computeSharedSecret(clientKeyPair, serverPublicKey);
    setSharedSecret(secret);
    setActiveStep(3);
    Swal.fire('Shared Secret Computed', `Shared Secret: ${secret}`, 'success');
  };

  const handleEncryptData = () => {
    if (!isFormComplete()) {
      Swal.fire('Incomplete Form', 'Please fill out the entire form before encrypting.', 'warning');
      return;
    }
    const encrypted = encryptData(sharedSecret, sensorData);
    setEncryptedData(encrypted);
    setTamperedData('');
    setActiveStep(4);
    Swal.fire('Data Encrypted', `Encrypted Data: ${JSON.stringify(encrypted)}`, 'success');
  };

  const handleSignData = () => {
    const signature = signData(clientKeyPair, encryptedData);
    setSignature(signature);
    setActiveStep(5);
    Swal.fire('Data Signed', `Signature: ${signature}`, 'success');
  };

  const handleSubmitData = async (data) => {
    try {
      const message = await submitData(data, signature, clientKeyPair.getPublic('hex'));
      setResponseMessage(message);
      setSensorList([{ ...sensorData, signature }]); // Only keep the latest upload
      setUploadCount((prevCount) => prevCount + 1); // Increment the upload count
      Swal.fire('Data Submitted', `Response: ${message}`, 'success');
    } catch (error) {
      setResponseMessage(error);
      Swal.fire('Error', `Error submitting data: ${error}`, 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSensorData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleNumEntriesChange = (event, newValue) => {
    setNumEntries(newValue);
  };

  const isFormComplete = () => {
    return Object.values(sensorData).every((field) => field.trim() !== '');
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Sensor Data</h1>
      </div>

      <div className="stepper-container">
        <Stepper activeStep={activeStep} style={{ marginBottom: '20px' }}>
          {['Generate Key Pair', 'Fetch Server Public Key', 'Compute Shared Secret', 'Encrypt Data', 'Sign Data'].map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{
                  classes: {
                    root: 'step-icon',
                    active: 'step-icon-active',
                    completed: 'step-icon-completed',
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>

      <div className="actions-container">
        <button className="action-button" onClick={handleGenerateKeyPair}>Generate Key Pair</button>
        <button className="action-button" onClick={handleFetchServerPublicKey}>Fetch Server Public Key</button>
        <button className="action-button" onClick={handleComputeSharedSecret}>Compute Shared Secret</button>
        <button className="action-button" onClick={handleEncryptData}>Encrypt Data</button>
        <button className="action-button" onClick={handleSignData}>Sign Data</button>
      </div>

      <form className="form-container">
        <input className="input-field" type="text" name="id" placeholder="Sensor ID" value={sensorData.id} onChange={handleInputChange} required />
        <input className="input-field" type="text" name="temperature" placeholder="Temperature" value={sensorData.temperature} onChange={handleInputChange} required />
        <input className="input-field" type="text" name="latitude" placeholder="Latitude" value={sensorData.latitude} onChange={handleInputChange} required />
        <input className="input-field" type="text" name="altitude" placeholder="Altitude" value={sensorData.altitude} onChange={handleInputChange} required />
      </form>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        <button onClick={() => handleSubmitData(encryptedData)}>Submit Original Data</button>
      </div>

      <div className="data-overview">
        <h2>Data Overview</h2>
        <p><strong>Original Encrypted Data:</strong> {JSON.stringify(encryptedData)}</p>
        <p><strong>Response:</strong> {responseMessage}</p>
      </div>

      <div className="sensor-list">
        <h2>Latest Sensor Data</h2>
        {sensorList.length > 0 && (
          <div>
            <p><strong>ID:</strong> {sensorList[0].id}</p>
            <p><strong>Temperature:</strong> {sensorList[0].temperature}</p>
            <p><strong>Latitude:</strong> {sensorList[0].latitude}</p>
            <p><strong>Altitude:</strong> {sensorList[0].altitude}</p>
          </div>
        )}
        <h2>Total Uploads: {uploadCount}</h2>
      </div>
{/* 
      <div className="slider-container">
        <h2>Number of Entries to Display</h2>
        <Slider
          value={numEntries}
          onChange={handleNumEntriesChange}
          aria-labelledby="num-entries-slider"
          valueLabelDisplay="auto"
          step={1}
          marks
          min={1}
          max={100}
        />
      </div> */}

      <div className="table-container">
        <TemperatureTable clientKeyPair={clientKeyPair} signature={signature} numEntries={numEntries} />
      </div>
    </div>
  );
}

export default App;
