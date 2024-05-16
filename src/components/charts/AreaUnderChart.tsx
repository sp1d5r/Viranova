import React, {useState, useEffect} from "react";
import { AreaChart, Card, List, ListItem } from '@tremor/react';
import {SaliencyCaptured, VisualDifference} from "../../types/collections/Shorts";


export interface AreaUnderChartProps {
  visualDifference: VisualDifference,
  saliencyCaptured: SaliencyCaptured
}

type SummaryValues = {
  name: string,
  value: number,
}

type DataPoint = {
  frameNumber: number,
  saliency: number,
  visualDifference: number,
}

export const AreaUnderChart :React.FC<AreaUnderChartProps> = ({visualDifference, saliencyCaptured}) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [summary, setSummary] = useState<SummaryValues[]>([]);

  useEffect(() => {
    if (saliencyCaptured.saliency_vals && visualDifference.frame_differences) {
      setSummary([
        {
          name: "Saliency",
          value: ((saliencyCaptured.saliency_vals.reduce((acc, currentValue) => acc + currentValue, 0)) / (saliencyCaptured.saliency_vals.length))
        },
        {
          name: "Visual Difference",
          value: ((visualDifference.frame_differences.reduce((acc, currentValue) => acc + currentValue, 0)) / (visualDifference.frame_differences.length))
        },
      ])
    }

    const largestFrameDifference = Math.max(...visualDifference.frame_differences);

    setData(visualDifference.frame_differences.map((frame_difference, index) => ({
      frameNumber: index,
      saliency: saliencyCaptured.saliency_vals[index],
      visualDifference: frame_difference / largestFrameDifference,
    })))

  }, [visualDifference, saliencyCaptured])


  return (
    <>
      <Card className="border border-green-400 rounded shadow bg-gray-800">
        <h3 className="text-lg font-bold text-white">
          Saliency Captured and Visual
        </h3>
        <AreaChart
          data={data}
          index="frameNumber"
          categories={['visualDifference', 'saliency']}
          colors={['green', 'red']}
          valueFormatter={valueFormatter}
          showLegend={false}
          showYAxis={false}
          showGradient={false}
          startEndOnly={true}
          className="mt-6 h-32 text-white"
        />
        <List className="mt-2">
          {summary.map((item) => (
            <ListItem key={item.name}>
              <div className="flex items-center space-x-2 text-white">
                <span
                  className={`${item.name == "Saliency" ? "bg-red-500" : "bg-green-500"} h-0.5 w-3`}
                  aria-hidden={true}
                />
                <span>{item.name}</span>
              </div>
              <span className="font-medium text-white">
                {valueFormatter(item.value)}
              </span>
            </ListItem>
          ))}
        </List>
      </Card>
    </>
  );
}


const valueFormatter = (number: number) =>
  `${Intl.NumberFormat('us').format(number).toString()}`;

