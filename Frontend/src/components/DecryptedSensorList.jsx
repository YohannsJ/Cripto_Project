import React, { useEffect, useState } from "react";
import api from "../api"; // Tu archivo de configuración Axios
import { decryptData } from "../utils/crypto";

const DecryptedSensorList = () => {
    const [sensors, setSensors] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener los datos cifrados de la API
                const response = await api.get("temperatures/");
                const encryptedData = response.data;

                // Descifrar cada dato
                const decryptedSensors = encryptedData.map((sensor) =>
                    decryptData(sensor)
                );

                setSensors(decryptedSensors);
            } catch (error) {
                console.error("Error al obtener o descifrar datos:", error);
            }
        };

        fetchData();

        // Configurar un intervalo para obtener datos periódicamente
        const interval = setInterval(fetchData, 5000);

        return () => clearInterval(interval); // Limpiar el intervalo al desmontar
    }, []);

    return (
        <div>
            <h1>Sensores Descifrados</h1>
            <ul>
                {sensors.map((sensor, index) => (
                    <li key={index}>
                        <strong>Sensor ID:</strong> {sensor.sensor_id} <br />
                        <strong>Valor:</strong> {sensor.value}°C <br />
                        <strong>Timestamp:</strong> {sensor.timestamp}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DecryptedSensorList;
