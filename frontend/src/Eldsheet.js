import React from "react";
import './ELdsheet.css';


export default function Eldsheet({ logEvents }) {
  const TOTAL_HOURS = 24;
  const HOUR_SCALE = 100 / TOTAL_HOURS;

  const statusColors = {
    "Off Duty": "#A9A9A9",       // Grey
    "Sleeper Berth": "#87CEFA",  // Light Blue
    "Driving": "#4CAF50",        // Green
    "On Duty": "#FFA500",        // Orange
  };

  const getStatusRowClass = (status) => {
    switch (status) {
      case "Off Duty": return "row-1";
      case "Sleeper Berth": return "row-2";
      case "Driving": return "row-3";
      case "On Duty": return "row-4";
      default: return "row-1";
    }
  };

  const formatTime = (decimalHour) => {
    const h = Math.floor(decimalHour);
    const m = Math.round((decimalHour % 1) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  return (
    <div className="eldsheet-container">
      <h2>ELD Daily Log</h2>

      <div className="timeline-wrapper">
        <div className="timeline-labels">
          <div className="status-label">Off Duty</div>
          <div className="status-label">Sleeper Berth</div>
          <div className="status-label">Driving</div>
          <div className="status-label">On Duty</div>
        </div>

        <div className="timeline-area">
          {/* Duty Boxes */}
          {logEvents.map((event, idx) => (
            <div
              key={idx}
              className={`duty-segment ${getStatusRowClass(event.status)}`}
              style={{
                left: `${event.startHour * HOUR_SCALE}%`,
                width: `${event.duration * HOUR_SCALE}%`,
                backgroundColor: statusColors[event.status],
              }}
              title={`${event.status} ${formatTime(event.startHour)}-${formatTime(event.endHour)}`}
            >
              <span className="segment-text">{event.status}</span>
            </div>
          ))}

          {/* Vertical connectors */}
          {logEvents.slice(1).map((event, idx) => {
            const prev = logEvents[idx];
            const pos = prev.endHour * HOUR_SCALE;
            return <div key={idx} className="status-change-line" style={{ left: `${pos}%` }} />;
          })}

          {/* Hour markers */}
          {[...Array(25).keys()].map((h) => (
            <div key={h} className="hour-marker" style={{ left: `${h * HOUR_SCALE}%` }}>
              {h}
            </div>
          ))}
        </div>
      </div>

      {/* Styled Remarks */}
      <div className="remarks-section">
        <h3>Remarks</h3>
        <div className="remarks-list">
          {logEvents.map((event, idx) => (
            <div key={idx} className="remark-card">
              <span
                className="remark-badge"
                style={{ backgroundColor: statusColors[event.status] }}
              >
                {event.status}
              </span>
              <div className="remark-details">
                <span className="remark-time">
                  {formatTime(event.startHour)} - {formatTime(event.endHour)}
                </span>
                <span className="remark-location">
                  {event.location || event.remarks || ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
