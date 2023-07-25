import React, {useState, useEffect, forwardRef, useRef, useImperativeHandle} from "react";
import Select from "react-select";
import "../css/common.css";
import {
    Container,
    Col,
    Form,
    Button,
    Card,
    CardColumns,
    ListGroup,
    Row,
} from "react-bootstrap";
import {BsGrid, BsList} from "react-icons/bs";

import Auth from "../utils/auth";
import {saveArtworkIds, getSavedArtworkIds} from "../utils/localStorage";

import {SAVE_ARTWORK} from "../utils/mutations";
import {useMutation} from "@apollo/react-hooks";
import "./SearchArtworks.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faArrowRight, faDriversLicense} from "@fortawesome/free-solid-svg-icons";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import getRecords from "../api/getRecordsApi";
import Chip from "@mui/material/Chip";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GridViewIcon from '@mui/icons-material/GridView';
import AutoAwesomeMosaicOutlined from '@mui/icons-material/AutoAwesomeMosaicOutlined';
import {withStyles} from "@material-ui/core/styles";
import IconButton from '@material-ui/core/IconButton';
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress";

// Initialize the options for filters
const COLLECTION_OPTIONS = [{value: "archaeology", label: "Archaeology"}];
const CONTENT_TIER_OPTIONS = [{value: "4", label: "4"}];
const TYPE_OPTIONS = [{value: "IMAGE", label: "Image"}];
const COUNTRY_OPTIONS = [{value: "Europe", label: "Europe"}];
const LANGUAGE_OPTIONS = [{value: "mul", label: "Multiple Languages"}];
const PROVIDER_OPTIONS = [{value: "Daguerreobase", label: "Daguerreobase"}];
const DATA_PROVIDER_OPTIONS = [{
    value: "National Science and Media Museum Bradford",
    label: "National Science and Media Museum Bradford"
}];
const COLOUR_PALETTE_OPTIONS = [{value: "#000000", label: "Black"}];
const IMAGE_ASPECTRATIO_OPTIONS = [{value: "landscape", label: "Landscape"}];
const IMAGE_SIZE_OPTIONS = [{value: "large", label: "Large"}];
const MIME_TYPE_OPTIONS = [{value: "image/jpeg", label: "JPEG"}];
const RIGHTS_OPTIONS = [{value: "* /publicdomain/mark/*", label: "Public Domain"}];
const StyledChip = withStyles({

    label: {
        marginRight: -3,
    },
    icon: {
        position: "absolute",
        right: 10,
        backgroundColor: '#000'
    }
})(Chip);

