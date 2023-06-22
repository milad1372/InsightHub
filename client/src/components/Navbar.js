import React, {useRef, useState} from "react";
import { Link } from "react-router-dom";
import {Navbar, Nav, Container, Modal, Tab} from "react-bootstrap";
import "../css/navbar.css";
import Auth from "../utils/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faBook, faBars, faUser, faSearch, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import makeStyles from "@mui/styles/makeStyles";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignupForm";
const useStyles = makeStyles((theme) => ({
    textField: {
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                border: "none", // Remove the border for query box
            },
        },
    },
    navbar: {
        borderBottom: "1px solid black", // Add bottom border to the Navbar
    },
}));

const AppNavbar = ({ totalPages, artworkData, onSharedVariableChange })=> {
    // set modal display state
    const [showModal, setShowModal] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const classes = useStyles();

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (!searchInput) {
            return false;
        }

        try {
            const response = await fetch(
                `https://api.europeana.eu/record/v2/search.json?query=${searchInput}&wskey=odumeldiwin`
            );

            if (!response.ok) {
                throw new Error("something went wrong!");
            }

            const { items } = await response.json();

            const artworkData = items.map((artwork) => ({
                artworkId: artwork.id,
                title: artwork.title[0],
                type: artwork.type,
                image: artwork.edmPreview
                    ? artwork.edmPreview[0]
                    : "No image available",
                description: artwork.dcDescription
                    ? artwork.dcDescription[0]
                    : "No description available",
            }));

            const totalPages = Math.ceil(artworkData.length / 10);
            onSharedVariableChange(totalPages, artworkData);
        } catch (err) {
            console.error(err);
        }
    };


    const handleQueryChange= (e) =>{
        e.preventDefault();
        let value= e.target.value;
        setSearchInput(value);
    }


    const SearchBar = () => (
        <Navbar  expand="lg">
            <Grid container>
                <Grid xs={12} item={true}>
                    <div className="search-input">
                        <form onSubmit={handleFormSubmit} className="ml-auto">
                            <TextField
                                placeholder="Search 50+ million items"
                                variant="outlined"
                                fullWidth
                                className={classes.textField}
                                name={"query"}
                                id={"query"}
                                value={searchInput}
                                onChange={handleQueryChange}
                                InputProps={{
                                    startAdornment: (
                                        <IconButton onClick={() => setShowSearchBar(false)}>
                                            <ArrowBackIcon className="arrow-back-icon"/>
                                        </IconButton>
                                    ),
                                }}
                            />

                        </form>
                    </div>
                </Grid>
            </Grid>
        </Navbar>
    );

    const mainNavBar = () => (
        <Navbar bg="light" variant="light" expand="lg">
            <Container fluid>
                <Navbar.Brand as={Link} to="/">
                    <FontAwesomeIcon icon={faBars} />
                </Navbar.Brand>
                <Navbar.Brand as={Link} to="/">
                    <img src="./europeana.svg" alt="Europeana" />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar" />
                <Navbar.Collapse id="navbar">
                    <Nav className="ml-auto">
                        {/* <Nav.Link as={Link} to="/">
              <FontAwesomeIcon icon={faHome} /> Search For Books
            </Nav.Link> */}
                        {/* if user is logged in show saved books and logout */}
                        {Auth.loggedIn() ? (
                            <>
                                <Nav.Link as={Link} to="/saved">
                                    <FontAwesomeIcon icon={faBook} /> See Your Books
                                </Nav.Link>
                                <Nav.Link onClick={Auth.logout}>
                                    <FontAwesomeIcon icon={faUser} /> Logout
                                </Nav.Link>
                            </>
                        ) : (
                            <Nav.Link onClick={() => setShowModal(true)}>Login</Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
                <Navbar.Brand as={Link} to="/">
                    <FontAwesomeIcon icon={faSearch} onClick={() => setShowSearchBar(true)} />
                </Navbar.Brand>
            </Container>
        </Navbar>
    );


    return (
        <>
            {showSearchBar ? <SearchBar /> : mainNavBar()}
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
                                <Nav.Item>
                                    <Nav.Link eventKey="login">Login</Nav.Link>
                                </Nav.Item>
                                {/*<Nav.Item>*/}
                                {/*  <Nav.Link eventKey="signup">Sign Up</Nav.Link>*/}
                                {/*</Nav.Item>*/}
                            </Nav>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Tab.Content>
                            <Tab.Pane eventKey="login">
                                <LoginForm handleModalClose={() => setShowModal(false)} />
                            </Tab.Pane>
                            <Tab.Pane eventKey="signup">
                                <SignUpForm handleModalClose={() => setShowModal(false)} />
                            </Tab.Pane>
                        </Tab.Content>
                    </Modal.Body>
                </Tab.Container>
            </Modal>
        </>
    );
};

export default AppNavbar;
