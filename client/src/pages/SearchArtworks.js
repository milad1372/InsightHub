import React, { useState, useEffect } from "react";
import {
  Jumbotron,
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

const SearchArtworks = () => {
  const [searchedArtworks, setSearchedArtworks] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [savedArtworkIds, setSavedArtworkIds] = useState(getSavedArtworkIds());
  const [view, setView] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    return () => saveArtworkIds(savedArtworkIds);
  });

  const [saveArtwork] = useMutation(SAVE_ARTWORK);

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
      setTotalPages(totalPages);

      setSearchedArtworks(artworkData);
      setSearchInput("");
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    }
  };

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

  const Pagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav>
        <ul className="pagination">
          {pageNumbers.map((number) => (
            <li
              key={number}
              className={`page-item${currentPage === number ? " active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(number)}
              >
                {number}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  return (
    <>
      <Container className="search-container">
        <Form onSubmit={handleFormSubmit}>
          <Form.Row>
            <Col xs={12} md={8}>
              <Form.Control
                name="searchInput"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                type="text"
                size="lg"
                placeholder="Search for an artwork"
              />
            </Col>
            <Col xs={12} md={4}>
              <Button type="submit" variant="success" size="lg">
                Search
              </Button>
            </Col>
          </Form.Row>
        </Form>
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
        {totalPages > 1 && <Pagination />}
      </Container>
    </>
  );
};

export default SearchArtworks;
