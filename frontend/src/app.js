import React, { useState } from "react";
import MapView from "./mapView";
import EldChart from "./EldChart";

function App() {
  const [inputs, setInputs] = useState({
    current: "24.8607,67.0011", // Karachi
    pickup: "24.8607,67.0011",
    dropoff: "33.6844,73.0479", // Islamabad
    current_cycle_used_hours: 0,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

  const planTrip = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/trip/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateFuelStops = (route) => {
    if (!route?.osrm_geometry?.coordinates) return [];
    const coords = route.osrm_geometry.coordinates;
    const numStops = Math.floor(route.summary?.distance_miles / 1000) || 0;
    if (numStops === 0) return [];
    const step = Math.floor(coords.length / (numStops + 1));
    const stops = [];
    for (let i = 1; i <= numStops; i++) {
      stops.push([coords[i * step][0], coords[i * step][1]]);
    }
    return stops;
  };

  const calculateRestStops = (route) => {
    if (!route?.osrm_geometry?.coordinates) return [];
    const totalHours = route.summary?.estimated_drive_hours || 0;
    const restCount = Math.floor(totalHours / 8);
    if (restCount === 0) return [];
    const coords = route.osrm_geometry.coordinates;
    const step = Math.floor(coords.length / (restCount + 1));
    const stops = [];
    for (let i = 1; i <= restCount; i++) {
      stops.push([coords[i * step][0], coords[i * step][1]]);
    }
    return stops;
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        {/* Title */}
        <h1>Trip Planner</h1>

        {/* Trip Plan Form */}
        <div className="box trip-form">
          <h2>Trip Plan Details</h2>
          {["current","pickup","dropoff"].map(name => (
            <div key={name} className="input-group">
              <label>
                {name.charAt(0).toUpperCase() + name.slice(1)} (lat,lon)
              </label>
              <input
                type="text"
                name={name}
                value={inputs[name]}
                onChange={handleChange}
              />
            </div>
          ))}
          <div className="input-group">
            <label>Current Cycle Used (hrs)</label>
            <input
              type="number"
              name="current_cycle_used_hours"
              value={inputs.current_cycle_used_hours}
              onChange={handleChange}
            />
          </div>
          <button onClick={planTrip} disabled={loading} className="plan-button">
            {loading ? "Planning Trip..." : "Plan Trip"}
          </button>
        </div>

        {/* Map */}
        {result && (
          <div className="box animate-fadeIn">
            <h2>Route Map</h2>
            <MapView
              geometry={result.osrm_geometry}
              current={inputs.current.split(",").map(Number)}
              pickup={inputs.pickup.split(",").map(Number)}
              dropoff={inputs.dropoff.split(",").map(Number)}
              fuelStops={calculateFuelStops(result)}
              restStops={calculateRestStops(result)}
            />
          </div>
        )}

        {/* Trip Summary & ELD Logs */}
        {result && (
          <div className="grid">
            <div className="box animate-fadeIn">
              <h2>Trip Summary</h2>
              <p><strong>Distance:</strong> {result.summary.distance_miles} miles</p>
              <p><strong>Estimated Hours:</strong> {result.summary.estimated_drive_hours} h</p>
              <p><strong>Fuel Stops (est):</strong> {result.summary.fuel_stops_estimated}</p>
              <p><strong>Rest Stops (est):</strong> {result.summary.rest_stops_estimated}</p>
              <p><strong>Cycle Remaining:</strong> {result.summary.cycle_remaining_hours} h</p>
            </div>
            <div className="box animate-fadeIn">
              <h2>ELD Daily Logs</h2>
              <EldChart days={result.days_plan} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
