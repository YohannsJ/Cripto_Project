import React, { useState, useEffect } from 'react';
import api from '../api';

const SensorList = () => {
    const [sensors, setSensors] = useState({});

    useEffect(() => {
        // Función para obtener los datos de la API
        const fetchSensors = async () => {
            try {
                const response = await api.get('temperatures/');
                const data = response.data;

                // Procesar los datos para mostrar solo el sensor más reciente por sensor_id
                const latestSensors = {};
                data.forEach((sensor) => {
                    // Si el sensor no existe o la nueva entrada es más reciente, actualizar
                    if (
                        !latestSensors[sensor.sensor_id] ||
                        new Date(sensor.timestamp) > new Date(latestSensors[sensor.sensor_id].timestamp)
                    ) {
                        latestSensors[sensor.sensor_id] = sensor;
                    }
                });

                setSensors(latestSensors);
            } catch (error) {
                console.error('Error al obtener los sensores:', error);
            }
        };

        // Llamar a la función inmediatamente y configurar un intervalo
        fetchSensors();
        const interval = setInterval(fetchSensors, 10000); // Actualizar cada 5 segundos

        // Limpiar el intervalo al desmontar el componente
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h1>Lista de Sensores</h1>
            <ul>
                {Object.values(sensors).map((sensor) => (
                    <li key={sensor.sensor_id}>
                        <strong>Sensor ID:</strong> {sensor.sensor_id} <br />
                        <strong>Valor:</strong> {sensor.value}°C <br />
                        <strong>Ubicación:</strong> ({sensor.latitude}, {sensor.longitude}) <br />
                        <strong>Timestamp:</strong> {new Date(sensor.timestamp).toLocaleString()}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SensorList;
