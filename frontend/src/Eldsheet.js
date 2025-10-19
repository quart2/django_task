import React from "react";
import "./Eldsheet.css";

const statusColors = {
  "Off Duty": "#6c757d",
  "Sleeper Berth": "#17a2b8",
  Driving: "#28a745",
  "On Duty": "#ffc107",
};

export default function Eldsheet({ logEvents }) {
  const events = logEvents || [];

  const TOTAL_HOURS = 24;
  const HOUR_SCALE = 100 / TOTAL_HOURS;

  const getStatusRowClass = (status) => {
    switch (status) {
      case "Off Duty":
        return "row-1";
      case "Sleeper Berth":
        return "row-2";
      case "Driving":
        return "row-3";
      case "On Duty":
        return "row-4";
      default:
        return "row-1";
    }
  };

  const formatTime = (decimalHour) => {
    const hours = Math.floor(decimalHour);
    const minutes = Math.round((decimalHour - hours) * 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
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
          {events.map((event, idx) => (
            <div
              key={idx}
              className={`duty-segment ${getStatusRowClass(event.status)}`}
              style={{
                left: `${event.startHour * HOUR_SCALE}%`,
                width: `${event.duration * HOUR_SCALE}%`,
                backgroundColor: statusColors[event.status],
              }}
              title={`${event.status} ${formatTime(event.startHour)}-${formatTime(
                event.endHour
              )}`}
            >
              <span className="segment-text">{event.status}</span>
            </div>
          ))}

          {events.slice(1).map((event, idx) => {
            const prev = events[idx];
            const pos = prev.endHour * HOUR_SCALE;
            return (
              <div
                key={idx}
                className="status-change-line"
                style={{ left: `${pos}%` }}
              />
            );
          })}

          {[...Array(25).keys()].map((h) => (
            <div
              key={h}
              className="hour-marker"
              style={{ left: `${h * HOUR_SCALE}%` }}
            >
              {h}
            </div>
          ))}
        </div>
      </div>

      <div className="remarks-section">
        <h3>Remarks</h3>
        <div className="remarks-list">
          {events.map((event, idx) => (
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