const SearchArtworks = ({totalPages, searchedArtworks, filters, onFilterChange}) => {
    const [savedArtworkIds, setSavedArtworkIds] = useState(getSavedArtworkIds());
    const [view, setView] = useState("list");
    const [currentPage, setCurrentPage] = useState(1);

    // States for filters
    const [selectedCollection, setSelectedCollection] = useState([]);
    const [selectedContentTier, setSelectedContentTier] = useState([]);
    const [selectedType, setSelectedType] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState([]);
    const [selectedDataProvider, setSelectedDataProvider] = useState([]);
    const [selectedColourPalette, setSelectedColourPalette] = useState([]);
    const [selectedImageAspectRatio, setSelectedImageAspectRatio] = useState([]);
    const [selectedImageSize, setSelectedImageSize] = useState([]);
    const [selectedMimeType, setSelectedMimeType] = useState([]);
    const [selectedRights, setSelectedRights] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [artworkData, setArtworkData] = useState([]);

    useEffect(() => {
        setTotalRecords(totalPages);
        setArtworkData(searchedArtworks);
        return () => saveArtworkIds(savedArtworkIds);
    }, [searchedArtworks, totalPages]);


    const [saveArtwork] = useMutation(SAVE_ARTWORK);

    const handleSaveArtwork = async (artworkId) => {
        const artworkToSave = searchedArtworks.find(
            (artwork) => artwork.artworkId === artworkId
        );

        const token = Auth.loggedIn() ? Auth.getToken() : null;

        if (!token) {
            return false;
        }

        try {
            const response = await saveArtwork({
                variables: {
                    input: artworkToSave,
                },
            });

            if (!response) {
                throw new Error("something went wrong!");
            }

            setSavedArtworkIds([...savedArtworkIds, artworkToSave.artworkId]);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        getPaginatedArtworks(pageNumber).then((data) => {
            setArtworkData(data);
        });
    };


    const reorderArtworkData = (artworkData) => {
        const n = artworkData.length;
        console.log(n)
        if (n != 0) {
            const half = Math.ceil(n / 2);

            const firstHalf = artworkData.slice(0, half);
            const secondHalf = artworkData.slice(half);

            const reorderedData = [];
            for (let i = 0; i < half; i++) {
                reorderedData.push(firstHalf[i]);
                reorderedData.push(secondHalf[i]);
            }
            return reorderedData;
        } else {
            return [];
        }
    }
    const getPaginatedArtworks = async (pageNumber) => {
        const response = await getRecords(
            localStorage.getItem('currentQuery'),
            localStorage.getItem('currentFilter'),
            pageNumber
        );
        setTotalRecords(response?.totalPages || []);
        return response?.artworkData || [];
    };

    const handleCardClick = (id) => {
        let link = 'https://www.europeana.eu/en/item' + id;
        window.open(link, "_blank");
    };

    const ListView = forwardRef((props, ref) => {

        useImperativeHandle(ref, () => ({

            handleDelete() {
                localStorage.setItem('currentQuery', "");
                getPaginatedArtworks(currentPage).then((data) => {
                    setArtworkData(data);
                });
            }
        }));


        return (
            <Container>
                <Row>
                    {artworkData.length == 0 ?
                        <CircularProgress
                            size={20}
                            style={{
                                color: 'black',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: `${-80 / 2}px`,
                                marginLeft: `${-80 / 2}px`
                            }}/>
                        : artworkData.map((artwork) => (
                            <Col xs={12} md={6}>
                                <Card className="artwork-card">
                                    <Row onClick={() => handleCardClick(artwork.artworkId)}>
                                        <Col xs={8}>
                                            <Card.Body>
                                                <Card.Subtitle>{artwork.dataProvider}</Card.Subtitle>
                                                <Card.Title>{artwork.title == "null" ? "" : artwork.title}</Card.Title>
                                                <Card.Text>{(artwork.description != null && artwork.description != "") ? artwork.description.slice(0, 238) + "..." : ""}</Card.Text>
                                                <div className={"data-and-buttons-wrapper d-flex"}>
                                            <span className="d-inline-flex align-items-center text-uppercase">
                                              <FontAwesomeIcon sx={{fontSize: ".875rem"}} icon={faDriversLicense}/>
                                                <span className="license-label-text">
                                                    {(artwork.license != null && artwork.license != undefined) ? artwork.license.indexOf("rightsstatements") > -1 ? "In Copyright" : "CC BY 4.0" : ""}
                                               </span>
                                               </span>

                                                    <span className="d-inline-flex align-items-center text-uppercase">
                                             <InsertDriveFileOutlinedIcon sx={{fontSize: ".875rem"}}/>
                                                <span className="license-label-text">
                                                    {artwork.type}
                                               </span>
                                               </span>


                                                    <span className="d-inline-flex align-items-center text-uppercase">
                                             <AddCircleIcon sx={{fontSize: ".875rem"}}/>
                                                <span className="license-label-text">
                                                    Save
                                               </span>
                                               </span>

                                                    <span className="d-inline-flex align-items-center text-uppercase">
                                              <FavoriteIcon sx={{fontSize: ".875rem"}}/>
                                                <span className="license-label-text">
                                                    Like
                                               </span>
                                               </span>
                                                </div>
                                                {Auth.loggedIn() && (
                                                    <Button
                                                        disabled={savedArtworkIds?.some(
                                                            (savedArtworkId) => savedArtworkId === artwork.artworkId
                                                        )}
                                                        className="btn-block btn-info"
                                                        onClick={() => handleSaveArtwork(artwork.artworkId)}
                                                    >
                                                        {savedArtworkIds?.some(
                                                            (savedArtworkId) => savedArtworkId === artwork.artworkId
                                                        )
                                                            ? "Saved"
                                                            : "Save"}
                                                    </Button>
                                                )}
                                            </Card.Body>
                                        </Col>
                                        <Col xs={4}>

                                            {artwork.image && artwork.image !== "No image available" ? (
                                                <div className="card-image-wrapper">
                                                    <Card.Img
                                                        src={artwork.image}
                                                        alt={`The image for ${artwork.title}`}
                                                        className="card-image"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="card-image-wrapper">
                                                    <Card.Img
                                                        src="./url.png" // Provide the path to the fallback image in the /public directory
                                                        alt="Fallback"
                                                        className="card-image"
                                                    />
                                                </div>
                                            )}

                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        ))}
                </Row>
            </Container>
        );
    });


    const CardView = forwardRef((props, ref) => {
        const [hoveredCard, setHoveredCard] = useState(null);

        const handleCardHover = (artworkId) => {
            setHoveredCard(artworkId);
        };

        const handleCardLeave = () => {
            setHoveredCard(null);
        };

        useImperativeHandle(ref, () => ({

            handleDelete() {
                localStorage.setItem('currentQuery', "");
                getPaginatedArtworks().then((data) => {
                    setArtworkData(data);
                });
            }

        }));

        return (
            <Container className="card-container-grid mx-0">
                {artworkData.length == 0 ?
                    <CircularProgress
                        size={20}
                        style={{
                            color: 'black',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: `${-80 / 2}px`,
                            marginLeft: `${-80 / 2}px`
                        }}/>
                    : artworkData.map((artwork) => (
                        <Card key={artwork.artworkId} className="artwork-card-grid"
                              onClick={() => handleCardClick(artwork.artworkId)}
                              onMouseEnter={() => handleCardHover(artwork.artworkId)}
                              onMouseLeave={handleCardLeave}>
                            {/* Card image */}
                            {artwork.image && artwork.image !== "No image available" ? (
                                <div>
                                    <Card.Img className="card-image-grid"
                                              src={artwork.image}
                                              alt={`The image for ${artwork.title}`}
                                              variant="top"
                                    />
                                    {hoveredCard === artwork.artworkId && (
                                        <div className="icon-container">
                                            <AddCircleIcon sx={{fontSize: "10px", height: "36px", width: "36px"}}
                                                           className="hover-icon"/>
                                            <FavoriteIcon sx={{fontSize: "10px", height: "36px", width: "36px"}}
                                                          className="hover-icon"/>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <Card.Img className="card-image-grid"
                                              src="./url.png"
                                              alt="Fallback"
                                              variant="top"
                                    />
                                    {hoveredCard === artwork.artworkId && (
                                        <div className="icon-container">
                                            <AddCircleIcon sx={{fontSize: "10px", height: "36px", width: "36px"}}
                                                           className="hover-icon"/>
                                            <FavoriteIcon sx={{fontSize: "10px", height: "36px", width: "36px"}}
                                                          className="hover-icon"/>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Card body */}
                            <Card.Body>
                                <Card.Title>{artwork.title == "null" ? "" : artwork.title}</Card.Title>
                                <Card.Text>{artwork.dcCreator}</Card.Text>
                                <Card.Text>{artwork.dataProvider}</Card.Text>
                                {/* rest of the code */}
                            </Card.Body>
                        </Card>
                    ))}
            </Container>
        );
    });


    const MosaicView = forwardRef((props, ref) => {

        const [hoveredCard, setHoveredCard] = useState(null);

        const handleCardHover = (artworkId) => {
            setHoveredCard(artworkId);
        };

        const handleCardLeave = () => {
            setHoveredCard(null);
        };

        useImperativeHandle(ref, () => ({

            handleDelete() {
                localStorage.setItem('currentQuery', "");
                getPaginatedArtworks().then((data) => {
                    setArtworkData(data);
                });
            }

        }));


        return (
            <Container className="card-container-grid mx-0">
                {artworkData.length == 0 ?
                    <CircularProgress
                        size={20}
                        style={{
                            color: 'black',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: `${-80 / 2}px`,
                            marginLeft: `${-80 / 2}px`
                        }}/>
                    : artworkData.map((artwork) => (
                        <Card
                            key={artwork.artworkId}
                            className="artwork-card-grid"
                            onMouseEnter={() => handleCardHover(artwork.artworkId)}
                            onMouseLeave={handleCardLeave}
                            onClick={() => handleCardClick(artwork.artworkId)}
                        >
                            {/* Card image */}
                            {artwork.image && artwork.image !== "No image available" ? (
                                <div>
                                    <Card.Img
                                        className="card-image-grid"
                                        src={artwork.image}
                                        alt={`The image for ${artwork.title}`}
                                        variant="top"
                                    />
                                    {hoveredCard === artwork.artworkId && (
                                        <div className="icon-container">
                                            <AddCircleIcon sx={{fontSize: "10px", height: "36px", width: "36px"}}
                                                           className="hover-icon"/>
                                            <FavoriteIcon sx={{fontSize: "10px", height: "36px", width: "36px"}}
                                                          className="hover-icon"/>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <Card.Img
                                        className="card-image-grid"
                                        src="./url.png"
                                        alt="Fallback"
                                        variant="top"
                                    />
                                    {hoveredCard === artwork.artworkId && (
                                        <div className="icon-container">
                                            <AddCircleIcon sx={{fontSize: "10px", height: "36px", width: "36px"}}
                                                           className="hover-icon"/>
                                            <FavoriteIcon sx={{fontSize: "10px", height: "36px", width: "36px"}}
                                                          className="hover-icon"/>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    ))}
            </Container>
        );
    });


    const Filters = () => (
        <div>
            <h2>Filter results</h2>
            <Form>
                <Form.Group controlId="collectionFilter">
                    <Form.Label>Collection</Form.Label>
                    <Select
                        options={COLLECTION_OPTIONS}
                        isMulti
                        value={filters.collection}
                        onChange={(selectedOption) => onFilterChange({...filters, collection: selectedOption})}
                    />
                </Form.Group>
                <Form.Group controlId="contentTierFilter">
                    <Form.Label>Content Tier</Form.Label>
                    <Select
                        options={CONTENT_TIER_OPTIONS}
                        isMulti
                        value={selectedContentTier}
                        onChange={(selectedOption) => setSelectedContentTier(selectedOption)}
                    />
                </Form.Group>
                <Form.Group controlId="typeFilter">
                    <Form.Label>Type</Form.Label>
                    <Select
                        options={TYPE_OPTIONS}
                        isMulti
                        value={selectedType}
                        onChange={(selectedOption) => setSelectedType(selectedOption)}
                    />
                </Form.Group>
                <Form.Group controlId="countryFilter">
                    <Form.Label>Country</Form.Label>
                    <Select
                        options={COUNTRY_OPTIONS}
                        isMulti
                        value={selectedCountry}
                        onChange={(selectedOption) => setSelectedCountry(selectedOption)}
                    />
                </Form.Group>
                <Form.Group controlId="languageFilter">
                    <Form.Label>Language</Form.Label>
                    <Select
                        options={LANGUAGE_OPTIONS}
                        isMulti
                        value={selectedLanguage}
                        onChange={(selectedOption) => setSelectedLanguage(selectedOption)}
                    />
                </Form.Group>
                <Form.Group controlId="providerFilter">
                    <Form.Label>Provider</Form.Label>
                    <Select
                        options={PROVIDER_OPTIONS}
                        isMulti
                        value={selectedProvider}
                        onChange={(selectedOption) => setSelectedProvider(selectedOption)}
                    />
                </Form.Group>
                <Form.Group controlId="dataProviderFilter">
                    <Form.Label>Data Provider</Form.Label>
                    <Select
                        options={DATA_PROVIDER_OPTIONS}
                        isMulti
                        value={selectedDataProvider}
                        onChange={(selectedOption) => setSelectedDataProvider(selectedOption)}
                    />
                </Form.Group>
                <Form.Group controlId="colourPaletteFilter">
                    <Form.Label>Colour Palette</Form.Label>
                    <Select
                        options={COLOUR_PALETTE_OPTIONS}
                        isMulti
                        value={selectedColourPalette}
                        onChange={(selectedOption) => setSelectedColourPalette(selectedOption)}
                    />
                </Form.Group>
                <Form.Group controlId="imageAspectRatioFilter">
                    <Form.Label>Image Aspect Ratio</Form.Label>
                    <Select
                        options={IMAGE_ASPECTRATIO_OPTIONS}
                        isMulti
                        value={selectedImageAspectRatio}
                        onChange={(selectedOption) => setSelectedImageAspectRatio(selectedOption)}
                    />
                </Form.Group>
                <Form.Group controlId="imageSizeFilter">
                    <Form.Label>Image Size</Form.Label>
                    <Select
                        options={IMAGE_SIZE_OPTIONS}
                        isMulti
                        value={selectedImageSize}
                        onChange={(selectedOption) => setSelectedImageSize(selectedOption)}
                    />
                </Form.Group>
                <Form.Group controlId="mimeTypeFilter">
                    <Form.Label>Mime Type</Form.Label>
                    <Select
                        options={MIME_TYPE_OPTIONS}
                        isMulti
                        value={selectedMimeType}
                        onChange={(selectedOption) => setSelectedMimeType(selectedOption)}
                    />
                </Form.Group>
                <Form.Group controlId="rightsFilter">
                    <Form.Label>Rights</Form.Label>
                    <Select
                        options={RIGHTS_OPTIONS}
                        isMulti
                        value={selectedRights}
                        onChange={(selectedOption) => setSelectedRights(selectedOption)}
                    />
                </Form.Group>
            </Form>
        </div>
    );

    const Pagination = () => {
        const handleKeyPress = (e) => {
            if ([46, 8, 9, 27, 110, 190].indexOf(e.keyCode) !== -1 ||
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                return;
            }
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }

            if (e.key === 'Enter') {
                const page = e.target.value ? Number(e.target.value) : 0;
                if (page >= 1 && page <= (totalRecords/ 24)) {
                    handlePageChange(page);
                }
            }
        };

        const nextPage = () => {
            if (currentPage < (totalRecords/ 24)) {
                handlePageChange(currentPage + 1);
            }
        };

        const previousPage = () => {
            if (currentPage > 1) {
                handlePageChange(currentPage - 1);
            }
        };

        return (

            <div className="pagination-ep d-flex align-items-center">

                <button className="btn-page-nav mx-3" onClick={previousPage}>
                    <FontAwesomeIcon icon={faArrowLeft}/>
                    &nbsp;PREVIOUS
                </button>

                <input
                    type="number"
                    className="form-control mx-3"
                    min={1}
                    max={totalRecords/24}
                    onKeyDown={handleKeyPress}
                    defaultValue={currentPage}
                    style={{width: '100px', textAlign: "center"}}
                />

                <span className="mx-3">OF {Math.floor(totalRecords / 24 < 1 ? 1 : totalRecords / 24)}</span>
                <button className="btn-page-nav mx-3" onClick={nextPage}>
                    NEXT&nbsp;
                    <FontAwesomeIcon icon={faArrowRight}/>
                </button>

            </div>
        );
    };

    const childRef = useRef();

    return (
        <>
            {(localStorage.getItem('firstRun') != null && localStorage.getItem('firstRun') != "true") ?
                <Container fluid className="search-container mx-0 px-8">
                    <Row>
                        <Col xs={10}>
                            <Row>
                                <Col xs={10}>
                                    <h5 className="padtop">
                                        {(`${totalRecords.toLocaleString()} RESULTS `)}
                                        {localStorage.getItem('currentQuery') ? <>
                                            <span>FOR</span>
                                            <StyledChip
                                                style={{
                                                    backgroundColor: '#daeaf8',
                                                    color: '#4d4d4d',
                                                    margin: '6px'
                                                }}
                                                label={localStorage.getItem('currentQuery')}
                                                onDelete={() => childRef.current.handleDelete()}
                                            /></> : <div></div>
                                        }
                                    </h5>
                                </Col>
                                <Col xs={2}>
                                    <div className="button-group">
                                        <div className="icon-group">
                                            <FormatListBulletedIcon
                                                className={view === 'list' ? 'selected-icon' : 'icon'}
                                                onClick={() => setView('list')}
                                            />
                                            <GridViewIcon
                                                className={view === 'grid' ? 'selected-icon' : 'icon'}
                                                onClick={() => setView('grid')}
                                            />
                                            <AutoAwesomeMosaicOutlined
                                                className={view === 'mosaic' ? 'selected-icon' : 'icon'}
                                                onClick={() => setView('mosaic')}
                                            />
                                        </div>
                                    </div>
                                </Col>

                            </Row>
                            <div className={"card-container"}>
                                {view === "grid" ? <CardView ref={childRef}/> : view === "list" ?
                                    <ListView ref={childRef}/> : <MosaicView ref={childRef}/>}
                            </div>
                            {totalRecords > 1 &&
                            <div className="d-flex justify-content-center">
                                <Pagination/>
                            </div>

                            }
                        </Col>
                        <Col xs={2}>
                            <Filters/>
                        </Col>
                    </Row>
                </Container>
                : <></>}
        </>
    );
};

export default SearchArtworks;
