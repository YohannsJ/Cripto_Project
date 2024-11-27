import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const TemperatureTable = ({ clientKeyPair, signature }) => {
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
      if (!clientKeyPair || !signature) {
        console.error('Missing clientKeyPair or signature');
        return;
      }

      try {
        const response = await axios.post('http://localhost:3000/sensors', {
          signature: signature,
          publicKey: clientKeyPair.getPublic('hex'),
          n: 5,
        });
        console.log('Server Response:', response.data);
        const data = response.data.data.map((item, index) => ({
          id: index + 1,
          sensor_id: item.id,
          value: item.temperature,
          latitude: item.latitude,
          longitude: item.altitude,
          timestamp: new Date(item.upload_date).toLocaleString(),
        }));

        setRows(data);
      } catch (error) {
        console.error('Error al obtener datos:', error.response.data);
      }
    };

    fetchTemperatures();

    const interval = setInterval(fetchTemperatures, 10000);
    return () => clearInterval(interval);
  }, [clientKeyPair, signature]);

  return (
    <div style={{ height: 600, width: '100%' }}>
      <h1>Gestión de registros</h1>
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