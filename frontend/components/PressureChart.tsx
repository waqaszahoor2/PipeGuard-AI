"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { label: string; pressure: number };

export function PressureChart() {
  const [data, setData] = useState<Point[]>([]);
  useEffect(() => {
    fetch("/pressure_trend.json").then((r) => r.json()).then(setData).catch(() => setData([]));
  }, []);
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 18, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="4 4" opacity={0.25} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={3} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="pressure" stroke="#0969f9" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
