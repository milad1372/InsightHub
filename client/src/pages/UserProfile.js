import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import "./SearchArtworks.css";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {Card, Container, Row} from "react-bootstrap";
import CircularProgress from "@material-ui/core/CircularProgress";
import getGalleries from "../api/getGalleriesApi";
import getUserLikedArtworks from "../api/getUserLikedArtworksApi";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import saveLikedArtworkIntoDataBase from "../api/saveLikedArtworksApi";

const UserProfile = function () {
    const [value, setValue] = React.useState(1);
    const [userPublicGalleries, setUserPublicGalleries] = useState([]);
    const [userPrivateGalleries, setUserPrivateGalleries] = useState([]);
    const [userLikedArtworks, setUserLikedArtworks] = useState([]);

    const handleChange = async (event, newValue) => {
        setValue(newValue);
        if (newValue==1){
            const response = await getUserLikedArtworks();
            setUserLikedArtworks(response.likedArtworks.length!=0? response.likedArtworks[0].artworks:[]);
        }
        if (newValue==2){
            const response = await getGalleries();
            const filteredGalleries = response.galleries.filter((gallery) => gallery.isPrivate == false);
            setUserPublicGalleries(filteredGalleries);
        }  if (newValue==3){
            const response = await getGalleries();
            const filteredGalleries = response.galleries.filter((gallery) => gallery.isPrivate == true);
            setUserPrivateGalleries(filteredGalleries);
        }
    };


    const PublicGalleris = (() => {
        const [showProgressbar, setShowProgressbar] = useState(false);

        const handleCardClick = (artworkId, event) => {
        }


        return (
            <Container className="card-container-grid mx-0">
                {showProgressbar ?
                    <div className={'progressbarBox'}>
                        <CircularProgress
                            size={20}
                            style={{
                                color: 'black',
                                width: 20,
                                height: 20,
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0,

                                margin: 'auto'
                            }}/>
                    </div>
                    :
                    userPublicGalleries.map((gallery) => (
                        <Card key={gallery.gallery} className="artwork-card-grid"
                              onClick={(event) => handleCardClick(gallery.gallery, event)}>
                            {/* Card image */}
                            {gallery.image && gallery.image !== "No image available" ? (
                                <div className={'temp'}>
                                    <Card.Img className="card-image-grid"
                                              src={gallery.image}
                                              alt={`The image for ${gallery.gallery}`}
                                              variant="top"
                                    />

                                </div>
                            ) : (
                                <div>
                                    <Card.Img className="card-image-grid"
                                              src="./url.png"
                                              alt="Fallback"
                                              variant="top"
                                    />
                                </div>
                            )}
                            {/* Card body */}
                            <Card.Body>
                                <Card.Title>{gallery.artworkIdIds.length + " items"}</Card.Title>
                                <Card.Text>{gallery.gallery == "null" ? "" : gallery.gallery}</Card.Text>
                            </Card.Body>
                        </Card>
                    ))}
            </Container>
        );
    });

    const PrivateGalleris = (() => {
        const [showProgressbar, setShowProgressbar] = useState(false);

        const handleCardClick = (artworkId, event) => {
        }


        return (
            <Container className="card-container-grid mx-0">
                {showProgressbar ?
                    <div className={'progressbarBox'}>
                        <CircularProgress
                            size={20}
                            style={{
                                color: 'black',
                                width: 20,
                                height: 20,
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0,

                                margin: 'auto'
                            }}/>
                    </div>
                    :
                    userPrivateGalleries.map((gallery) => (
                        <Card key={gallery.gallery} className="artwork-card-grid"
                              onClick={(event) => handleCardClick(gallery.gallery, event)}>
                            {/* Card image */}
                            {gallery.image && gallery.image !== "No image available" ? (
                                <div className={'temp'}>
                                    <Card.Img className="card-image-grid"
                                              src={gallery.image}
                                              alt={`The image for ${gallery.gallery}`}
                                              variant="top"
                                    />

                                </div>
                            ) : (
                                <div>
                                    <Card.Img className="card-image-grid"
                                              src="./url.png"
                                              alt="Fallback"
                                              variant="top"
                                    />
                                </div>
                            )}
                            {/* Card body */}
                            <Card.Body>
                                <Card.Title>{gallery.artworkIdIds.length + " items"}</Card.Title>
                                <Card.Text>{gallery.gallery == "null" ? "" : gallery.gallery}</Card.Text>
                            </Card.Body>
                        </Card>
                    ))}
            </Container>
        );
    });

    const LikedArtworks = (() => {
        const [hoveredCard, setHoveredCard] = useState(null);
        const [showProgressbar, setShowProgressbar] = useState(false);

        const handleCardHover = (artworkId) => {
            setHoveredCard(artworkId);
        };

        const handleCardLeave = () => {
            setHoveredCard(null);
        };

        const handleCardClick = (artworkId, event) => {

            const target = event.target;
            let currentElement = target;
            let isInsideDataAndButtonsWrapper = false;
            while (currentElement) {
                if (currentElement.classList.contains('data-and-buttons-wrapper') || currentElement.classList.contains('MuiSvgIcon-root')) {
                    isInsideDataAndButtonsWrapper = true;
                    break;
                }
                currentElement = currentElement.parentElement;
            }
            if (isInsideDataAndButtonsWrapper) {
                return;
            }

            let link = 'https://www.europeana.eu/en/item' + artworkId;
            window.open(link, "_blank");
        };

        const handleFavoriteClick = async (artwork) => {
            // let artworkId= artwork.artworkId;
            // setArtworkData((prevArtworkData) =>
            //     prevArtworkData.map((artwork) =>
            //         artwork.artworkId === artworkId ? {...artwork, isFavorited: !artwork.isFavorited} : artwork
            //     )
            // );
            // const response = await saveLikedArtworkIntoDataBase(artwork);

        };
        return (
            <Container className="card-container-grid mx-0">
                {showProgressbar ?
                    <div className={'progressbarBox'}>
                        <CircularProgress
                            size={20}
                            style={{
                                color: 'black',
                                width: 20,
                                height: 20,
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0,

                                margin: 'auto'
                            }}/>
                    </div>
                    : userLikedArtworks.map((artwork) => (
                        <Card key={artwork.artworkId} className="artwork-card-grid"
                              onClick={(event) => handleCardClick(artwork.artworkId, event)}
                              onMouseEnter={() => handleCardHover(artwork.artworkId)}
                              onMouseLeave={handleCardLeave}>
                            {/* Card image */}
                            {artwork.image && artwork.image !== "No image available" ? (
                                <div className={'temp'}>
                                    <Card.Img className="card-image-grid"
                                              src={artwork.image}
                                              alt={`The image for ${artwork.title}`}
                                              variant="top"
                                    />
                                    {hoveredCard === artwork.artworkId && (
                                        <div className="icon-container">
                                            <AddCircleIcon sx={{fontSize: "10px", height: "36px", width: "36px"}}
                                                           className="hover-icon"/>
                                            <FavoriteIcon onClick={() => handleFavoriteClick(artwork)} sx={{
                                                fontSize: "10px",
                                                height: "36px",
                                                width: "36px",
                                                color: '#fff !important' ,
                                                backgroundColor:  'red !important'
                                            }}
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
                                            <FavoriteIcon onClick={() => handleFavoriteClick(artwork)} sx={{
                                                fontSize: "10px",
                                                height: "36px",
                                                width: "36px",
                                                color: '#fff !important' ,
                                                backgroundColor:  'red !important'
                                            }}
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


    return (<Grid container spacing={5}
                  direction="row"
                  justifyContent="center"
                  alignItems="center">
        <Grid item xs={12}>
            <Typography variant="h6">
                @{localStorage.getItem('loggedInUser')}
            </Typography>
        </Grid>
        <Grid item xs={5}>

        </Grid>
        <Grid item xs={2}>
            <Button variant="outlined">Edit profile</Button>
            <Button variant="outlined" onClick={()=> {localStorage.setItem('loggedInUser',"");  window.location.href = '/';}}>Log out</Button>
        </Grid>
        <Grid item xs={5}>

        </Grid>

        <Grid item xs={12}>
            <Box sx={{width: '100%', typography: 'body1'}}>
                <TabContext sx={{width: '80%', typography: 'body1'}} value={value}>
                    <Box sx={{borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center'}}>
                        <TabList onChange={handleChange}>
                            <Tab label="Likes" value="1"/>
                            <Tab label="Public Galleries" value="2"/>
                            <Tab label="Private Galleries" value="3"/>
                        </TabList>
                    </Box>
                    <Box sx={{borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center'}}>
                        <TabPanel value="1">
                            <LikedArtworks/>
                        </TabPanel>
                        <TabPanel value="2">
                            <PublicGalleris/>
                        </TabPanel>
                        <TabPanel value="3">
                            <PrivateGalleris/>
                        </TabPanel>
                    </Box>
                </TabContext>
            </Box>
        </Grid>


    </Grid>);
};

export default UserProfile;
