import React from 'react';
import TemperatureList from './components/TemperatureList';
import AddTemperature from './components/AddTemperature';
import SensorList from './components/SensorList';
import TemperatureTable from './components/TemperatureTable';
// import ChileMap from './components/chileMap';
function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Gestión de Temperaturas</h1>
                <AddTemperature />
                {/* <TemperatureList /> */}
                <TemperatureTable />
                <SensorList />
                {/* <ChileMap /> */}
            </header>
        </div>
    );
}

export default App;
