// components/PaymentsChart.jsx
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const data = [
  { date: 'Mon', amount: 300 },
  { date: 'Tue', amount: 500 },
  { date: 'Wed', amount: 250 },
  { date: 'Thu', amount: 800 },
  { date: 'Fri', amount: 700 },
  { date: 'Sat', amount: 1200 },
  { date: 'Sun', amount: 1100 },
];

const PaymentsChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="#e0e0e0" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#1976d2"
          strokeWidth={3}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PaymentsChart;
