import React, { useState } from 'react';
import api from '../api';

const AddTemperature = () => {
    const [sensorId, setSensorId] = useState('');
    const [value, setValue] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('temperatures/', {
                sensor_id: sensorId,
                value: parseFloat(value),
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
            });
            alert('Temperatura agregada correctamente');
            setSensorId('');
            setValue('');
            setLatitude('');
            setLongitude('');
        } catch (error) {
            console.error('Error al agregar la temperatura:', error);
            alert('Error al agregar la temperatura');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Agregar Temperatura</h2>
            <label>
                Sensor ID:
                <input
                    type="text"
                    value={sensorId}
                    onChange={(e) => setSensorId(e.target.value)}
                    required
                />
            </label>
            <br />
            <label>
                Valor:
                <input
                    type="number"
                    step="0.1"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                />
            </label>
            <br />
            <label>
                Latitud:
                <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    required
                />
            </label>
            <br />
            <label>
                Longitud:
                <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    required
                />
            </label>
            <br />
            <button type="submit">Agregar</button>
        </form>
    );
};

export default AddTemperature;
