import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ geometry, current, pickup, dropoff, fuelStops, restStops }) {
  if (!geometry?.coordinates) return null;

  return (
    <MapContainer
      bounds={geometry.coordinates}
      style={{ height: "400px", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={geometry.coordinates} color="blue" />

      <Marker position={current}><Popup>Current</Popup></Marker>
      <Marker position={pickup}><Popup>Pickup</Popup></Marker>
      <Marker position={dropoff}><Popup>Dropoff</Popup></Marker>

      {fuelStops.map((pos,i) => <Marker key={`f${i}`} position={pos}><Popup>Fuel Stop</Popup></Marker>)}
      {restStops.map((pos,i) => <Marker key={`r${i}`} position={pos}><Popup>Rest Stop</Popup></Marker>)}
    </MapContainer>
  );
}
