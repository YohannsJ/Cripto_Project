import React, { useState, useEffect } from 'react';
import api from '../api';

const TemperatureList = () => {
    const [temperatures, setTemperatures] = useState([]);

    useEffect(() => {
        const fetchTemperatures = async () => {
            try {
                const response = await api.get('temperatures/');
                setTemperatures(response.data);
            } catch (error) {
                console.error('Error al obtener las temperaturas:', error);
            }
        };

        fetchTemperatures();
    }, []);

    return (
        <div>
            <h1>Lista de Temperaturas</h1>
            <ul>
                {temperatures.map(temp => (
                    <li key={temp.id}>
                        Sensor: {temp.sensor_id}, Valor: {temp.value}°C, Ubicación: ({temp.latitude}, {temp.longitude}), Timestamp: {temp.timestamp}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TemperatureList;
