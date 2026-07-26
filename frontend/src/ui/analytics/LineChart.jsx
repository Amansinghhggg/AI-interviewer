import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function LineChart({ data, xKey, yKey, height = 300 }) {
  const primaryColor = "var(--primary)";
  const gridColor = "var(--border)";
  const textColor = "var(--text-secondary)";

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsLineChart
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
            contentStyle={{ 
              backgroundColor: 'var(--card)', 
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-md)',
            }}
            itemStyle={{ color: 'var(--primary)' }}
          />
          <Line 
            type="monotone"
            dataKey={yKey} 
            stroke={primaryColor} 
            strokeWidth={3}
            dot={{ r: 4, fill: 'var(--card)', stroke: primaryColor, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: primaryColor, stroke: 'var(--card)' }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
