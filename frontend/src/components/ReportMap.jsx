import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const ReportMap = ({ reports }) => {
    // Calculate center from reports or use India center
    const center = reports.length > 0
        ? { lat: reports[0].latitude, lng: reports[0].longitude }
        : { lat: 20.5937, lng: 78.9629 };

    return (
        <MapContainer
            center={center}
            zoom={6}
            style={{ height: '600px', width: '100%', borderRadius: '0.5rem' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {reports.map((report) => (
                <Marker
                    key={report.id}
                    position={{ lat: report.latitude, lng: report.longitude }}
                >
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-bold text-sm">{report.title}</h3>
                            <p className="text-xs text-gray-600 mt-1">{report.aiDescription?.substring(0, 100)}...</p>
                            <p className="text-xs text-gray-500 mt-2">
                                Status: <span className={`font-medium ${report.status === 'resolved' ? 'text-green-600' :
                                        report.status === 'in-progress' ? 'text-orange-600' :
                                            'text-red-600'
                                    }`}>{report.status}</span>
                            </p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default ReportMap;
