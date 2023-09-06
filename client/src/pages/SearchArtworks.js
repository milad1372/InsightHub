import React, {
  useState,
  useEffect,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
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
import { BsGrid, BsList } from "react-icons/bs";

import Auth from "../utils/auth";
import { saveArtworkIds, getSavedArtworkIds } from "../utils/localStorage";

import { SAVE_ARTWORK } from "../utils/mutations";
import { useMutation } from "@apollo/react-hooks";
import "./SearchArtworks.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faDriversLicense,
} from "@fortawesome/free-solid-svg-icons";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import getRecords from "../api/getRecordsApi";
import Chip from "@mui/material/Chip";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GridViewIcon from "@mui/icons-material/GridView";
import AutoAwesomeMosaicOutlined from "@mui/icons-material/AutoAwesomeMosaicOutlined";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import saveGalleryIntoDataBase from "../api/saveGalleryApi";
import saveLikedArtworkIntoDataBase from "../api/saveLikedArtworksApi";
import deleteArtworkFromGallery from "../api/deleteArtworkFromGalleryApi";
import deleteLikedArtworkFromDataBase from "../api/deleteLikedArtworkFromDataBaseApi";
import getGalleries from "../api/getGalleriesApi";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Initialize the options for filters
const COLLECTION_OPTIONS = [{ value: "archaeology", label: "Archaeology" }];
const CONTENT_TIER_OPTIONS = [{ value: "4", label: "4" }];
const TYPE_OPTIONS = [{ value: "IMAGE", label: "Image" }];
const COUNTRY_OPTIONS = [{ value: "Europe", label: "Europe" }];
const LANGUAGE_OPTIONS = [{ value: "mul", label: "Multiple Languages" }];
const PROVIDER_OPTIONS = [{ value: "Daguerreobase", label: "Daguerreobase" }];
const DATA_PROVIDER_OPTIONS = [
  {
    value: "National Science and Media Museum Bradford",
    label: "National Science and Media Museum Bradford",
  },
];
const COLOUR_PALETTE_OPTIONS = [{ value: "#000000", label: "Black" }];
const IMAGE_ASPECTRATIO_OPTIONS = [{ value: "landscape", label: "Landscape" }];
const IMAGE_SIZE_OPTIONS = [{ value: "large", label: "Large" }];
const MIME_TYPE_OPTIONS = [{ value: "image/jpeg", label: "JPEG" }];
const RIGHTS_OPTIONS = [
  { value: "* /publicdomain/mark/*", label: "Public Domain" },
];
const StyledChip = withStyles({
  label: {
    marginRight: -3,
  },
  icon: {
    position: "absolute",
    right: 10,
    backgroundColor: "#000",
  },
})(Chip);

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const SearchArtworks = ({
  isLoading,
  totalPages,
  searchedArtworks,
  filters,
  onFilterChange,
}) => {
  const [savedArtworkIds, setSavedArtworkIds] = useState(getSavedArtworkIds());
  const [view, setView] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState("");
  const [showAdditionalFilters, setShowAdditionalFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [anyFilterSelected, setAnyFilterSelected] = useState(false);

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
  const [showProgressbar, setShowProgressbar] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddModalChildOpen, setIsAddModalChildOpen] = useState(false);
  const [galleryName, setGalleryName] = useState("");
  const [galleryDescription, setGalleryDescription] = useState("");
  const [galleryPrivate, setGalleryPrivate] = useState(false);
  const [addedArtworkToGallery, setAddedArtworkToGallery] = useState("");
  const [addedArtworkImageToGallery, setAddedArtworkImageToGallery] =
    useState("");
  const [userGalleries, setUserGalleries] = useState([]);
  const [facets, setFacets] = useState([]);

  useEffect(() => {
    const fetchArtworks = async () => {
      const response = await getRecords(
        localStorage.getItem("currentQuery"),
        filterQuery,
        currentPage
      );
      setFacets(response?.facets || {});
      setArtworkData(response?.artworkData || []);
      setTotalRecords(response?.totalPages || 0);
    };

    fetchArtworks();
  }, [filterQuery, currentPage]);

  useEffect(() => {
    let newFilterQuery = "";

    if (selectedCollection.length > 0) {
      newFilterQuery += selectedCollection
        .map((option) => "&qf=collection%3A" + encodeURIComponent(option.value))
        .join("");
      setAnyFilterSelected(true);
    }

    if (selectedContentTier.length > 0) {
      newFilterQuery += selectedContentTier
        .map(
          (option) => "&qf=contentTier%3A" + encodeURIComponent(option.value)
        )
        .join("");
      setAnyFilterSelected(true);
    }

    if (selectedType.length > 0) {
      newFilterQuery += selectedType
        .map((option) => "&qf=TYPE%3A" + encodeURIComponent(option.value))
        .join("");
      setAnyFilterSelected(true);
    }

    if (selectedCountry.length > 0) {
      newFilterQuery += selectedCountry
        .map((option) => "&qf=COUNTRY%3A" + encodeURIComponent(option.value))
        .join("");
      setAnyFilterSelected(true);
    }

    if (selectedLanguage.length > 0) {
      newFilterQuery += selectedLanguage
        .map((option) => "&qf=LANGUAGE%3A" + encodeURIComponent(option.value))
        .join("");
      setAnyFilterSelected(true);
    }

    if (selectedProvider.length > 0) {
      newFilterQuery += selectedProvider
        .map((option) => "&qf=PROVIDER%3A" + encodeURIComponent(option.value))
        .join("");
      setAnyFilterSelected(true);
    }

    if (selectedDataProvider.length > 0) {
      newFilterQuery += selectedDataProvider
        .map(
          (option) => "&qf=DATA_PROVIDER%3A" + encodeURIComponent(option.value)
        )
        .join("");
      setAnyFilterSelected(true);
    }

    if (selectedColourPalette.length > 0) {
      newFilterQuery += selectedColourPalette
        .map(
          (option) => "&qf=COLOURPALETTE%3A" + encodeURIComponent(option.value)
        )
        .join("");
      setAnyFilterSelected(true);
    }

    if (selectedImageAspectRatio.length > 0) {
      newFilterQuery += selectedImageAspectRatio
        .map(
          (option) =>
            "&qf=IMAGE_ASPECTRATIO%3A" + encodeURIComponent(option.value)
        )
        .join("");
      setAnyFilterSelected(true);
    }

    if (selectedImageSize.length > 0) {
      newFilterQuery += selectedImageSize
        .map((option) => "&qf=IMAGE_SIZE%3A" + encodeURIComponent(option.value))
        .join("");
      setAnyFilterSelected(true);
    }

    if (selectedMimeType.length > 0) {
      newFilterQuery += selectedMimeType
        .map((option) => "&qf=MIME_TYPE%3A" + encodeURIComponent(option.value))
        .join("");
      setAnyFilterSelected(true);
    }

    if (selectedRights.length > 0) {
      newFilterQuery += selectedRights
        .map((option) => "&qf=RIGHTS%3A" + encodeURIComponent(option.value))
        .join("");
      setAnyFilterSelected(true);
    }

    // Remove leading "&"
    if (newFilterQuery.startsWith("&")) {
      newFilterQuery = newFilterQuery.substring(1);
    }
    setFilterQuery(newFilterQuery);
  }, [
    selectedCollection,
    selectedContentTier,
    selectedType,
    selectedCountry,
    selectedLanguage,
    selectedProvider,
    selectedDataProvider,
    selectedColourPalette,
    selectedImageAspectRatio,
    selectedImageSize,
    selectedMimeType,
    selectedRights,
  ]);

  useEffect(() => {
    setShowProgressbar(isLoading);
    setCurrentPage(1);
    setTotalRecords(totalPages);
    setArtworkData(searchedArtworks);

    // Cleanup function, executed when component unmounts or when dependency array changes
    return () => {
      // Save artwork ids to local storage when the component unmounts
      saveArtworkIds(savedArtworkIds);
    };
  }, [isLoading, searchedArtworks, totalPages]);

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
    setShowProgressbar(true);
    setCurrentPage(pageNumber);
    getPaginatedArtworks(pageNumber).then((data) => {
      setArtworkData(data);
      setShowProgressbar(false);
    });
  };

  const reorderArtworkData = (artworkData) => {
    const n = artworkData.length;
    console.log(n);
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
  };

  const getPaginatedArtworks = async (pageNumber) => {
    const response = await getRecords(
      localStorage.getItem("currentQuery"),
      localStorage.getItem("currentFilter"),
      pageNumber
    );
    setTotalRecords(response?.totalPages || 0);
    setArtworkData(response?.artworkData || []);
    return response?.artworkData || [];
  };

  const handleCardClick = (artworkId, event) => {
    if (isAddModalOpen) {
      return;
    }

    const target = event.target;
    let currentElement = target;
    let isInsideDataAndButtonsWrapper = false;
    while (currentElement) {
      if (
        currentElement.classList.contains("data-and-buttons-wrapper") ||
        currentElement.classList.contains("MuiSvgIcon-root")
      ) {
        isInsideDataAndButtonsWrapper = true;
        break;
      }
      currentElement = currentElement.parentElement;
    }
    if (isInsideDataAndButtonsWrapper) {
      return;
    }

    let link = "https://www.europeana.eu/en/item" + artworkId;
    window.open(link, "_blank");
  };

  const handleFavoriteClick = async (artwork) => {
    if (localStorage.getItem("loggedInUser")) {
      if (!artwork.isFavorited) {
        const response = await saveLikedArtworkIntoDataBase(artwork);
      } else {
        const response = await deleteLikedArtworkFromDataBase(
          artwork.artworkId
        );
      }
    }

    let artworkId = artwork.artworkId;
    setArtworkData((prevArtworkData) =>
      prevArtworkData.map((artwork) =>
        artwork.artworkId === artworkId
          ? { ...artwork, isFavorited: !artwork.isFavorited }
          : artwork
      )
    );
    const response = await saveLikedArtworkIntoDataBase(artwork);
  };

  const ListView = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
      handleDelete() {
        setArtworkData([]);
        localStorage.setItem("currentQuery", "");
        setShowProgressbar(true); // Show progress bar before the API call
        getPaginatedArtworks(currentPage).then((data) => {
          setShowProgressbar(false); // Hide progress bar after the API call is complete
          setArtworkData(data);
        });
      },
    }));

    return (
      <Container>
        <Row>
          {showProgressbar ? (
            <div className={"progressbarBox"}>
              <CircularProgress
                size={20}
                style={{
                  color: "black",
                  width: 20,
                  height: 20,
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,

                  margin: "auto",
                }}
              />
            </div>
          ) : (
            artworkData.map((artwork) => (
              <Col xs={12} md={6}>
                <Card className="artwork-card">
                  <Row
                    onClick={(event) =>
                      handleCardClick(artwork.artworkId, event)
                    }
                  >
                    <Col xs={8}>
                      <Card.Body>
                        <Card.Subtitle>{artwork.dataProvider}</Card.Subtitle>
                        <Card.Title>
                          {artwork.title == "null" ? "" : artwork.title}
                        </Card.Title>
                        <Card.Text>
                          {artwork.description != null &&
                          artwork.description != ""
                            ? artwork.description.slice(0, 238) + "..."
                            : ""}
                        </Card.Text>
                        <div
                          className={
                            "artwork-card-description data-and-buttons-wrapper d-flex"
                          }
                        >
                          <span className="d-inline-flex align-items-center text-uppercase">
                            <WorkspacePremiumIcon
                              sx={{ fontSize: ".875rem" }}
                            />
                            <span className="license-label-text buttons-wrapper-icon">
                              {artwork.license != null &&
                              artwork.license != undefined
                                ? artwork.license.indexOf("rightsstatements") >
                                  -1
                                  ? "In Copyright"
                                  : "CC BY 4.0"
                                : ""}
                            </span>
                          </span>

                          <span className="d-inline-flex align-items-center text-uppercase">
                            <InsertDriveFileOutlinedIcon
                              sx={{ fontSize: ".875rem" }}
                            />
                            <span className="license-label-text buttons-wrapper-icon">
                              {artwork.type}
                            </span>
                          </span>
                        </div>
                      </Card.Body>
                    </Col>
                    <Col xs={4}>
                      <Card.Body>
                        {artwork.image &&
                        artwork.image !== "No image available" ? (
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
                        <div
                          className={
                            "artwork-card-description data-and-buttons-wrapper d-flex mr-2"
                          }
                        >
                          <span
                            className="d-inline-flex align-items-center text-uppercase hover-effect"
                            onClick={() =>
                              toggleAddModal(artwork, artwork.image)
                            }
                          >
                            <AddCircleIcon sx={{ fontSize: ".875rem" }} />
                            <span className="license-label-text buttons-wrapper-icon">
                              Save
                            </span>
                          </span>

                          <span
                            className={`buttons-wrapper d-inline-flex align-items-center text-uppercase hover-effect ${
                              artwork.isFavorited ? "Liked-label" : "Like-label"
                            }`}
                            onClick={() => handleFavoriteClick(artwork)}
                          >
                            {artwork.isFavorited ? (
                              <>
                                <FavoriteIcon
                                  sx={{ fontSize: ".875rem", color: "red" }}
                                />
                                <span
                                  className="Like-label-text buttons-wrapper-icon"
                                  style={{ color: "red" }}
                                >
                                  Liked
                                </span>
                              </>
                            ) : (
                              <>
                                <FavoriteIcon
                                  sx={{ fontSize: ".875rem", color: "black" }}
                                />
                                <span className="Like-label-text buttons-wrapper-icon">
                                  Like
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                        {Auth.loggedIn() && (
                          <Button
                            disabled={savedArtworkIds?.some(
                              (savedArtworkId) =>
                                savedArtworkId === artwork.artworkId
                            )}
                            className={`btn-block btn-info hover-effect ${
                              savedArtworkIds?.some(
                                (savedArtworkId) =>
                                  savedArtworkId === artwork.artworkId
                              )
                                ? "green-button"
                                : ""
                            }`}
                            onClick={() => handleSaveArtwork(artwork.artworkId)}
                          >
                            <span>
                              {savedArtworkIds?.some(
                                (savedArtworkId) =>
                                  savedArtworkId === artwork.artworkId
                              )
                                ? "Saved"
                                : "Save"}
                            </span>
                          </Button>
                        )}
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))
          )}
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
        setArtworkData([]);
        localStorage.setItem("currentQuery", "");
        setShowProgressbar(true); // Show progress bar before the API call
        getPaginatedArtworks(currentPage).then((data) => {
          setShowProgressbar(false); // Hide progress bar after the API call is complete
          setArtworkData(data);
        });
      },
    }));

    return (
      <Container className="card-container-grid mx-0">
        {showProgressbar ? (
          <div className={"progressbarBox"}>
            <CircularProgress
              size={20}
              style={{
                color: "black",
                width: 20,
                height: 20,
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,

                margin: "auto",
              }}
            />
          </div>
        ) : (
          artworkData.map((artwork) => (
            <Card
              key={artwork.artworkId}
              className="artwork-card-grid"
              onClick={(event) => handleCardClick(artwork.artworkId, event)}
              onMouseEnter={() => handleCardHover(artwork.artworkId)}
              onMouseLeave={handleCardLeave}
            >
              {/* Card image */}
              {artwork.image && artwork.image !== "No image available" ? (
                <div className={"temp"}>
                  <Card.Img
                    className="card-image-grid"
                    src={artwork.image}
                    alt={`The image for ${artwork.title}`}
                    variant="top"
                  />
                  {hoveredCard === artwork.artworkId && (
                    <div className="icon-container">
                      <AddCircleIcon
                        sx={{ fontSize: "10px", height: "36px", width: "36px" }}
                        className="hover-icon"
                        onClick={() => toggleAddModal(artwork, artwork.image)}
                      />
                      <FavoriteIcon
                        onClick={() => handleFavoriteClick(artwork)}
                        sx={{
                          fontSize: "10px",
                          height: "36px",
                          width: "36px",
                          color: artwork.isFavorited
                            ? "#fff !important"
                            : "#4d4d4d !important",
                          backgroundColor: artwork.isFavorited
                            ? "red !important"
                            : "#fff !important",
                        }}
                        className="hover-icon"
                      />
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
                      <AddCircleIcon
                        sx={{ fontSize: "10px", height: "36px", width: "36px" }}
                        className="hover-icon"
                        onClick={() => toggleAddModal(artwork, artwork.image)}
                      />
                      <FavoriteIcon
                        onClick={() => handleFavoriteClick(artwork)}
                        sx={{
                          fontSize: "10px",
                          height: "36px",
                          width: "36px",
                          color: artwork.isFavorited
                            ? "#fff !important"
                            : "#4d4d4d !important",
                          backgroundColor: artwork.isFavorited
                            ? "red !important"
                            : "#fff !important",
                        }}
                        className="hover-icon"
                      />
                    </div>
                  )}
                </div>
              )}
              {/* Card body */}
              <Card.Body>
                <Card.Title>
                  {artwork.title == "null" ? "" : artwork.title}
                </Card.Title>
                <Card.Text>{artwork.dcCreator}</Card.Text>
                <Card.Text>{artwork.dataProvider}</Card.Text>
                {/* rest of the code */}
              </Card.Body>
            </Card>
          ))
        )}
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
        setArtworkData([]);
        localStorage.setItem("currentQuery", "");
        setShowProgressbar(true); // Show progress bar before the API call
        getPaginatedArtworks(currentPage).then((data) => {
          setShowProgressbar(false); // Hide progress bar after the API call is complete
          setArtworkData(data);
        });
      },
    }));

    return (
      <Container className="card-container-grid mx-0">
        {showProgressbar ? (
          <div className={"progressbarBox"}>
            <CircularProgress
              size={20}
              style={{
                color: "black",
                width: 20,
                height: 20,
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,

                margin: "auto",
              }}
            />
          </div>
        ) : (
          artworkData.map((artwork) => (
            <Card
              key={artwork.artworkId}
              className="artwork-card-grid"
              onMouseEnter={() => handleCardHover(artwork.artworkId)}
              onMouseLeave={handleCardLeave}
              onClick={(event) => handleCardClick(artwork.artworkId, event)}
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
                      <AddCircleIcon
                        sx={{ fontSize: "10px", height: "36px", width: "36px" }}
                        className="hover-icon"
                        onClick={() => toggleAddModal(artwork, artwork.image)}
                      />
                      <FavoriteIcon
                        onClick={() => handleFavoriteClick(artwork)}
                        sx={{
                          fontSize: "10px",
                          height: "36px",
                          width: "36px",
                          color: artwork.isFavorited
                            ? "#fff !important"
                            : "#4d4d4d !important",
                          backgroundColor: artwork.isFavorited
                            ? "red !important"
                            : "#fff !important",
                        }}
                        className="hover-icon"
                      />
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
                      <AddCircleIcon
                        sx={{ fontSize: "10px", height: "36px", width: "36px" }}
                        className="hover-icon"
                        onClick={() => toggleAddModal(artwork, artwork.image)}
                      />
                      <FavoriteIcon
                        onClick={() => handleFavoriteClick(artwork)}
                        sx={{
                          fontSize: "10px",
                          height: "36px",
                          width: "36px",
                          color: artwork.isFavorited
                            ? "#fff !important"
                            : "#4d4d4d !important",
                          backgroundColor: artwork.isFavorited
                            ? "red !important"
                            : "#fff !important",
                        }}
                        className="hover-icon"
                      />
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </Container>
    );
  });

  const resetAllFilters = () => {
    setSelectedCollection([]);
    setSelectedContentTier([]);
    setSelectedType([]);
    setSelectedCountry([]);
    setSelectedLanguage([]);
    setSelectedProvider([]);
    setSelectedDataProvider([]);
    setSelectedColourPalette([]);
    setSelectedImageAspectRatio([]);
    setSelectedImageSize([]);
    setSelectedMimeType([]);
    setSelectedRights([]);
    setAnyFilterSelected(false);
  };

  const FilterChip = ({ selectedValues, onRemove }) => (
    <span className="badge b-form-tag d-inline-flex align-items-baseline mw-100 remove-button badge-primary-light badge-pill">
      {selectedValues.map((value, index) => (
        <StyledChip
          key={index}
          style={{
            backgroundColor: "#daeaf8",
            color: "#4d4d4d",
            margin: "6px",
            borderRadius: "2.25rem",
          }}
          label={value.label}
          onDelete={() => onRemove(value)}
        />
      ))}
    </span>
  );

  const Filters = () => (
    <div>
      <button
        aria-controls="advanced-filters"
        type="button"
        className="btn search-toggle btn-link strong"
      >
        {showAdvancedFilters
          ? "> HIDE SHOW ADVANCED SEARCH"
          : "< SHOW ADVANCED SEARCH"}
      </button>

      <div className="row filters-header border-bottom border-top d-flex justify-content-between align-items-center">
        <div className="filters-title">Search filters</div>
        {anyFilterSelected && (
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={resetAllFilters}
          >
            Reset Filters
          </button>
        )}
      </div>
      <Form>
        {/* Collection Filter */}
        <Form.Group controlId="collectionFilter" className="paddingTop">
          <Form.Label className="label d-flex align-items-center">
            Collection
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id="tooltip">
                  Selecting a THEME may provide further filter options, e.g. the
                  Newspapers theme includes a DATE ISSUED filter.
                </Tooltip>
              }
            >
              <FaInfoCircle className="tooltipStyle" color="gray" />
            </OverlayTrigger>
          </Form.Label>
          <FilterChip
            selectedValues={selectedCollection}
            onRemove={() => setSelectedCollection([])}
          />
          <Select
            options={COLLECTION_OPTIONS}
            isMulti
            value={selectedCollection}
            onChange={(selectedOption) => setSelectedCollection(selectedOption)}
          />
        </Form.Group>

        {/* Content Tier Filter */}
        <Form.Group controlId="contentTierFilter">
          <Form.Label className="label">TYPE OF MEDIA</Form.Label>
          <FilterChip
            selectedValues={selectedContentTier}
            onRemove={() => setSelectedContentTier([])}
          />
          <Select
            options={CONTENT_TIER_OPTIONS}
            isMulti
            value={selectedContentTier}
            onChange={(selectedOption) =>
              setSelectedContentTier(selectedOption)
            }
          />
        </Form.Group>

        {/* Type Filter */}
        <Form.Group controlId="typeFilter">
          <Form.Label className="label">CAN I USE THIS?</Form.Label>
          <FilterChip
            selectedValues={selectedType}
            onRemove={() => setSelectedType([])}
          />
          <Select
            options={TYPE_OPTIONS}
            isMulti
            value={selectedType}
            onChange={(selectedOption) => setSelectedType(selectedOption)}
          />
        </Form.Group>

        {/* Additional Filters */}
        <button
          aria-controls="additional-filters"
          type="button"
          className="btn search-toggle btn-link strong"
          onClick={() => setShowAdditionalFilters(!showAdditionalFilters)}
        >
          {showAdditionalFilters
            ? "- HIDE ADDITIONAL FILTERS"
            : "+ SHOW ADDITIONAL FILTERS"}
        </button>
        {showAdditionalFilters && (
          <div id="additional-filters">
            {/* Country Filter */}
            <Form.Group controlId="countryFilter">
              <Form.Label className="label">Country</Form.Label>
              <FilterChip
                selectedValues={selectedCountry}
                onRemove={() => setSelectedCountry([])}
              />
              <Select
                options={COUNTRY_OPTIONS}
                isMulti
                value={selectedCountry}
                onChange={(selectedOption) =>
                  setSelectedCountry(selectedOption)
                }
              />
            </Form.Group>

            {/* Language Filter */}
            <Form.Group controlId="languageFilter">
              <Form.Label className="label">Language</Form.Label>
              <FilterChip
                selectedValues={selectedLanguage}
                onRemove={() => setSelectedLanguage([])}
              />
              <Select
                options={LANGUAGE_OPTIONS}
                isMulti
                value={selectedLanguage}
                onChange={(selectedOption) =>
                  setSelectedLanguage(selectedOption)
                }
              />
            </Form.Group>

            {/* Provider Filter */}
            <Form.Group controlId="providerFilter">
              <Form.Label className="label">Provider</Form.Label>
              <FilterChip
                selectedValues={selectedProvider}
                onRemove={() => setSelectedProvider([])}
              />
              <Select
                options={PROVIDER_OPTIONS}
                isMulti
                value={selectedProvider}
                onChange={(selectedOption) =>
                  setSelectedProvider(selectedOption)
                }
              />
            </Form.Group>

            {/* Data Provider Filter */}
            <Form.Group controlId="dataProviderFilter">
              <Form.Label className="label">Data Provider</Form.Label>
              <FilterChip
                selectedValues={selectedDataProvider}
                onRemove={() => setSelectedDataProvider([])}
              />
              <Select
                options={DATA_PROVIDER_OPTIONS}
                isMulti
                value={selectedDataProvider}
                onChange={(selectedOption) =>
                  setSelectedDataProvider(selectedOption)
                }
              />
            </Form.Group>

            {/* Colour Palette Filter */}
            <Form.Group controlId="colourPaletteFilter">
              <Form.Label className="label">Colour Palette</Form.Label>
              <FilterChip
                selectedValues={selectedColourPalette}
                onRemove={() => setSelectedColourPalette([])}
              />
              <Select
                className="dropdown-toggle"
                options={COLOUR_PALETTE_OPTIONS}
                isMulti
                value={selectedColourPalette}
                onChange={(selectedOption) =>
                  setSelectedColourPalette(selectedOption)
                }
              />
            </Form.Group>

            {/* Image Aspect Ratio Filter */}
            <Form.Group controlId="imageAspectRatioFilter">
              <Form.Label className="label">Image Aspect Ratio</Form.Label>
              <FilterChip
                selectedValues={selectedImageAspectRatio}
                onRemove={() => setSelectedImageAspectRatio([])}
              />
              <Select
                options={IMAGE_ASPECTRATIO_OPTIONS}
                isMulti
                value={selectedImageAspectRatio}
                onChange={(selectedOption) =>
                  setSelectedImageAspectRatio(selectedOption)
                }
              />
            </Form.Group>

            {/* Image Size Filter */}
            <Form.Group controlId="imageSizeFilter">
              <Form.Label className="label">Image Size</Form.Label>
              <FilterChip
                selectedValues={selectedImageSize}
                onRemove={() => setSelectedImageSize([])}
              />
              <Select
                options={IMAGE_SIZE_OPTIONS}
                isMulti
                value={selectedImageSize}
                onChange={(selectedOption) =>
                  setSelectedImageSize(selectedOption)
                }
              />
            </Form.Group>

            {/* Mime Type Filter */}
            <Form.Group controlId="mimeTypeFilter">
              <Form.Label className="label">Mime Type</Form.Label>
              <FilterChip
                selectedValues={selectedMimeType}
                onRemove={() => setSelectedMimeType([])}
              />
              <Select
                options={MIME_TYPE_OPTIONS}
                isMulti
                value={selectedMimeType}
                onChange={(selectedOption) =>
                  setSelectedMimeType(selectedOption)
                }
              />
            </Form.Group>

            {/* Rights Filter */}
            <Form.Group controlId="rightsFilter">
              <Form.Label className="label">Rights</Form.Label>
              <FilterChip
                selectedValues={selectedRights}
                onRemove={() => setSelectedRights([])}
              />
              <Select
                options={RIGHTS_OPTIONS}
                isMulti
                value={selectedRights}
                onChange={(selectedOption) => setSelectedRights(selectedOption)}
              />
            </Form.Group>
          </div>
        )}
      </Form>
    </div>
  );

  const Pagination = () => {
    const handleKeyPress = (e) => {
      if (
        [46, 8, 9, 27, 110, 190].indexOf(e.keyCode) !== -1 ||
        (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
        (e.keyCode >= 35 && e.keyCode <= 40)
      ) {
        return;
      }
      if (
        (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
        (e.keyCode < 96 || e.keyCode > 105)
      ) {
        e.preventDefault();
      }

      if (e.key === "Enter") {
        const page = e.target.value ? Number(e.target.value) : 0;
        if (page >= 1 && page <= totalRecords / 24) {
          handlePageChange(page);
        }
      }
    };

    const nextPage = () => {
      if (currentPage < totalRecords / 24) {
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
          <FontAwesomeIcon icon={faArrowLeft} />
          &nbsp;PREVIOUS
        </button>

        <input
          type="number"
          className="form-control mx-3"
          min={1}
          max={totalRecords / 24}
          onKeyDown={handleKeyPress}
          defaultValue={currentPage}
          style={{ width: "100px", textAlign: "center" }}
        />

        <span className="mx-3">
          OF{" "}
          {Math.floor(
            totalRecords / 24 < 1
              ? 1
              : totalRecords / 24 > 42
              ? 42
              : totalRecords / 24
          )}
        </span>
        <button className="btn-page-nav mx-3" onClick={nextPage}>
          NEXT&nbsp;
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    );
  };

  const childRef = useRef();

  const toggleAddModal = async (artwork, image) => {
    if (localStorage.getItem("loggedInUser")) {
      setAddedArtworkToGallery(artwork);
      setAddedArtworkImageToGallery(image);
      setIsAddModalOpen(!isAddModalOpen);
      const response = await getGalleries();
      setUserGalleries(response.galleries);
    }
  };
  const toggleAddChildModal = (artworkId) => {
    setIsAddModalChildOpen(!isAddModalChildOpen);
  };

  const handleGalleryNameChange = (e) => {
    let value = e.target.value;
    setGalleryName(value);
  };
  const handleGalleryDescriptionChange = (e) => {
    let value = e.target.value;
    setGalleryDescription(value);
  };
  const handleGalleryPublicChange = (e) => {
    let value = e.target.checked;
    console.log("check: ", value);
    setGalleryPrivate(value);
  };

  const handleCreateGallerySubmit = async (event) => {
    event.preventDefault();
    if (!galleryName) {
      return;
    }
    try {
      const response = await saveGalleryIntoDataBase(
        addedArtworkToGallery,
        galleryName,
        addedArtworkImageToGallery,
        galleryDescription,
        galleryPrivate
      );
    } catch (err) {
      console.error(err);
    }
    const response = await getGalleries();
    console.log("galleries", response.galleries);
    setUserGalleries(response.galleries);
    setGalleryName("");
    setGalleryDescription("");
    setGalleryPrivate(false);
    setIsAddModalChildOpen(!isAddModalChildOpen);
  };

  const useStyles = makeStyles((theme) => ({
    customButton: {
      maxWidth: "750px",
      minHeight: "55px",
      minWidth: "550px",
      display: "flex",
      backgroundImage: (props) =>
        !props.isGalleryButtonSelected ? `url(${props.image})` : "none", // Apply background image if not selected
      justifyContent: "space-between",
      alignItems: "center",
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "relative",
      overflow: "hidden",
      color: "white", // Customize the text color as needed
      fontSize: "1rem", // Customize the font size as needed
      fontWeight: "bold", // Customize the font weight as needed
      cursor: "pointer", // Add a pointer cursor to indicate interactivity
      border: "none", // Remove the default button border
      padding: theme.spacing(2), // Adjust padding as needed
      "&:focus": {
        outline: "none", // Remove the default focus outline
      },
    },
    selectedButton: {
      backgroundImage: "none", // Remove background image
      backgroundColor: theme.palette.success.main,
      "&:hover": {
        backgroundColor: theme.palette.success.dark,
      },
    },
    checkboxIcon: {
      marginLeft: theme.spacing(1),
    },
  }));

  const GalleryButton = ({ gallery, setIsAddModalChildOpen }) => {
    const [isGalleryButtonSelected, setIsGalleryButtonSelected] =
      useState(false);
    const [galleryArtWorks, setGalleryArtWorks] = useState([]);
    const classes = useStyles({
      image: gallery.image,
      isGalleryButtonSelected,
    });

    useEffect(() => {
      setGalleryArtWorks(gallery.artworks);
    }, [isGalleryButtonSelected]);

    const handleButtonClick = async () => {
      setIsGalleryButtonSelected((prevState) => !prevState);

      try {
        if (!isGalleryButtonSelected) {
          const response = await saveGalleryIntoDataBase(
            addedArtworkToGallery,
            gallery.gallery,
            gallery.image,
            gallery.galleryDescription,
            gallery.isPrivate
          );
          let elementPos = gallery.artworks
            .map(function (x) {
              return x.artworkId.toLocaleLowerCase();
            })
            .indexOf(addedArtworkToGallery.artworkId.toLocaleLowerCase());
          if (elementPos == -1) {
            setGalleryArtWorks((updatedArtworks) => [
              ...updatedArtworks,
              addedArtworkToGallery,
            ]);
          }
        } else {
          const response = await deleteArtworkFromGallery(
            addedArtworkToGallery.artworkId,
            gallery._id
          );
          setGalleryArtWorks((updatedArtworks) =>
            updatedArtworks.filter(
              (artwork) =>
                artwork.artworkId.toLocaleLowerCase() !==
                addedArtworkToGallery.artworkId.toLocaleLowerCase()
            )
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <Grid item xs={8}>
        <Button
          className={`${classes.customButton} ${
            isGalleryButtonSelected && classes.selectedButton
          }`}
          fullWidth
          onClick={handleButtonClick}
        >
          <span>
            {gallery.gallery +
              " (" +
              (!gallery.isPrivate ? "public" : "private") +
              ") - " +
              (galleryArtWorks == null ? 0 : galleryArtWorks.length + " items")}
          </span>
          {isGalleryButtonSelected && (
            <CheckCircleIcon className={classes.checkboxIcon} />
          )}
        </Button>
      </Grid>
    );
  };

  return (
    <>
      {localStorage.getItem("firstRun") != null &&
      localStorage.getItem("firstRun") != "true" ? (
        <Container fluid className="search-container mx-0 px-8">
          <Row>
            <Col xs={12} sm={10}>
              <Row>
                <Col xs={12} sm={10}>
                  <h5 className="padtop context-label">
                    {totalRecords > 5
                      ? `${totalRecords.toLocaleString()} RESULTS `
                      : ""}
                    {localStorage.getItem("currentQuery") ? (
                      <>
                        <span>FOR</span>
                        <StyledChip
                          style={{
                            backgroundColor: "#daeaf8",
                            color: "#4d4d4d",
                            margin: "6px",
                            borderRadius: "2.25rem",
                          }}
                          label={localStorage.getItem("currentQuery")}
                          onDelete={() => childRef.current.handleDelete()}
                        />
                      </>
                    ) : (
                      <div></div>
                    )}
                  </h5>
                </Col>
                <Col xs={12} sm={2}>
                  <div className="button-group">
                    <div className="icon-group">
                      <FormatListBulletedIcon
                        className={view === "list" ? "selected-icon" : "icon"}
                        onClick={() => setView("list")}
                      />
                      <GridViewIcon
                        className={view === "grid" ? "selected-icon" : "icon"}
                        onClick={() => setView("grid")}
                      />
                      <AutoAwesomeMosaicOutlined
                        className={view === "mosaic" ? "selected-icon" : "icon"}
                        onClick={() => setView("mosaic")}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
              <div className={"card-container"}>
                {view === "grid" ? (
                  <CardView ref={childRef} />
                ) : view === "list" ? (
                  <ListView ref={childRef} />
                ) : (
                  <MosaicView ref={childRef} />
                )}
              </div>
              <Dialog
                sx={{ top: "-40%", "& .MuiBackdrop-root": { opacity: "0.9" } }}
                open={isAddModalOpen}
                TransitionComponent={Transition}
                keepMounted
                onClose={() => setIsAddModalOpen(!isAddModalOpen)}
                aria-describedby="alert-dialog-slide-description"
              >
                <DialogTitle>{"Add to gallery"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-slide-description">
                    <Button
                      style={{
                        maxWidth: "750px",
                        minHeight: "55px",
                        minWidth: "550px",
                        display: "flex",
                        justifyContent: "left",
                        alignItems: "center",
                        marginBottom: "20px",
                      }}
                      fullWidth={true}
                      onClick={(event) => {
                        event.preventDefault();
                        setIsAddModalChildOpen(!isAddModalChildOpen);
                      }}
                    >
                      CREATE NEW GALLERY
                    </Button>
                    <Grid container spacing={2}>
                      {userGalleries.map((gallery) => (
                        <GalleryButton
                          gallery={gallery}
                          setIsAddModalChildOpen={setIsAddModalChildOpen}
                        />
                      ))}
                    </Grid>
                  </DialogContentText>
                </DialogContent>
                {/*<DialogActions>*/}
                <Button
                  style={{
                    border: "2px solid black",
                    backgroundColor: "white",
                    cursor: "pointer",
                    borderColor: "#2196F3",
                    color: "dodgerblue",
                    maxWidth: "75px",
                    minWidth: "55px",
                    marginLeft: "25px",
                    marginTop: "25px",
                    marginBottom: "30px",
                  }}
                  variant="outlined"
                  onClick={() => setIsAddModalOpen(!isAddModalOpen)}
                >
                  Close
                </Button>
                {/*</DialogActions>*/}
              </Dialog>

              <Dialog
                sx={{ top: "-5%", "& .MuiBackdrop-root": { opacity: "0.9" } }}
                open={isAddModalChildOpen}
                keepMounted
                onClose={() => setIsAddModalChildOpen(!isAddModalChildOpen)}
                aria-describedby="alert-dialog-slide-description"
              >
                <DialogTitle>{"Create gallery"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-slide-description">
                    <form onSubmit={handleCreateGallerySubmit}>
                      <label> Gallery name</label>
                      <TextField
                        required
                        label=""
                        variant="outlined"
                        value={galleryName}
                        onChange={handleGalleryNameChange}
                        style={{
                          maxWidth: "750px",
                          minWidth: "550px",
                          marginBottom: "0",
                        }}
                        fullWidth={true}
                      />
                      <label style={{ fontSize: ".75rem" }}>
                        {" "}
                        Required field
                      </label>
                      <br />
                      <br />
                      <label> Gallery description</label>
                      <TextField
                        multiline
                        rows={4}
                        label=""
                        variant="outlined"
                        value={galleryDescription}
                        onChange={handleGalleryDescriptionChange}
                        fullWidth={true}
                      />
                      <FormControlLabel
                        style={{
                          marginLeft: "1px",
                        }}
                        control={
                          <Checkbox
                            checked={galleryPrivate}
                            onChange={handleGalleryPublicChange}
                          />
                        }
                        label="Keep this gallery private"
                      />
                    </form>
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Button
                        style={{
                          border: "2px solid black",
                          backgroundColor: "white",
                          cursor: "pointer",
                          borderColor: "#2196F3",
                          color: "dodgerblue",
                          maxWidth: "85px",
                          minWidth: "65px",
                          marginLeft: "10px",
                          marginBottom: "20px",
                        }}
                        variant="outlined"
                        onClick={() =>
                          setIsAddModalChildOpen(!isAddModalChildOpen)
                        }
                      >
                        CANCEL
                      </Button>
                    </Grid>
                    <Grid item xs={3}></Grid>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={4}>
                      <Button style={{}} onClick={handleCreateGallerySubmit}>
                        CREATE GALLERY
                      </Button>
                    </Grid>
                  </Grid>
                </DialogActions>
              </Dialog>
              {totalRecords > 1 && (
                <div className="d-flex justify-content-center">
                  <Pagination />
                </div>
              )}
            </Col>
            <Col xs={12} sm={2} className="col-filters">
              <Filters />
            </Col>
          </Row>
        </Container>
      ) : (
        <></>
      )}
    </>
  );
};

export default SearchArtworks;
