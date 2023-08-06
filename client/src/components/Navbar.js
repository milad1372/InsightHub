import React, {useState} from "react";
import {Link} from "react-router-dom";
import {Navbar, Nav, Container, Modal, Tab} from "react-bootstrap";
import "../css/navbar.css";
import Auth from "../utils/auth";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBook, faBars, faUser, faSearch} from "@fortawesome/free-solid-svg-icons";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import makeStyles from "@mui/styles/makeStyles";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignupForm";
import getRecords from "../api/getRecordsApi";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import ListItemIcon from "@mui/material/ListItemIcon";
import SearchIcon from '@mui/icons-material/Search';
import Typography from "@mui/material/Typography";
import ClearIcon from '@mui/icons-material/Clear';

const useStyles = makeStyles((theme) => ({
    noBorderNavbar: {
        border: 'none', // Set the border property to 'none' to remove the border
    },
    hoverablePaper: {
        marginTop: "55px",
        '&:hover': {
            backgroundColor: '#007bff',
            '& #search-suggestions': {
                color: 'white',
            },
            '& .MuiSvgIcon-root': { // Style for SearchIcon
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


// const AppNavbar = ({ totalPages, artworkData, onSharedVariableChange })=> {
const AppNavbar = ({isLoading, totalPages, searchedArtworks, onSharedVariableChange, filters, onFilterChange}) => {
        // set modal display state
        const [showModal, setShowModal] = useState(false);
        const [showSearchBar, setShowSearchBar] = useState(false);
        const [searchInput, setSearchInput] = useState("");


        const SearchBar = () => {
                const [showSearchMessage, setShowSearchMessage] = useState(false);
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
                    }, 200); // Delayed the onBlur event by 200 milliseconds
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
                    <div className={"wrapper"}>
                        <div>
                            <Navbar expand="lg" className={"m-0 header-navbar"}>
                                <Grid container>
                                    <Grid xs={12} item={true}>
                                        <div>
                                            <form onSubmit={handleFormSubmit} className="ml-auto">
                                                <TextField
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
                                                            <IconButton onClick={() => setShowSearchBar(false)}>
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
                                    </Grid>
                                </Grid>

                            </Navbar>
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
                    </div>
                );
            }
        ;


        const mainNavBar = () => (
            <Navbar bg="light" variant="light" expand="lg" className={"m-0 header-navbar"}>
                <Container fluid>
                    <Navbar.Brand as={Link} to="/">
                        <FontAwesomeIcon icon={faBars}/>
                    </Navbar.Brand>
                    <Navbar.Brand as={Link} to="/">
                        <img src="./europeana.svg" alt="Europeana"/>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbar"/>
                    <Navbar.Collapse id="navbar">
                        <Nav className="ml-auto">
                            {/* <Nav.Link as={Link} to="/">
              <FontAwesomeIcon icon={faHome} /> Search For Books
            </Nav.Link> */}
                            {/* if user is logged in show saved books and logout */}
                            {Auth.loggedIn() ? (
                                <>
                                    <Nav.Link as={Link} to="/saved">
                                        <FontAwesomeIcon icon={faBook}/> See Your Books
                                    </Nav.Link>
                                    <Nav.Link onClick={Auth.logout}>
                                        <FontAwesomeIcon icon={faUser}/> Logout
                                    </Nav.Link>
                                </>
                            ) : (
                                <Nav.Link href={'/LoginForm'}>Login</Nav.Link>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                    <Navbar.Brand as={Link} to="/">
                        <FontAwesomeIcon icon={faSearch} onClick={() => setShowSearchBar(true)}/>
                    </Navbar.Brand>
                </Container>
            </Navbar>
        );


        return (
            <>
                {showSearchBar ? <SearchBar/> : mainNavBar()}
                <Modal
                    size="md"
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    aria-labelledby="signup-modal"
                >
                    {/* tab container to do either signup or login component */}
                    <Tab.Container defaultActiveKey="login">
                        <Modal.Header closeButton>
                            <Modal.Title id="signup-modal">
                                <Nav variant="pills">
                                    {/*<Nav.Item>*/}
                                    {/*    <Nav.Link eventKey="login">Login</Nav.Link>*/}
                                    {/*</Nav.Item>*/}
                                    {/*<Nav.Item>*/}
                                    {/*  <Nav.Link eventKey="signup">Sign Up</Nav.Link>*/}
                                    {/*</Nav.Item>*/}
                                </Nav>
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Tab.Content>
                                <Tab.Pane eventKey="login">
                                    <LoginForm handleModalClose={() => setShowModal(false)}/>
                                </Tab.Pane>
                                <Tab.Pane eventKey="signup">
                                    <SignUpForm handleModalClose={() => setShowModal(false)}/>
                                </Tab.Pane>
                            </Tab.Content>
                        </Modal.Body>
                    </Tab.Container>
                </Modal>
            </>
        );
    }
;

export default AppNavbar;
