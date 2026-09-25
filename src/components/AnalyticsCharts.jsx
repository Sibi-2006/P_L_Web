import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const AnalyticsCharts = ({ trades }) => {
  const chartData = useMemo(() => {
    // Sort trades oldest to newest
    const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let cumulative = 0;
    let winCount = 0;
    let lossCount = 0;

    const data = sorted.map(t => {
      const isProfit = t.type === 'profit';
      cumulative += isProfit ? t.amount : -t.amount;
      
      if (isProfit) winCount++;
      else lossCount++;

      return {
        date: new Date(t.date).toLocaleDateString(),
        pnl: isProfit ? t.amount : -t.amount,
        cumulative,
      };
    });

    return { data, winCount, lossCount };
  }, [trades]);

  const { data, winCount, lossCount } = chartData;

  const winLossData = [
    { name: 'Wins', value: winCount, fill: '#00FF66' }, // brutal-mint
    { name: 'Losses', value: lossCount, fill: '#FF4949' } // brutal-coral
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-4 border-black p-3 shadow-brutal font-mono">
          <p className="font-black uppercase">{label}</p>
          <p className="font-bold">Total: ${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2 brutalist-card p-6 bg-white">
        <h2 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2">Equity Curve</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} />
              <XAxis dataKey="date" stroke="#000" tick={{fontFamily: 'Space Mono', fontWeight: 'bold'}} />
              <YAxis stroke="#000" tick={{fontFamily: 'Space Mono', fontWeight: 'bold'}} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="stepAfter" 
                dataKey="cumulative" 
                stroke="#000" 
                strokeWidth={4} 
                dot={{ stroke: '#000', strokeWidth: 2, r: 4, fill: '#FFE600' }} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="lg:col-span-1 brutalist-card p-6 bg-white">
        <h2 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2">Win / Loss Ratio</h2>
        <div className="h-64 w-full flex flex-col justify-center relative">
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={winLossData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} />
              <XAxis dataKey="name" stroke="#000" tick={{fontFamily: 'Space Mono', fontWeight: 'bold'}} />
              <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
              <Bar dataKey="value" stroke="#000" strokeWidth={4}>
                {winLossData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
