import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from "recharts";

const EldChart = ({ days }) => (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={days} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="day" label={{ value: "Day", position: "insideBottom", offset: -5 }} />
      <YAxis label={{ value: "Planned Driving Hours", angle: -90, position: "insideLeft" }} />
      <Tooltip />
      <Bar dataKey="hours" fill="#8884d8">
        <LabelList dataKey="hours" position="top" formatter={(val) => val.toFixed(2)} />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export default EldChart;
