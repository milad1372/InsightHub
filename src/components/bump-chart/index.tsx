import { useState } from 'react';
import { ResponsiveBump } from '@nivo/bump';
import styles from './styles';
import data from './data';
import languagesData from './languages_data.json'; // Import the languages data
import { ScaleOrdinal } from 'd3-scale';

interface BumpChartProps {
  data?: any;
  styles?: any;
  colorScale?: ScaleOrdinal<string, unknown, never>; // Add colorScale as optional prop
}

// Define the LanguagesData type
interface LanguageData {
  purposes: string[];
  paradigms: string[];
}

type LanguagesData = {
  [key: string]: LanguageData;
};

const theme = {
  background: '#222222',
  axis: {
    fontSize: '14px',
    tickColor: '#eee',
    ticks: {
      line: {
        stroke: '#555555'
      },
      text: {
        fill: '#ffffff'
      }
    },
    legend: {
      text: {
        fill: '#aaaaaa'
      }
    }
  },
  grid: {
    line: {
      stroke: '#555555'
    }
  }
};

const BumpChart = (props: BumpChartProps) => {
  const chartData: any = props?.data ?? data;
  const [selectedValue, setSelectedValue] = useState('all');
  const filteredData =
    selectedValue === 'all' ? chartData : chartData.filter((d: any) => d.group === selectedValue);

  const colorFn = props.colorScale
    ? (serie: any) => props.colorScale!(serie.id) as string
    : undefined;

  // Custom tooltip function
  const CustomTooltip = ({ serie }: { serie: any }) => {
    const language = serie.id;
    const languageData = (languagesData as LanguagesData)[language]; // Cast the languagesData object to the defined type

    if (languageData) {
      return (
        <div style={{ backgroundColor: '#2e2e2e', padding: '8px', borderRadius: '4px' }}>
          <strong>{language}</strong>
          <table style={{ marginTop: '8px' }}>
            <tbody>
              <tr>
                <td style={{ paddingRight: '7px' }}>
                  <strong>Purposes:</strong>
                </td>
                <td>{languageData.purposes.join(', ')}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: '8px' }}>
                  <strong>Paradigms:</strong>
                </td>
                <td>{languageData.paradigms.join(', ')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={props?.styles?.chartContainer ?? styles.chartContainer}>
      <ResponsiveBump
        data={chartData}
        colors={colorFn}
        // colors={{ scheme: 'paired' }}
        // colors={{ scheme: 'spectral' }}
        tooltip={CustomTooltip}
        lineWidth={3}
        activeLineWidth={4}
        inactiveLineWidth={3}
        inactiveOpacity={0.15}
        pointSize={6}
        activePointSize={6}
        inactivePointSize={0}
        pointColor={{ from: 'serie.color', modifiers: [] }}
        pointBorderWidth={3}
        activePointBorderWidth={3}
        pointBorderColor={{ from: 'serie.color' }}
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '',
          legendPosition: 'middle',
          legendOffset: -36
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '',
          legendPosition: 'middle',
          legendOffset: 32
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Ranking',
          legendPosition: 'middle',
          legendOffset: -40
        }}
        margin={{ top: 40, right: 100, bottom: 40, left: 60 }}
        axisRight={null}
        theme={theme}
      />
    </div>
  );
};

export default BumpChart;
