import React, { useState } from "react";
import { Navbar } from "react-bootstrap";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import makeStyles from "@mui/styles/makeStyles";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import SearchIcon from '@mui/icons-material/Search';
import Typography from "@mui/material/Typography";
import ClearIcon from '@mui/icons-material/Clear';
import getRecords from "../api/getRecordsApi";
import '../css/searchbox.css'

const useStyles = makeStyles((theme) => ({
    hoverablePaper: {
        marginTop: "55px",
        '&:hover': {
            backgroundColor: '#007bff',
            '& #search-suggestions': {
                color: 'white',
            },
            '& .MuiSvgIcon-root': {
                fill: 'white',
            },
        },
    },
    hoverableMenuItem: {
        '&:hover #search-suggestions': {
            color: 'white',
        },
    },
}));

const SearchBox = ({ onSharedVariableChange, filters }) => {
    const [showSearchMessage, setShowSearchMessage] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const classes = useStyles();

    const handleFocus = (event) => {
        setShowSearchMessage(true);
    };

    const handleBlur = () => {
        setTimeout(() => {
            if (
                document.getElementById('search-suggestions') != null &&
                document.activeElement !== document.getElementById('search-suggestions')
            ) {
                setShowSearchMessage(false);
            }
        }, 200); 
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        onSharedVariableChange(true, 0, []);

        localStorage.setItem('firstRun', false);
        console.log(localStorage.getItem('firstRun'))
        try {
            const filterQuery = Object.entries(filters)
                .map(([key, value]) => `${key}=${value}`)
                .join('&');
            const response = await getRecords(searchInput, filterQuery, 1);
            onSharedVariableChange(false, response.totalPages, response.artworkData);
        } catch (err) {
            console.error(err);
        }
    };

    const handleQueryChange = (e) => {
        let value = e.target.value;
        setSearchInput(value);
    };

    const clearSearchInput = () => {
        setSearchInput('');
    };

    const searchMessage = searchInput ? `Search for ${searchInput}` : 'Search for everything';

    return (
        <div>
                <div expand="lg" className={"searchbox"}>
                            <div>
                                <form onSubmit={handleFormSubmit} className="ml-auto">
                                    <TextField
                                        autoComplete="off"
                                        placeholder="Search 50+ million items"
                                        variant="outlined"
                                        fullWidth
                                        autoFocus
                                        name="query"
                                        id="query"
                                        value={searchInput}
                                        onChange={handleQueryChange}
                                        onFocus={handleFocus}
                                        onBlur={handleBlur}
                                        InputProps={{
                                            startAdornment: (
                                                <IconButton onClick={() => setShowSearchMessage(false)}>
                                                    <ArrowBackIcon className="arrow-back-icon"/>
                                                </IconButton>
                                            ),
                                            endAdornment: (
                                                searchInput && (
                                                    <IconButton onClick={clearSearchInput}>
                                                        <ClearIcon/>
                                                    </IconButton>
                                                )
                                            ),
                                        }}
                                    />
                                </form>
                            </div>
                </div>
                {showSearchMessage && (
                    <Paper className={`${classes.hoverablePaper} header-navbar`}>
                        <MenuList id={'search-suggestions'}>
                            <MenuItem className={classes.hoverableMenuItem} onClick={handleFormSubmit}>
                                <ListItemIcon>
                                    <SearchIcon fontSize="small"/>
                                </ListItemIcon>
                                <Typography variant="inherit" id="search-suggestions">
                                    {searchMessage}
                                </Typography>
                            </MenuItem>
                        </MenuList>
                    </Paper>
                )}
        </div>
    );
};

export default SearchBox;
