// Import required libraries and components
import * as d3 from 'd3';
import { ResponsiveBar } from '@nivo/bar';
import { useEffect, useState } from 'react';
import { Carousel } from 'react-bootstrap';
import RangeSlider from '../../components/range-slider';
import WordCloudChart from '../../components/word-cloud-chart';

// Define some constants
const COMMIT_INDEX = 0;
const PRS_INDEX = 1;
const REPO_INDEX = 2;

const MIN_YEAR = 2011;
const MAX_YEAR = 2021;

// Define chart container style
const chartContainer = {
  width: '70vw',
  height: '50vh'
};

// Define ChartData interface
export interface ChartData {
  id: string;
  data: {
    x: number;
    y: number | null | any;
    occ: number;
  }[];
}

// Define events array
const events = ['Commits', 'PRs', 'Repos'];

// Define WordCloud component
const WordCloud = () => {
  // Define state variables
  const [langData, setLangData] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [min, setMin] = useState(MIN_YEAR);
  const [max, setMax] = useState(MAX_YEAR);
  // Load languages data from JSON file
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const languagesData = require('./data/languages_data.json');

  // Define state variables for word cloud
  const [totalWords, setTotalWords] = useState<number[]>([]);
  const [wordsTypes, setWordsTypes] = useState({});
  // Function to handle carousel item selection
  const handleSelect = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };
  // Update data source based on selected event (commits, PRs, repos)
  useEffect(() => {
    switch (index) {
      case COMMIT_INDEX:
        updateDataSource('./data/commits.csv');
        break;
      case PRS_INDEX:
        updateDataSource('./data/prs.csv');
        break;
      case REPO_INDEX:
        updateDataSource('./data/repos.csv');
        break;
      default:
        updateDataSource('./data/commits.csv');
        break;
    }
  }, [index]);

  const indexEventMapper = ['commit_count', 'pr_count', 'repos_count'];

  // Update data source based on selected date range
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  useEffect(() => {}, [langData]);
  useEffect(() => {
    switch (index) {
      case COMMIT_INDEX:
        updateDataSource('./data/commits.csv');
        break;
      case PRS_INDEX:
        updateDataSource('./data/prs.csv');
        break;
      case REPO_INDEX:
        updateDataSource('./data/repos.csv');
        break;
      default:
        updateDataSource('./data/commits.csv');
        break;
    }
  }, [min, max]);
  // Initialize component on mount
  useEffect(() => init(), []);

  function init() {
    setIndex(0);
    updateDataSource('./data/commits.csv');
  }
  // Function to update data source and calculate word cloud data
  function updateDataSource(path: string) {
    // Define dictionary for language ranks
    const rankDict = {};
    // Load data from CSV file
    d3.csv(path).then((data: any) => {
      // Iterate over data and update rankDict accordingly
      data.map((d: any) => {
        const key: string = d.language_name;
        const dataArray = (rankDict as any)[key];
        // If the language doesn't exist in the dictionary, add it with the first data point
        if (!dataArray) {
          (rankDict as any)[key] = [
            {
              x: +d.year,
              y: +d.year_rank > 20 ? null : +d.year_rank,
              occ: +d[indexEventMapper[index]] ?? 0 // Use indexEventMapper and index variables to determine which CSV column to use for the "occ" value
            }
          ];
        } // If the language exists in the dictionary but not for this year, add a new data point
        else if (!(dataArray.filter((register: any) => register.x === +d.year).length > 0)) {
          dataArray.push({
            x: +d.year,
            y: +d.year_rank > 20 ? null : +d.year_rank,
            occ: +d[indexEventMapper[index]] ?? 0
          });
        } // Calculate the total number of occurrences of each language within the filtered range, and use that information to generate a word cloud
        else if (dataArray.filter((register: any) => register.x === +d.year).length > 0) {
          const year_index = dataArray.map((obj: any) => obj.x).indexOf(+d.year);
          dataArray.splice(year_index, 1, {
            x: dataArray[year_index].x,
            y: dataArray[year_index].y,
            occ: dataArray[year_index].occ + (+d[indexEventMapper[index]] ?? 0)
          });
        }
      });
      // Filter language ranks based on minimum and maximum year, and remove languages with null ranks for all years within that range
      let filteredRanks: ChartData[] = [];
      // Loop through the rank dictionary object and push its key-value pairs to the filteredRanks array
      for (const [key, value] of Object.entries(rankDict)) {
        filteredRanks.push({ id: key, data: value as any });
      }
      // Sort each language data array within the filteredRanks array by their x values
      filteredRanks.map((language) => language.data.sort((a, b) => a.x - b.x));

      // Filter each language data array within the filteredRanks array to include only data points with x values between min and max
      filteredRanks.map((language) => {
        language.data = language.data.filter(
          (dataPoint) => dataPoint.x >= min && dataPoint.x <= max
        );
      });

      // Filter out any languages that have no data points with y values that are not null within the filtered range
      filteredRanks = filteredRanks.filter((obj) => !obj.data.every((val: any) => val.y == null));
      // Calculate the total number of occurrences of each language within the filtered range, and use that information to generate a word cloud
      const words: any = {};
      const wordsTypesTemp: any = {};
      // Loop through each language object within the filteredRanks array and count the total number of occurrences for each language purpose and paradigm/type
      filteredRanks.forEach((obj) => {
        if (languagesData[obj.id]) {
          const factor = obj.data
            .map((v) => (v.y !== null ? v.occ : 0))
            .reduce((previousValue: any, currentValue: any) => previousValue + currentValue, 0);
          // Loop through each language purpose and add its word frequency count to the words object
          languagesData[obj.id].purposes.forEach((element: any) => {
            if (!words[element]) {
              words[element] = factor;
              wordsTypesTemp[element] = 'Language purpose';
            } else {
              words[element] += factor;
              wordsTypesTemp[element] = 'Language purpose';
            }
          });
          // Loop through each language paradigm/type and add its word frequency count to the words object
          languagesData[obj.id].paradigms.forEach((element: any) => {
            if (!words[element]) {
              words[element] = factor;
              wordsTypesTemp[element] = 'Language paradigm/type';
            } else {
              words[element] += factor;
              wordsTypesTemp[element] = 'Language paradigm/type';
            }
          });
        }
      });
      setWordsTypes(wordsTypesTemp); // Set the language purpose and type for each word
      const wordCloudData: any = [];
      const totalWordsTemp = [];
      for (const [key, value] of Object.entries(words)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        totalWordsTemp.push(Number(value));
        wordCloudData.push({
          text: key,
          value: value
        });
      }
      setTotalWords(totalWordsTemp);
      setLangData(wordCloudData);
    });
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '20px'
      }}>
      <h2>Word Clouds</h2>
      <p
        style={{
          width: '50%'
        }}>
        A cloud of words related to the top 20 programming languages paradigms, types and purposes
        according to number of <b>commits</b>, <b>pull requests</b> and <b>repositories</b> along
        time.
      </p>
      <div
        style={{
          width: '90vw'
        }}>
        <Carousel variant="dark" interval={null} activeIndex={index} onSelect={handleSelect}>
          {events.map((event, index) => (
            <Carousel.Item key={index}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  paddingBottom: '25px'
                }}>
                <h3>{event}</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WordCloudChart
                    styles={{ chartContainer }}
                    words={langData}
                    wordsTypes={wordsTypes}
                    totalWords={totalWords}></WordCloudChart>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '-10px'
          }}>
          {/* <RangeSlider
            min={MIN_YEAR}
            max={MAX_YEAR}
            onChange={({ min, max }) => {
              setMin(min);
              setMax(max);
            }}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default WordCloud;
