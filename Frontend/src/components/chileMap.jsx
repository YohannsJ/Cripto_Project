import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api'; // Asegúrate de que apunte a tu configuración de API

// Importar tu archivo GeoJSON
import chileRegions from '../chile-regions.json';

const ChileMap = () => {
    const [temperatures, setTemperatures] = useState([]);
    const [regionColors, setRegionColors] = useState({});

    useEffect(() => {
        const fetchTemperatures = async () => {
            try {
                const response = await api.get('temperatures/');
                const data = response.data;

                // Mapear las temperaturas a regiones
                const regionTemp = {};
                data.forEach((entry) => {
                    const { latitude, longitude, value } = entry;

                    // Simulación: Asigna la región basándote en coordenadas
                    // Deberás implementar una lógica para mapear correctamente lat/lon a regiones
                    const region = getRegionByCoordinates(latitude, longitude); 
                    if (!regionTemp[region]) {
                        regionTemp[region] = [];
                    }
                    regionTemp[region].push(value);
                });

                // Calcular el promedio de temperatura por región
                const regionAvgTemp = {};
                Object.keys(regionTemp).forEach((region) => {
                    const avg = regionTemp[region].reduce((a, b) => a + b, 0) / regionTemp[region].length;
                    regionAvgTemp[region] = avg;
                });

                // Mapear colores basados en temperaturas
                const colors = {};
                Object.keys(regionAvgTemp).forEach((region) => {
                    const temp = regionAvgTemp[region];
                    colors[region] = getColorByTemperature(temp);
                });

                setRegionColors(colors);
            } catch (error) {
                console.error('Error al obtener datos de temperatura:', error);
            }
        };

        fetchTemperatures();
    }, []);

    // Lógica para determinar la región según coordenadas
    const getRegionByCoordinates = (latitude, longitude) => {
        // Implementa una lógica para mapear coordenadas a regiones
        // Puedes usar una librería o definir un rango manualmente
        return 'Region Metropolitana'; // Por ahora, asigna como ejemplo
    };

    // Lógica para asignar colores según temperatura
    const getColorByTemperature = (temperature) => {
        if (temperature < 10) return '#0000FF'; // Azul para frío
        if (temperature < 20) return '#FFFF00'; // Amarillo para templado
        if (temperature >= 20) return '#FF0000'; // Rojo para cálido
    };

    const onEachRegion = (region, layer) => {
        const regionName = region.properties.NOMBRE; // Cambia según la estructura de tu GeoJSON
        const color = regionColors[regionName] || '#CCCCCC'; // Color por defecto
        layer.setStyle({
            fillColor: color,
            fillOpacity: 0.7,
            color: '#000',
            weight: 1,
        });

        // Tooltip con información
        layer.bindPopup(`<strong>${regionName}</strong><br>Color: ${color}`);
    };

    return (
        <div style={{ height: '600px', width: '100%' }}>
            <h1>Mapa de Chile</h1>
            <MapContainer center={[-35.675147, -71.542969]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                />
                <GeoJSON data={chileRegions} onEachFeature={onEachRegion} />
            </MapContainer>
        </div>
    );
};

export default ChileMap;
