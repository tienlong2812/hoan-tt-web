'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export function RevenueChart({ data }: { data: any[] }) {
  // Aggregate data by date
  // Expect data to have created_at and total_amount
  const aggregatedData = data.reduce((acc: any, curr) => {
    const date = new Date(curr.created_at).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' });
    if (!acc[date]) {
      acc[date] = { date, revenue: 0 };
    }
    acc[date].revenue += Number(curr.total_amount);
    return acc;
  }, {});

  // Convert to array and take last 7 items or sort properly
  const chartData = Object.values(aggregatedData).slice(-10); // Display last 10 dates

  if (chartData.length === 0) {
    return <div className="flex h-[350px] items-center justify-center text-muted-foreground">Không có dữ liệu doanh thu gần đây.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${(value / 1000000).toLocaleString()}M`}
        />
        <Tooltip 
          formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Doanh Thu']}
          labelStyle={{ color: 'black' }}
        />
        <Bar dataKey="revenue" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  );
}
