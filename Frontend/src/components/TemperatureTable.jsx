import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const TemperatureTable = ({ numEntries }) => {
  const [rows, setRows] = useState([]);
  const [rawRows, setRawRows] = useState([]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'sensor_id', headerName: 'Sensor ID', width: 150 },
    { field: 'value', headerName: 'Temperatura (°C)', width: 180 },
    { field: 'latitude', headerName: 'Latitud', width: 150 },
    { field: 'longitude', headerName: 'Longitud', width: 150 },
    { field: 'timestamp', headerName: 'Hora de Subida', width: 200, type: 'dateTime' },
  ];

  const rawColumns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'encrypted_data', headerName: 'Encrypted Data', width: 300 },
    { field: 'upload_date', headerName: 'Upload Date', width: 200, type: 'dateTime' },
  ];

  useEffect(() => {
    const fetchTemperatures = async () => {
      try {
        const response = await axios.get('http://localhost:3000/sensors/naturaly');
        console.log('Server Response:', response.data);
        const data = response.data.map((item, index) => ({
          id: index + 1,
          sensor_id: item.id,
          value: item.temperature,
          latitude: item.latitude,
          longitude: item.altitude,
          timestamp: new Date(item.upload_date),
        }));

        setRows(data);
      } catch (error) {
        console.error('Error al obtener datos:', error.response.data);
      }
    };

    const fetchRawData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/sensors/raw');
        console.log('Raw Data Response:', response.data);
        const rawData = response.data.map((item, index) => ({
          id: index + 1,
          encrypted_data: item.encrypted_data,
          upload_date: new Date(item.upload_date),
        }));

        setRawRows(rawData);
      } catch (error) {
        console.error('Error al obtener datos encriptados:', error.response.data);
      }
    };

    fetchTemperatures();
    fetchRawData();

    const interval = setInterval(() => {
      fetchTemperatures();
      fetchRawData();
    }, 5000);
    return () => clearInterval(interval);
  }, [numEntries]);

  return (
    <>
      <h1>Gestión de registros</h1>
      <div style={{ height: 600, marginBottom: '2rem' }}>
        <DataGrid
          rows={[...rows].sort((a, b) => b.timestamp - a.timestamp)}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          checkboxSelection
          disableSelectionOnClick
        />
      </div>
      <h1>Datos Encriptados</h1>
      <div style={{ height: 600 }}>
        <DataGrid
          rows={[...rawRows].sort((a, b) => b.upload_date - a.upload_date)}
          columns={rawColumns}
          pageSize={rawRows.length}
          rowsPerPageOptions={[rawRows.length]}
          checkboxSelection
          disableSelectionOnClick
        />
      </div>
    </>
  );
};

export default TemperatureTable;
