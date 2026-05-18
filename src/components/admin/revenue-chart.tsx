'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export function RevenueChart({ data }: { data: any[] }) {
  const aggregatedData = data.reduce((acc: any, curr) => {
    const dateStr = curr.order_date || curr.created_at;
    if (!dateStr) return acc;
    const orderDate = new Date(dateStr);
    const key = orderDate.toISOString().slice(0, 10);

    if (!acc[key]) {
      acc[key] = {
        key,
        date: orderDate.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' }),
        revenue: 0,
      };
    }
    acc[key].revenue += Number(curr.total_amount);
    return acc;
  }, {});

  const chartData = Object.values(aggregatedData)
    .sort((a: any, b: any) => a.key.localeCompare(b.key))
    .slice(-10);

  if (chartData.length === 0) {
    return <div className="flex h-[320px] items-center justify-center text-muted-foreground">Không có dữ liệu doanh thu gần đây.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 12, right: 4, left: -18, bottom: 0 }}>
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
          cursor={{ fill: 'rgba(215, 25, 33, 0.08)' }}
          contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }}
          labelStyle={{ color: 'black', fontWeight: 700 }}
        />
        <Bar dataKey="revenue" fill="currentColor" radius={[8, 8, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  );
}
