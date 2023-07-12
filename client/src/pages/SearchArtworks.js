import React, { useState, useEffect } from "react";
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
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faArrowRight} from "@fortawesome/free-solid-svg-icons";

// Initialize the options for filters
const COLLECTION_OPTIONS = [{ value: "archaeology", label: "Archaeology" }];
const CONTENT_TIER_OPTIONS = [{ value: "4", label: "4" }];
const TYPE_OPTIONS = [{ value: "IMAGE", label: "Image" }];
const COUNTRY_OPTIONS = [{ value: "Europe", label: "Europe" }];
const LANGUAGE_OPTIONS = [{ value: "mul", label: "Multiple Languages" }];
const PROVIDER_OPTIONS = [{ value: "Daguerreobase", label: "Daguerreobase" }];
const DATA_PROVIDER_OPTIONS = [{ value: "National Science and Media Museum Bradford", label: "National Science and Media Museum Bradford" }];
const COLOUR_PALETTE_OPTIONS = [{ value: "#000000", label: "Black" }];
const IMAGE_ASPECTRATIO_OPTIONS = [{ value: "landscape", label: "Landscape" }];
const IMAGE_SIZE_OPTIONS = [{ value: "large", label: "Large" }];
const MIME_TYPE_OPTIONS = [{ value: "image/jpeg", label: "JPEG" }];
const RIGHTS_OPTIONS = [{ value: "* /publicdomain/mark/*", label: "Public Domain" }];

const SearchArtworks = ({ totalPages, searchedArtworks, filters, onFilterChange }) => {
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

  useEffect(() => {
    return () => saveArtworkIds(savedArtworkIds);
  });

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
  };

  const getPaginatedArtworks = () => {
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    return searchedArtworks.slice(startIndex, endIndex);
  };

  const ListView = () => (
    <ListGroup>
      {getPaginatedArtworks().map((artwork) => (
        <ListGroup.Item key={artwork.artworkId} className="artwork-list">
          <Row className="no-gutters">
            <Col xs={8}>
              <h4>{artwork.title}</h4>
              <p>{artwork.description.slice(0, 240)}...</p>
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
            </Col>
            <Col
              xs={4}
              className="d-flex align-items-center justify-content-center"
            >
              {artwork.image && artwork.image !== "No image available" ? (
                <img
                  src={artwork.image}
                  alt={`${artwork.title}`}
                  className="artwork-img"
                />
              ) : (
                <img
                  src="./url.png" // Provide the path to the fallback image in the /public directory
                  alt="Fallback"
                  className="artwork-img"
                />
              )}
            </Col>
          </Row>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );

  const CardView = () => (
    <CardColumns>
      {getPaginatedArtworks().map((artwork) => (
        <Card key={artwork.artworkId} className="artwork-card">
          {artwork.image ? (
            <Card.Img
              src={artwork.image}
              alt={`The image for ${artwork.title}`}
              variant="top"
            />
          ) : null}
          <Card.Body>
            <Card.Title>{artwork.title}</Card.Title>
            <Card.Text>{artwork.description.slice(0, 240)}...</Card.Text>
            {/* rest of the code */}
          </Card.Body>
        </Card>
      ))}
    </CardColumns>
  );

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
          onChange={(selectedOption) => onFilterChange({ ...filters, collection: selectedOption })}
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
        if (page >= 1 && page <= totalPages) {
          handlePageChange(page);
        }
      }
    };

    const nextPage = () => {
      if (currentPage < totalPages) {
        handlePageChange(currentPage + 1);
      }
    };

    const previousPage = () => {
      if (currentPage > 1) {
        handlePageChange(currentPage - 1);
      }
    };

    return (

        <div className="d-flex align-items-center">

          <button className="btn-page-nav mx-3" onClick={previousPage}>
            <FontAwesomeIcon icon={faArrowLeft}/>
            &nbsp;PREVIOUS
          </button>

          <input
              type="number"
              className="form-control mx-3"
              min={1}
              max={totalPages}
              onKeyDown={handleKeyPress}
              defaultValue={currentPage}
              style={{width: '100px', textAlign: "center"}}
          />

          <span className="mx-3">OF {totalPages}</span>
          <button className="btn-page-nav mx-3" onClick={nextPage}>
            NEXT&nbsp;
            <FontAwesomeIcon icon={faArrowRight}/>
          </button>

        </div>
    );
  };

  return (
    <>
      <Container fluid className="search-container">
        <Row>
        <Col xs={9}>
        <h5 className="padtop">
          {searchedArtworks.length ? `${searchedArtworks.length} results` : ""}
        </h5>
        <div className="button-group">
          <Button className="view-button" onClick={() => setView("grid")}>
            <BsGrid />
          </Button>
          <Button className="view-button" onClick={() => setView("list")}>
            <BsList />
          </Button>
        </div>
        {view === "grid" ? <CardView /> : <ListView />}
        {totalPages > 1 &&
        <div className="d-flex justify-content-center">
          <Pagination />
        </div>
        }
        </Col>
        <Col xs={3}>
            <Filters />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SearchArtworks;
