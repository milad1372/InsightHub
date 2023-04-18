import React from 'react';
import Navbar from '../../components/navbar';
import pages from '../../utils/links';
import './styles.css';

function Home() {

  return (
    <div className="Home">
      <Navbar links={pages} />
      <section className="presentation-section">
        <div className="presentation">
          <img src={'/assets/logo-dark.svg'} className="logo" id="insightHub" alt="logo" />
          <h1>InsightHub: Visualizing GitHub Open Source Repositories</h1>
        </div>
      </section>
    </div>
  );
}

export default Home;
