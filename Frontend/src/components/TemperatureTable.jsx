import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import api from '../api';

const TemperatureTable = () => {
    const [rows, setRows] = useState([]);

    const columns = [
        { field: 'id', headerName: 'ID', width: 100 },
        { field: 'sensor_id', headerName: 'Sensor ID', width: 150 },
        { field: 'value', headerName: 'Temperatura (°C)', width: 180 },
        { field: 'latitude', headerName: 'Latitud', width: 150 },
        { field: 'longitude', headerName: 'Longitud', width: 150 },
        { field: 'timestamp', headerName: 'Hora de Subida', width: 200 },
    ];

    useEffect(() => {
        const fetchTemperatures = async () => {
            try {
                const response = await api.get('temperatures/');
                const data = response.data.map((item, index) => ({
                    id: index + 1,
                    sensor_id: item.sensor_id,
                    value: item.value,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    timestamp: new Date(item.timestamp).toLocaleString(),
                }));
                setRows(data);
            } catch (error) {
                console.error('Error al obtener las temperaturas:', error);
            }
        };

        fetchTemperatures();

        const interval = setInterval(fetchTemperatures, 10000); // Actualiza cada 10 segundos
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ height: 600, width: '100%' }}>
            <h1>Gestión de Temperaturas</h1>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 20]}
                checkboxSelection
                disableSelectionOnClick
            />
        </div>
    );
};

export default TemperatureTable;
