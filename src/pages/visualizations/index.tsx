import React, { useState } from 'react';
import Navbar from '../../components/navbar';
import pages from '../../utils/links';
import ChangeRanking from '../../visualizations/change-ranking';
import LangRanking from '../../visualizations/lang-ranking';
import LineCharts from '../../visualizations/line-charts';
import './styles.css';

const Visualizations = () => {
  const [chartNumberLimit, setChartNumberLimit] = useState<number>(5);
  const [selectedParadigm, setSelectedParadigm] = useState<string | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [minYear, setMinYear] = useState(2017);
  const [maxYear, setMaxYear] = useState(2021);

  return (
    <div className="Visualizations">
      <Navbar links={pages} />
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          // padding: '20px',
          background: '#222222',
          color: '#ffffff'
        }}>
        <LangRanking
        // chartNumberLimit={chartNumberLimit}
        // paradigmFilter={paradigmFilter}
        // purposeFilter={purposeFilter}
        // minYear={minYear}
        // maxYear={maxYear}
        />
        {/* <LineCharts
          chartNumberLimit={chartNumberLimit}
          purposeFilter={selectedPurpose ? [selectedPurpose] : []}
          paradigmFilter={selectedParadigm ? [selectedParadigm] : []}
          minYear={minYear}
          maxYear={maxYear}
        /> */}
        <ChangeRanking></ChangeRanking>
      </div>
    </div>
  );
};

export default Visualizations;
