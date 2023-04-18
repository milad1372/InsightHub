import BumpChart from '../../components/bump-chart';
import * as d3 from 'd3';
import { useEffect, useState } from 'react';
// import { Carousel } from 'react-bootstrap';
import RangeSlider from '../../components/range-slider';
import languagesDataJson from '../../components/bump-chart/languages_data.json';
import LineCharts from '../line-charts';
import { scaleOrdinal } from 'd3-scale';
import { schemePaired } from 'd3-scale-chromatic';

const languagesData: LanguagesData = languagesDataJson;

const COMMIT_INDEX = 0;
const PRS_INDEX = 1;
const REPO_INDEX = 2;

const MIN_YEAR = 2011;
const MAX_YEAR = 2021;

const chartContainer = {
  width: window.innerWidth * 0.32,
  height: window.innerHeight * 0.32
};

export interface ChartData {
  id: string;
  data: {
    x: number;
    y: number | null | any;
  }[];
}

interface LanguageData {
  purposes: string[];
  paradigms: string[];
}
interface LanguagesData {
  [key: string]: LanguageData;
}

const LangRanking = () => {
  // State variables
  const [chartNumberLimit, setChartNumberLimit] = useState(5);
  const [rankData, setRankData] = useState<ChartData[]>([] as ChartData[]);
  const [index, setIndex] = useState(0);
  const [min, setMin] = useState(MIN_YEAR);
  const [max, setMax] = useState(MAX_YEAR);
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [selectedParadigm, setSelectedParadigm] = useState('');
  const [commitData, setCommitData] = useState<ChartData[]>([] as ChartData[]);
  const [prData, setPrData] = useState<ChartData[]>([] as ChartData[]);
  const [repoData, setRepoData] = useState<ChartData[]>([] as ChartData[]);
  const [languageNames, setLanguageNames] = useState(new Set());
  const [limitedLanguages, setLimitedLanguages] = useState(new Set());
  const colorScale = scaleOrdinal()
    .domain(Array.from(limitedLanguages) as string[])
    .range(schemePaired);
  // Extract unique purposes and paradigms from languagesData
  const uniquePurposes = Array.from(
    new Set(
      Object.entries(languagesData)
        .filter(([key]) => languageNames.has(key))
        .flatMap(([, langData]) => langData.purposes)
    )
  );

  const uniqueParadigms = Array.from(
    new Set(
      Object.entries(languagesData)
        .filter(([key]) => languageNames.has(key))
        .flatMap(([, langData]) => langData.paradigms)
    )
  );

  // Object to store language ranking data
  const rankDict: Record<string, { x: number; y: number | null }[]> = {};

  // Callback function for when a new slide is selected in the carousel
  const updateSelectedChart = (selectedIndex: number) => {
    let dataSource;
    switch (selectedIndex) {
      case COMMIT_INDEX:
        dataSource = './data/commits.csv';
        break;
      case PRS_INDEX:
        dataSource = './data/prs.csv';
        // dataSource = './data/repos.csv';
        break;
      case REPO_INDEX:
        dataSource = './data/repos.csv';
        break;
      default:
        dataSource = './data/commits.csv';
        break;
    }
    updateDataSource(dataSource, selectedIndex);
  };

  // UseEffect hook to handle changes to the min and max state variables
  useEffect(() => {
    updateSelectedChart(COMMIT_INDEX);
    updateSelectedChart(PRS_INDEX);
    updateSelectedChart(REPO_INDEX);
  }, [min, max]);

  // UseEffect hook to initialize the component
  useEffect(() => init(), []);

  // UseEffect hook to handle changes to the index state variable
  useEffect(() => {
    updateSelectedChart(index);
  }, [index]);

  // UseEffect hook to handle changes to the chartNumberLimit, selectedPurpose, and selectedParadigm state variables
  useEffect(() => {
    updateSelectedChart(COMMIT_INDEX);
    updateSelectedChart(PRS_INDEX);
    updateSelectedChart(REPO_INDEX);
  }, [chartNumberLimit, selectedPurpose, selectedParadigm]);

  // Function to initialize the component
  function init() {
    // Set the initial slide to be the commits slide
    setIndex(0);
    // Load the initial data for the commits slide
    updateDataSource('./data/commits.csv', COMMIT_INDEX);
  }

  function renderSelectedChart(title: string, selectedIndex: number) {
    let chartData;
    switch (selectedIndex) {
      case COMMIT_INDEX:
        chartData = commitData;
        break;
      case PRS_INDEX:
        chartData = prData;
        break;
      case REPO_INDEX:
        chartData = repoData;
        break;
      default:
        chartData = commitData;
        break;
    }
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          paddingTop: '20px'
        }}>
        <h4>{title}</h4>
        <BumpChart data={chartData} styles={{ chartContainer }} colorScale={colorScale} />
      </div>
    );
  }
  // Function to adjust ranking in filtered data
  function adjustRanking(filteredRanks: ChartData[]) {
    for (const year of d3.range(min, max + 1)) {
      const yearData: { id: string; y: number | null }[] = [];
      for (const language of filteredRanks) {
        const dataPoint = language.data.find((d) => d.x === year);
        if (dataPoint && dataPoint.y !== null) {
          yearData.push({ id: language.id, y: dataPoint.y });
        }
      }
      yearData.sort((a, b) => (a.y as number) - (b.y as number));
      for (const [newRank, { id }] of Array.from(yearData.entries())) {
        const language = filteredRanks.find((lang) => lang.id === id);
        if (language) {
          const dataPoint = language.data.find((d) => d.x === year);
          if (dataPoint) {
            dataPoint.y = newRank + 1;
          }
        }
      }
    }
  }
  function isNotNull<T>(value: T | null): value is T {
    return value !== null;
  }
  // Function to load data from a CSV file
  function updateDataSource(path: string, selectedIndex: number) {
    const rankDict: Record<string, { x: number; y: number | null }[]> = {};

    d3.csv(path).then((data: any) => {
      const newLanguageNames = new Set(data.map((d: any) => d.language_name));
      setLanguageNames(newLanguageNames);
      // setLanguageNames(new Set(data.map((d: any) => d.language_name)));

      data.map((d: any) => {
        const key: string = d.language_name;
        const dataArray = (rankDict as any)[key];

        if (!dataArray) {
          (rankDict as any)[key] = [
            {
              x: +d.year,
              y: +d.year_rank
            }
          ];
        } else if (!(dataArray.filter((register: any) => register.x === +d.year).length > 0)) {
          dataArray.push({
            x: +d.year,
            y: +d.year_rank
          });
        }
      });

      const filteredRanks: ChartData[] = [];

      for (const [key, value] of Object.entries(rankDict)) {
        const didNotAppearInTop10 = (value as any).every((data: any) => data.y == null);
        if ((value as any).length >= 11 && !didNotAppearInTop10) {
          const languageData = languagesData[key];

          // Check if languageData exists and if it matches the selected filters
          if (
            languageData &&
            (selectedPurpose === '' || languageData.purposes.includes(selectedPurpose)) &&
            (selectedParadigm === '' || languageData.paradigms.includes(selectedParadigm))
          ) {
            filteredRanks.push({ id: key, data: value as any });
          }
        }
      }

      // Sort languages by their sum of ranks across years
      filteredRanks.sort((a, b) => d3.sum(a.data, (d) => d.y) - d3.sum(b.data, (d) => d.y));
      // Adjust ranking in filtered data
      adjustRanking(filteredRanks);

      // Slice the array based on the chartNumberLimit
      const limitedRanks = filteredRanks.slice(0, chartNumberLimit);

      limitedRanks.map((language) => language.data.sort((a, b) => a.x - b.x));
      limitedRanks.map((language) => {
        language.data = language.data.filter(
          (dataPoint) => dataPoint.x >= min && dataPoint.x <= max
        );
      });

      // Normalize the ranks based on the chartNumberLimit
      for (let year = min; year <= max; year++) {
        const yearData = limitedRanks
          .map((lang) => {
            const dataPoint = lang.data.find((d) => d.x === year);
            return dataPoint ? { id: lang.id, y: dataPoint.y } : null;
          })
          .filter((d) => d !== null);

        const filteredYearData = yearData.filter(isNotNull);

        filteredYearData.sort((a, b) => a.y - b.y);
        for (const [newRank, { id }] of Array.from(filteredYearData.entries())) {
          const language = limitedRanks.find((lang) => lang.id === id);
          if (language) {
            const dataPoint = language.data.find((d) => d.x === year);
            if (dataPoint) {
              dataPoint.y = newRank + 1;
            }
          }
        }
      }
      if (selectedIndex === COMMIT_INDEX) {
        setCommitData(limitedRanks);
      } else if (selectedIndex === PRS_INDEX) {
        setPrData(limitedRanks);
      } else if (selectedIndex === REPO_INDEX) {
        setRepoData(limitedRanks);
      }
    });
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '-5px'
      }}>
      <h3>Languages Ranking</h3>
      <p
        style={{
          width: '100%'
        }}>
        A ranking and trend of top programming languages and thier paradigms, types and purposes
        according to the number of <b>commits</b>, <b>pull requests</b>, and <b>repositories</b>{' '}
        over time.
      </p>
      <div
        style={{
          width: '90vw'
        }}>
        <div className="container">
          <div className="row">
            <div className="col-md-3"></div>
            <div className="col-md-2">
              <label htmlFor="chartNumberLimit">Chart Limit:</label>
              <select
                value={chartNumberLimit}
                onChange={(e) => {
                  setChartNumberLimit(parseInt(e.target.value));
                }}
                className="form-select"
                id="chartNumberLimit">
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
            </div>
            <div className="col-md-2">
              <label htmlFor="purposeFilter">Filter by Purpose:</label>
              <select
                value={selectedPurpose}
                onChange={(e) => {
                  setSelectedPurpose(e.target.value);
                }}
                className="form-select"
                id="purposeFilter">
                <option value="">All</option>
                {uniquePurposes.map((purpose) => (
                  <option key={purpose} value={purpose}>
                    {purpose}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label htmlFor="paradigmFilter">Filter by Paradigm:</label>
              <select
                value={selectedParadigm}
                onChange={(e) => {
                  setSelectedParadigm(e.target.value);
                }}
                className="form-select"
                id="paradigmFilter">
                <option value="">All</option>
                {uniqueParadigms.map((paradigm) => (
                  <option key={paradigm} value={paradigm}>
                    {paradigm}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3"></div>
          </div>
          <div className="row" style={{ marginTop: '20px' }}>
            <div className="col-md-12 d-flex justify-content-center">
              <RangeSlider
                min={MIN_YEAR}
                max={MAX_YEAR}
                defaultMin={2017}
                defaultMax={2021}
                onChange={({ min, max }) => {
                  setMin(min);
                  setMax(max);
                }}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
            paddingBottom: '20px'
          }}>
          {renderSelectedChart('Commits', COMMIT_INDEX)}
          {renderSelectedChart('Pull Requests', PRS_INDEX)}
          {renderSelectedChart('Repositories', REPO_INDEX)}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: -innerHeight * 0.07
          }}></div>
        <div>
          <LineCharts
            chartNumberLimit={chartNumberLimit}
            purposeFilter={selectedPurpose ? [selectedPurpose] : []}
            paradigmFilter={selectedParadigm ? [selectedParadigm] : []}
            minYear={min}
            maxYear={max}
            colorScale={colorScale}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '-7%'
          }}></div>
      </div>
    </div>
  );
};

export default LangRanking;
