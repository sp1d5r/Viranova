import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export interface PingVisualiserProps {
  dataType: dataCollectionType;
}

interface PingData {
  minute: number;
  ping: number;
}

type dataCollectionType = 'Static Collection' | 'Dynamic Decay' | 'Data Freak';

const generateDataPoints = (option: dataCollectionType) => {
  const data: PingData[] = [];
  const totalMinutes = 6 * 24 * 60; // 6 days in minutes

  const addPing = (minute: number) => {
    data.push({ minute, ping: 1 });
    data.push({ minute: minute + 1, ping: 0 }); // Add no-ping point immediately after
  };

  switch (option) {
    case 'Dynamic Decay':
      for (let i = 0; i < totalMinutes; i++) {
        if (i < 12 * 60 && i % 60 === 0) { // Every hour for first 12 hours
          addPing(i);
        } else if (i < 24 * 60 && i % 120 === 0) { // Every 2 hours for next 12 hours
          addPing(i);
        } else if (i % (24 * 60) === 0) { // Then daily
          addPing(i);
        }
      }
      break;
    case 'Static Collection':
      for (let i = 0; i < totalMinutes; i += 24 * 60) { // Once a day
        addPing(i);
      }
      break;
    case 'Data Freak':
      for (let i = 0; i < totalMinutes; i++) {
        if (i < 24 * 60 && i % 60 === 0) { // Every hour for first 24 hours
          addPing(i);
        } else if (i < 48 * 60 && i % 120 === 0) { // Every 2 hours for next 24 hours
          addPing(i);
        } else if (i < 72 * 60 && i % 240 === 0) { // Every 4 hours for next 24 hours
          addPing(i);
        } else if (i % 720 === 0) { // Every 12 hours for remaining time
          addPing(i);
        }
      }
      break;
  }
  return data;
};

export const PingVisualiser: React.FC<PingVisualiserProps> = ({dataType}) => {
  return <ResponsiveContainer width="100%" height={150}>
    <LineChart data={generateDataPoints(dataType)} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
      <XAxis
        dataKey="minute"
        type="number"
        domain={[0, 6 * 24 * 60]}
        tickFormatter={(tick) => `${Math.floor(tick / (24 * 60))}`}
        stroke="#35DC32"
        label={{ value: 'Days', position: 'insideBottomRight', offset: -10, fill: '#35DC32' }}
      />
      <YAxis
        type="number"
        domain={[0, 1]}
        ticks={[0, 1]}
        tickFormatter={(tick) => tick === 1 ? 'Ping' : ''}
        stroke="#22c55e"
      />
      <Tooltip
        contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
        labelStyle={{ color: '#35DC32' }}
        formatter={(value, name, props) => [value === 1 ? 'Ping' : 'No Ping', `At ${Math.floor(props.payload.minute / 60)}h ${props.payload.minute % 60}m`]}
        labelFormatter={(label) => `Day ${Math.floor(label / (24 * 60))}`}
      />
      <Line
        type="stepAfter"
        dataKey="ping"
        stroke="#22c55e"
        dot={false}
        isAnimationActive={false}
      />
    </LineChart>
  </ResponsiveContainer>
}