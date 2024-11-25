import React from 'react';
import TemperatureList from './components/TemperatureList';
import AddTemperature from './components/AddTemperature';
import SensorList from './components/SensorList';
import DecryptedSensorList from './components/DecryptedSensorList';
function App() {
  return (
      <div className="App">
          <header className="App-header">
              <h1>Datos de Sensores</h1>
              <DecryptedSensorList />
          </header>
      </div>
  );
}


export default App;
