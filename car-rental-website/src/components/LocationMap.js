import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position && map) {
      map.flyTo(position);
    }
  }, [position, map]);

  if (!position) return null;
  
  return (
    <Marker position={position}>
      <Popup>Your car will be located here</Popup>
    </Marker>
  );
}

export default function LocationMap({ position, onPositionChange }) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div style={{ 
        height: '250px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <div>Loading map...</div>
      </div>
    );
  }


  return (
    <MapContainer
      center={[36.7529, 3.0420]} // Default to Algiers coordinates
      zoom={6}
      style={{ height: '250px', width: '100%' }}
      whenReady={() => setMapReady(true)}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <LocationMarker 
        position={position} 
        setPosition={onPositionChange} 
      />
    </MapContainer>
  );
}
