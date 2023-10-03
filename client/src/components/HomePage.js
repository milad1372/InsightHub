import React from 'react';
import AppNavbar from './Navbar';
import SearchBox from './SearchBox';
import '../css/homepage.css';

const Homepage = () => {
    return (
        <div className="homepage-container">
            <AppNavbar />

            <div className="searchbox-container">
                <h1>Discover Europe’s digital cultural heritage</h1>
                <p>Search, save and share art, books, films, and music from thousands of cultural institutions</p>
                <SearchBox />
            </div>

            <footer>
                <p>&copy; 2023 Europeana</p>
            </footer>
        </div>
    );
};

export default Homepage;
