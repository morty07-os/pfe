import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const WILAYA_COORDINATES = {
  'Adrar': [27.8817, -0.2962],
  'Chlef': [36.1650, 1.3380],
  'Laghouat': [33.8000, 2.8650],
  'Oum El Bouaghi': [35.8780, 7.1140],
  'Batna': [35.5569, 6.1830],
  'Béjaïa': [36.7515, 5.0556],
  'Biskra': [34.8512, 5.7282],
  'Béchar': [31.6182, -2.2200],
  'Blida': [36.4722, 2.8333],
  'Bouira': [36.3750, 3.9022],
  'Tamanrasset': [22.7903, 5.5292],
  'Tébessa': [35.4040, 8.1240],
  'Tlemcen': [34.8827, -1.3167],
  'Tiaret': [35.3707, 1.3210],
  'Tizi Ouzou': [36.7169, 4.0497],
  'Alger': [36.7538, 3.0588],
  'Djelfa': [34.6725, 3.2505],
  'Jijel': [36.8210, 5.7634],
  'Sétif': [36.1898, 5.4108],
  'Saïda': [34.8430, 0.1517],
  'Skikda': [36.8715, 6.9075],
  'Sidi Bel Abbès': [35.1892, -0.6300],
  'Annaba': [36.9142, 7.7427],
  'Guelma': [36.4627, 7.4329],
  'Constantine': [36.3650, 6.6147],
  'Médéa': [36.2675, 2.7500],
  'Mostaganem': [35.9311, 0.0892],
  'M\'Sila': [35.7077, 4.5419],
  'Mascara': [35.4021, 0.1397],
  'Ouargla': [31.9480, 5.3332],
  'Oran': [35.6969, -0.6331],
  'El Bayadh': [33.6830, 1.0209],
  'Illizi': [26.5057, 8.4800],
  'Bordj Bou Arréridj': [36.0730, 4.7635],
  'Boumerdès': [36.7582, 3.4755],
  'El Tarf': [36.7670, 8.3130],
  'Tindouf': [27.6744, -8.1472],
  'Tissemsilt': [35.6072, 1.8084],
  'El Oued': [33.3680, 6.8590],
  'Khenchela': [35.4320, 7.1453],
  'Souk Ahras': [36.2863, 7.9511],
  'Tipaza': [36.5892, 2.4480],
  'Mila': [36.4502, 6.2648],
  'Aïn Defla': [36.2640, 1.9680],
  'Naâma': [33.2667, -0.3124],
  'Aïn Témouchent': [35.3042, -1.1400],
  'Ghardaïa': [32.4902, 3.6740],
  'Relizane': [35.7373, 0.5556],
  'El M\'Ghair': [33.9500, 5.9200],
  'El Meniaa': [30.5800, 2.8800],
  'Ouled Djellal': [34.4200, 5.0700],
  'Bordj Badji Mokhtar': [21.6800, 0.9500],
  'Béni Abbès': [30.1300, -2.1700],
  'Timimoun': [29.2600, 0.2300],
  'Touggourt': [33.1000, 6.0600],
  'Djanet': [24.5500, 9.4800],
  'In Salah': [27.1900, 2.4800],
  'In Guezzam': [19.5700, 5.7700]
};

const EnhancedMap = ({ wilaya, cars = [] }) => {
  const center = wilaya ? WILAYA_COORDINATES[wilaya] : [36.7372, 3.0865]; // Default to Algeria center
  
  return (
    <MapContainer 
      center={center} 
      zoom={wilaya ? 12 : 6}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Wilaya marker */}
      {wilaya && (
        <Marker position={center}>
          <Popup>{wilaya}</Popup>
        </Marker>
      )}
      
      {/* Car markers */}
      {cars.map((car, index) => {
        const coords = car.location?.coordinates || 
          (() => {
            const base = WILAYA_COORDINATES[car.wilaya] || center;
            // Add small random offset
            return [
              base[0] + (Math.random() - 0.5) * 0.02,
              base[1] + (Math.random() - 0.5) * 0.02
            ];
          })();
          
        return (
          <Marker 
            key={index} 
            position={coords}
          >
            <Popup>
              <div style={{ color: '#334155' }}>
                <strong>{car.brand} {car.model}</strong><br/>
                {car.wilaya}<br/>
                Price: {car.price} DZD/day
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default EnhancedMap;
