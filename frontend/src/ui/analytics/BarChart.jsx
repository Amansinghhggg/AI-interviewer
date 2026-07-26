import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function BarChart({ data, xKey, yKey, height = 300 }) {
  // Use CSS variables for colors to match the theme
  const primaryColor = "var(--primary)";
  const gridColor = "var(--border)";
  const textColor = "var(--text-secondary)";

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.5} />
          <XAxis 
            dataKey={xKey} 
            axisLine={false}
            tickLine={false}
            tick={{ fill: textColor, fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: textColor, fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ fill: 'var(--background-secondary)', opacity: 0.4 }}
            contentStyle={{ 
              backgroundColor: 'var(--card)', 
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-md)',
            }}
            itemStyle={{ color: 'var(--primary)' }}
          />
          <Bar 
            dataKey={yKey} 
            fill={primaryColor} 
            radius={[4, 4, 0, 0]} 
            maxBarSize={40}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
