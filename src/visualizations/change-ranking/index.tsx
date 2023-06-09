import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import TableBody from '../../components/sortable-table/body';
import TableHead from '../../components/sortable-table/head';
import Select from 'react-select';
import { Bar } from '@nivo/bar';
import Slider from '../../components/slider';
import { ControlProps, SingleValueProps, MenuProps, OptionProps } from 'react-select';
import type { CSSObject } from '@emotion/react';

interface YoYData {
  language_name: string;
  year: number;
  count: number;
  lag_count?: number;
  change: number;
  ChangeValue: number;
}

interface QoQData {
  language_name: string;
  year: number;
  quarter: number;
  count: number;
  lag_count?: number;
  change: number;
  ChangeValue: number;
}

interface SortProps {
  sortField: string;
  sortOrder: 'asc' | 'desc';
}

type OptionType = {
  value: string;
  label: string;
};

interface GroupType extends OptionType {
  options: OptionType[];
}

const ChangeRanking = () => {
  const datasetSelectOptions = [
    { value: '_commits.csv', label: 'Commits' },
    { value: '_prs.csv', label: 'Pull requests' },
    { value: '_repos.csv', label: 'Repos' }
  ];

  const [tableData, setTableData] = useState<(YoYData | QoQData)[]>([]);
  const [data, setData] = useState<(YoYData | QoQData)[]>([]);
  const [year, setYear] = useState<string>('2021');
  const [quarter, setQuarter] = useState<string | null>(null);
  const [event, setEvent] = useState<string>(datasetSelectOptions[0].value);
  const [top] = useState(5);
  const [sortActive, setSortActive] = useState<SortProps>({
    sortField: 'change',
    sortOrder: 'desc'
  });
  const [minimumCount, setMinCount] = useState<number>(1000);

  useEffect(() => updateTable(), []);
  useEffect(() => {
    updateTable();
  }, [year, quarter, event, minimumCount]);

  const updateTable = () => {
    if (quarter === null) updateYoYDataSource(`./data/yoy_change${event}`);
    else updateQoQDataSource(`./data/qoq_change${event}`);
  };

  const yearSelectOptions: OptionType[] = [
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
    { value: '2019', label: '2019' },
    { value: '2018', label: '2018' },
    { value: '2017', label: '2017' },
    { value: '2016', label: '2016' },
    { value: '2015', label: '2015' },
    { value: '2014', label: '2014' },
    { value: '2013', label: '2013' },
    { value: '2012', label: '2012' }
  ];

  const quarterSelectOptions: OptionType[] = [
    { value: '1', label: 'Q1' },
    { value: '2', label: 'Q2' },
    { value: '3', label: 'Q3' },
    { value: '4', label: 'Q4' }
  ];

  function updateYoYDataSource(path: string) {
    d3.csv(path).then((value: any[]) => {
      let newData = value.map((d: any) => {
        return {
          language_name: d.language_name,
          count: +d.count,
          change: +d.yoy_change,
          ChangeValue: +d.yoy_change * 100,
          year: +d.year
        } as YoYData;
      });
      newData = newData.filter((d) => d.year.toString() === year && d.count > minimumCount);
      newData.sort((a, b) => {
        if ((a as any)[sortActive.sortField] === null) return 1;
        if ((b as any)[sortActive.sortField] === null) return -1;
        if ((a as any)[sortActive.sortField] === null && (b as any)[sortActive.sortField] === null)
          return 0;
        if (sortActive.sortOrder == 'asc')
          return (a as any)[sortActive.sortField] - (b as any)[sortActive.sortField];
        return (b as any)[sortActive.sortField] - (a as any)[sortActive.sortField];
      });
      setData(newData);
      setTableData(newData.slice(0, top));
    });
  }

  function updateQoQDataSource(path: string) {
    d3.csv(path).then((value: any[]) => {
      let newData = value.map((d: any) => {
        return {
          language_name: d.language_name,
          count: +d.count,
          change: +d.qoq_change,
          ChangeValue: +d.qoq_change * 100,
          year: +d.year,
          quarter: +d.quarter
        } as QoQData;
      });
      newData = newData.filter(
        (d) =>
          d.year.toString() === year && d.quarter.toString() === quarter && d.count > minimumCount
      );
      newData.sort((a, b) => {
        if ((a as any)[sortActive.sortField] === null) return 1;
        if ((b as any)[sortActive.sortField] === null) return -1;
        if ((a as any)[sortActive.sortField] === null && (b as any)[sortActive.sortField] === null)
          return 0;
        if (sortActive.sortOrder == 'asc')
          return (a as any)[sortActive.sortField] - (b as any)[sortActive.sortField];
        return (b as any)[sortActive.sortField] - (a as any)[sortActive.sortField];
      });
      setData(newData);
      setTableData(newData.slice(0, top));
    });
  }

  const formatYoYChange = (index: number, data: any) => {
    const displayValue = (data * 100).toLocaleString('en-us', { maximumFractionDigits: 0 }) + '%';
    return data > 0 ? '+' + displayValue : displayValue;
  };

  const yoyStyles = (data: any) => {
    if (data > 0) return { color: 'green' };
    else if (data < 0) return { color: 'red' };
    return { color: 'black' };
  };

  const columnsYoY = [
    {
      label: '# Ranking',
      accessor: '',
      sortable: false,
      formatter: (index: number) => index + 1
    },
    { label: 'Language', accessor: 'language_name', sortable: false },
    {
      label: 'YoY Change',
      accessor: 'change',
      sortable: true,
      formatter: formatYoYChange,
      style: yoyStyles
    },
    { label: 'Count', accessor: 'count', sortable: true }
  ];

  const handleSorting = (sortField: string, sortOrder: 'asc' | 'desc') => {
    if (sortField) {
      data.sort((a, b) => {
        if ((a as any)[sortField] === null) return 1;
        if ((b as any)[sortField] === null) return -1;
        if ((a as any)[sortField] === null && (b as any)[sortField] === null) return 0;
        if (sortOrder == 'asc') return (a as any)[sortField] - (b as any)[sortField];
        return (b as any)[sortField] - (a as any)[sortField];
      });
      setTableData(data.slice(0, top));
      setSortActive({ sortField: sortField, sortOrder: sortOrder });
    }
  };

  const sliderOnChange = (event: any) => {
    const value = event.target.value;
    setMinCount(value);
  };

  // Chart params
  const theme = {
    tooltip: {
      container: {
        color: '#000000'
      }
    },
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
  const customSelectStyles = {
    control: (base: CSSObject, state: ControlProps<OptionType, false>) => ({
      ...base,
      color: '#000',
      backgroundColor: '#fff',
      borderColor: state.isFocused ? '#777' : '#777',
      boxShadow: state.isFocused ? '0 0 0 1px #a777' : '0 0 0 1px #777'
    }),
    singleValue: (base: CSSObject, state: SingleValueProps<OptionType>) => ({
      ...base,
      color: '#000'
    }),
    menu: (base: CSSObject, state: MenuProps<OptionType, false>) => ({
      ...base,
      backgroundColor: '#fff'
    }),
    option: (base: CSSObject, state: OptionProps<OptionType, false>) => ({
      ...base,
      backgroundColor: state.isSelected ? '#222' : state.isFocused ? '#666' : '#fff',
      color: state.isSelected ? '#fff' : state.isFocused ? '#fff' : '#000'
    })
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '7%'
        }}>
        <h3>YoY Change Ranking</h3>
        <p
          style={{
            width: '100%'
          }}>
          A ranking table and a bar chart of programming languages according to the YoY Change for{' '}
          <b>commits</b>, <b>pull requests</b> and <b>repositories</b>.
        </p>
        <div
          style={{
            width: '70%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'stretch',
            flexWrap: 'wrap'
          }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px'
            }}>
            <p style={{ paddingRight: '10px', verticalAlign: 'middle', margin: 0 }}>Year</p>
            <Select
              className="basic-single"
              classNamePrefix="select"
              onChange={(newYear) => {
                if (newYear) setYear(newYear.value);
              }}
              defaultValue={{ value: year, label: String(year) }}
              isDisabled={false}
              isLoading={false}
              isClearable={false}
              isRtl={false}
              isSearchable={true}
              name="year"
              options={yearSelectOptions}
              styles={customSelectStyles}
            />
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px'
            }}>
            <p style={{ paddingRight: '10px', verticalAlign: 'middle', margin: 0 }}>Quarter</p>
            <Select
              className="basic-single"
              classNamePrefix="select"
              onChange={(newQuarter) => {
                if (newQuarter) setQuarter(newQuarter.value);
                else setQuarter(null);
              }}
              defaultValue={null}
              isDisabled={false}
              isLoading={false}
              isClearable={true}
              isRtl={false}
              isSearchable={true}
              name="quarter"
              options={quarterSelectOptions}
              styles={customSelectStyles}
            />
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px'
            }}>
            <p style={{ paddingRight: '10px', verticalAlign: 'middle', margin: 0 }}>Event type</p>
            <Select
              className="basic-single"
              classNamePrefix="select"
              onChange={(newEvent) => {
                if (newEvent) setEvent(newEvent.value);
              }}
              defaultValue={datasetSelectOptions[0]}
              isDisabled={false}
              isLoading={false}
              isClearable={false}
              isRtl={false}
              isSearchable={true}
              name="event"
              options={datasetSelectOptions}
              styles={customSelectStyles}
            />
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px'
            }}>
            <p style={{ paddingRight: '10px', verticalAlign: 'middle', margin: 0 }}>
              Minimum count
            </p>
            <Slider
              width={'300px'}
              minValue={0}
              maxValue={100000}
              value={minimumCount}
              label={(val: number) => String(val)}
              onChange={sliderOnChange}></Slider>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}>
          <div
            className="table_container"
            style={{
              padding: '20px'
            }}>
            <table className="table">
              <TableHead
                {...{ columns: columnsYoY, handleSorting, defaultSortField: 'yoy_change' }}
              />
              <TableBody {...{ columns: columnsYoY, tableData }} />
            </table>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px'
            }}>
            <Bar
              width={window.innerWidth * 0.35}
              height={window.innerHeight * 0.4}
              margin={{ top: 40, right: 80, bottom: 100, left: 80 }}
              data={tableData as any[]}
              padding={0.2}
              keys={['ChangeValue']}
              indexBy="language_name"
              valueFormat=" >+p"
              // colors={{ scheme: 'greys' }}
              colors={['#FFFFFF']}
              enableLabel={false}
              labelTextColor="inherit:darker(2.4)"
              labelSkipWidth={8}
              labelSkipHeight={8}
              enableGridX={false}
              colorBy={'indexValue'}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -90,
                legend: 'Language',
                legendPosition: 'middle',
                legendOffset: 80
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'YoY Change (%)',
                legendPosition: 'middle',
                legendOffset: -50
              }}
              theme={theme}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangeRanking;
