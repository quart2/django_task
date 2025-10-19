import React, { useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import axios from "axios";
import Eldsheet from "./Eldsheet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import L from "leaflet";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const generateLogEvents = (driveHours) => {
  const log = [];
  log.push({ status: "On Duty", startHour: 0, endHour: 0.5, duration: 0.5, location: "Depot" });
  log.push({ status: "On Duty", startHour: 0.5, endHour: 1.5, duration: 1, location: "Pickup" });
  log.push({ status: "Driving", startHour: 1.5, endHour: 1.5 + driveHours, duration: driveHours, location: "Route" });
  log.push({ status: "Off Duty", startHour: 1.5 + driveHours, endHour: 2.5 + driveHours, duration: 1, location: "Rest Stop" });
  log.push({ status: "On Duty", startHour: 2.5 + driveHours, endHour: 3.5 + driveHours, duration: 1, location: "Dropoff" });
  log.push({ status: "On Duty", startHour: 3.5 + driveHours, endHour: 3.75 + driveHours, duration: 0.25, location: "Depot" });
  const used = 3.75 + driveHours;
  if (used < 24) log.push({ status: "Off Duty", startHour: used, endHour: 24, duration: 24 - used, location: "Home" });
  return log;
};

// Convert city name to lat/lon
const getCoordinates = async (input) => {
  // Check if input is lat,lon
  if (/^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(input)) {
    const [lat, lon] = input.split(",").map(Number);
    return [lat, lon];
  }

  // Otherwise treat as city name
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: input, format: "json", limit: 1 },
    });
    if (res.data && res.data[0]) {
      return [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
    } else {
      throw new Error(`City not found: ${input}`);
    }
  } catch (err) {
    throw new Error(`Geocoding error for ${input}: ${err.message}`);
  }
};

export default function App() {
  const [inputs, setInputs] = useState({
    current: "Karachi", // Default city name
    dropoff: "Islamabad", // Default city name
  });
  const [routeCoords, setRouteCoords] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });

  const planTrip = async () => {
    setLoading(true);
    try {
      const [startLat, startLon] = await getCoordinates(inputs.current);
      const [endLat, endLon] = await getCoordinates(inputs.dropoff);

      const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
      const res = await axios.get(url);

      if (res.data?.routes?.[0]) {
        const route = res.data.routes[0];
        const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
        setRouteCoords(coords);

        const distanceMiles = route.distance / 1609.344;
        const estimatedDriveHours = route.duration / 3600;

        const logEvents = generateLogEvents(estimatedDriveHours);
        setResult({ distanceMiles, estimatedDriveHours, logEvents });
      } else {
        alert("Route calculation failed.");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Input Box */}
      <div className="input-box">
        <h1>Dynamic Trip Planner</h1>
        {["current", "dropoff"].map((name) => (
          <div key={name} className="input-group">
            <label>{name.charAt(0).toUpperCase() + name.slice(1)} (city name or lat,lon):</label>
            <input
              type="text"
              name={name}
              value={inputs[name]}
              onChange={handleChange}
              placeholder="Type city or lat,lon"
            />
          </div>
        ))}
        <div className="button-wrapper">
          <button className="plan-button" onClick={planTrip} disabled={loading}>
            {loading ? "Planning..." : "Plan Trip"}
          </button>
        </div>
      </div>

      {/* Route Summary */}
      {result && (
        <div className="route-summary">
          <h2>Route Summary</h2>
          <p><strong>Distance:</strong> {result.distanceMiles.toFixed(2)} miles</p>
          <p><strong>Estimated Drive Hours:</strong> {result.estimatedDriveHours.toFixed(2)} h</p>
        </div>
      )}

      {/* Map */}
      {result && routeCoords.length > 0 && (
        <div className="map-box">
          <MapContainer center={routeCoords[0]} zoom={6} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Polyline positions={routeCoords} color="blue" weight={5} />
            <Marker position={routeCoords[0]}><Popup>Start</Popup></Marker>
            <Marker position={routeCoords[routeCoords.length - 1]}><Popup>End</Popup></Marker>
          </MapContainer>
        </div>
      )}

      {/* ELD Log */}
      {result && (
        <div className="eld-box">
          <h2>ELD Log</h2>
          <Eldsheet logEvents={result.logEvents} />
        </div>
      )}
    </div>
  );
}
