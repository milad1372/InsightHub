import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import * as d3 from 'd3';
import languagesDataJson from '../../components/bump-chart/languages_data.json';

const languagesData: LanguagesData = languagesDataJson;

interface LanguageData {
  purposes: string[];
  paradigms: string[];
}
interface LanguagesData {
  [key: string]: LanguageData;
}

interface ChartData {
  x: string[];
  y: number[];
  name: string;
  mode: any;
  type: any;
}

interface LineChartsProps {
  chartNumberLimit: number;
  paradigmFilter: string[];
  purposeFilter: string[];
  minYear: number;
  maxYear: number;
  colorScale: d3.ScaleOrdinal<string, unknown, never>;
}

const LineCharts: React.FC<LineChartsProps> = ({
  chartNumberLimit,
  paradigmFilter,
  purposeFilter,
  minYear,
  maxYear,
  colorScale
}) => {
  const [commitSeriesData, setCommitSeriesData] = useState<ChartData[]>([]);
  const [prSeriesData, setPrSeriesData] = useState<ChartData[]>([]);
  const [repoSeriesData, setRepoSeriesData] = useState<ChartData[]>([]);

  useEffect(() => {
    const groupBy = function (xs: any[], key: string) {
      return xs.reduce(function (rv, x) {
        if (x[key] in rv) {
          if (rv[x[key]].quarter.at(-1) === x.quarter[0] && rv[x[key]].year.at(-1) === x.year[0]) {
            rv[x[key]].count[rv[x[key]].count.length - 1] += x.count[0];
          } else {
            rv[x[key]].count.push(x.count[0]);
            rv[x[key]].quarter.push(x.quarter[0]);
            rv[x[key]].year.push(x.year[0]);
          }
        } else {
          rv[x[key]] = x;
        }
        return rv;
      }, {});
    };

    function updateDataSource(
      path: string,
      countCol: string,
      setData: any,
      chartNumberLimit: number,
      paradigmFilter: string[],
      purposeFilter: string[],
      minYear: number,
      maxYear: number
    ) {
      const quarters = Array.from({ length: 4 }, (_, i) => i + 1).sort();
      const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => i + minYear).sort();
      const cartesian = (...a: any[]) =>
        a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())));
      let yearsQuarters = cartesian(years, quarters);
      yearsQuarters = yearsQuarters.map(
        ([year, quarter]: [number, number]) => `Q${quarter}/${year}`
      );
      d3.csv(path).then((data: any[]) => {
        const processedData = data.map((each) => {
          return {
            language_name: each.language_name,
            count: [+each[countCol]],
            year: [+each.year],
            quarter: [+each.quarter]
          };
        });
        const filteredData = processedData.filter(
          (item) => item.year[0] >= minYear && item.year[0] <= maxYear
        );
        filteredData.sort((a, b) => {
          const v = a.year[0] - b.year[0];
          if (v !== 0) return v;
          return a.quarter[0] - b.quarter[0];
        });
        const groupedData = groupBy(filteredData, 'language_name');
        console.log(groupedData);
        const plotData = Object.keys(groupedData)
          .map((language) => {
            const x = (groupedData as any)[language].quarter.map(
              (q: any, index: any) => `Q${q}/${(groupedData as any)[language].year[index]}`
            );
            const difference = yearsQuarters.filter((item: any) => !x.includes(item));
            const zeroPadding = difference.map(() => null);
            const color = colorScale(language) as string;
            return {
              x: difference.concat(x),
              y: zeroPadding.concat((groupedData as any)[language].count),
              name: (groupedData as any)[language].language_name,
              mode: 'lines',
              type: 'scatter',
              line: {
                color: color
              }
            } as ChartData;
          })
          .filter((chartData) => {
            const languageKey = Object.keys(languagesData).find(
              (key) => key.toLowerCase() === chartData.name.toLowerCase()
            );
            const languageInfo = languageKey ? languagesData[languageKey] : undefined;
            const languageParadigms = languageInfo?.paradigms || [];
            const languagePurposes = languageInfo?.purposes || [];

            return (
              (paradigmFilter.length === 0 ||
                paradigmFilter.some((filter) =>
                  languageParadigms
                    .map((p: string) => p.toLowerCase())
                    .includes(filter.toLowerCase())
                )) &&
              (purposeFilter.length === 0 ||
                purposeFilter.some((filter) =>
                  languagePurposes
                    .map((p: string) => p.toLowerCase())
                    .includes(filter.toLowerCase())
                ))
            );
          })
          .sort((a, b) => b.y[b.y.length - 1] - a.y[a.y.length - 1])
          .slice(0, chartNumberLimit);
        setData(plotData);
      });
    }
    updateDataSource(
      './data/commits.csv',
      'commit_count',
      setCommitSeriesData,
      chartNumberLimit,
      paradigmFilter,
      purposeFilter,
      minYear,
      maxYear
    );
    updateDataSource(
      './data/prs.csv',
      'pr_count',
      setPrSeriesData,
      chartNumberLimit,
      paradigmFilter,
      purposeFilter,
      minYear,
      maxYear
    );
    updateDataSource(
      './data/repos.csv',
      'repos_count',
      setRepoSeriesData,
      chartNumberLimit,
      paradigmFilter,
      purposeFilter,
      minYear,
      maxYear
    );
  }, [chartNumberLimit, paradigmFilter, purposeFilter, minYear, maxYear]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
      {/* <h2>Line charts</h2>
        <p
          style={{
            width: '50%'
          }}>
          Time series for programming languages according to total number of <b>commits</b>,{' '}
          <b>pull requests</b> and <b>repositories</b>.
        </p> */}
      <div
        style={{
          display: 'flex',
          paddingTop: '20px'
        }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: '25px'
          }}>
          <h4>Commits</h4>
          <Plot
            data={commitSeriesData}
            layout={{
              showlegend: false,
              margin: {
                t: 20
              },
              // colorway: [
              //   '#a6cee3',
              //   '#1f78b4',
              //   '#b2df8a',
              //   '#33a02c',
              //   '#fb9a99',
              //   '#e31a1c',
              //   '#fdbf6f',
              //   '#ff7f00',
              //   '#cab2d6',
              //   '#6a3d9a',
              //   '#ffff99',
              //   '#b15928'
              // ],
              plot_bgcolor: '#222222',
              paper_bgcolor: '#222222',
              font: {
                color: '#ffffff'
              },
              width: window.innerWidth * 0.32,
              height: window.innerHeight * 0.34,
              xaxis: {
                title: {
                  // text: 'Time',
                  font: {
                    size: 12,
                    color: '#aaaaaa'
                  }
                }
              },
              yaxis: {
                title: {
                  text: 'Commits',
                  font: {
                    size: 12,
                    color: '#aaaaaa'
                  }
                }
              }
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: '25px'
          }}>
          <h4>Pull Requests</h4>
          <Plot
            data={prSeriesData}
            layout={{
              showlegend: false,
              margin: {
                t: 20
              },
              // colorway: [
              //   '#a6cee3',
              //   '#1f78b4',
              //   '#b2df8a',
              //   '#33a02c',
              //   '#fb9a99',
              //   '#e31a1c',
              //   '#fdbf6f',
              //   '#ff7f00',
              //   '#cab2d6',
              //   '#6a3d9a',
              //   '#ffff99',
              //   '#b15928'
              // ],
              plot_bgcolor: '#222222',
              paper_bgcolor: '#222222',
              font: {
                color: '#ffffff'
              },
              width: window.innerWidth * 0.32,
              height: window.innerHeight * 0.34,
              xaxis: {
                title: {
                  // text: 'Time',
                  font: {
                    size: 12,
                    color: '#aaaaaa'
                  }
                }
              },
              yaxis: {
                title: {
                  text: 'Pull Requests',
                  font: {
                    size: 12,
                    color: '#aaaaaa'
                  }
                }
              }
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: '25px'
          }}>
          <h4>Repositories</h4>
          <Plot
            data={repoSeriesData}
            layout={{
              showlegend: false,
              margin: {
                t: 20
              },
              // colorway: [
              //   '#a6cee3',
              //   '#1f78b4',
              //   '#b2df8a',
              //   '#33a02c',
              //   '#fb9a99',
              //   '#e31a1c',
              //   '#fdbf6f',
              //   '#ff7f00',
              //   '#cab2d6',
              //   '#6a3d9a',
              //   '#ffff99',
              //   '#b15928'
              // ],
              plot_bgcolor: '#222222',
              paper_bgcolor: '#222222',
              font: {
                color: '#ffffff'
              },
              width: window.innerWidth * 0.32,
              height: window.innerHeight * 0.34,
              xaxis: {
                title: {
                  // text: 'Time',
                  font: {
                    size: 12,
                    color: '#aaaaaa'
                  }
                }
              },
              yaxis: {
                title: {
                  text: 'Repositories',
                  font: {
                    size: 12,
                    color: '#aaaaaa'
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LineCharts;
