import React from 'react';
import TemperatureList from './components/TemperatureList';
import AddTemperature from './components/AddTemperature';
import SensorList from './components/SensorList';
function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Gestión de Temperaturas</h1>
                <AddTemperature />
                <TemperatureList />
                <SensorList />
            </header>
        </div>
    );
}

export default App;
