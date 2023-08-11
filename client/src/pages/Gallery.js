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
import deleteLikedArtworkFromDataBase from "../api/deleteLikedArtworkFromDataBaseApi";
import {useLocation} from 'react-router-dom';
import getRecords from "../api/getRecordsApi";
import {makeStyles} from '@mui/styles';
import LockIcon from '@mui/icons-material/Lock';
import FaceIcon from '@mui/icons-material/Face';
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined';
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import DialogActions from "@mui/material/DialogActions";
import saveGalleryIntoDataBase from "../api/saveGalleryApi";
import updateGalleryFromDataBase from "../api/updateGalleryFromDataBaseApi";
import deleteGalleryFromDataBase from "../api/deleteGalleryFromDataBaseApi";

const useStyles = makeStyles((theme) => ({
    gridContainer: {
        marginLeft: '100px',
        marginTop: '100px'
    },
}));


const Gallery = function () {
    const [value, setValue] = React.useState(1);
    const [galleryArtworks, setGalleryArtworks] = useState([]);
    const [currentGalleryIsPrivate, setCurrentGalleryIsPrivate] = useState(true);
    const [currentGalleryName, setCurrentGalleryName] = useState("");
    const [currentGalleryDescription, setCurrentGalleryDescription] = useState("");
    const [isAddModalChildOpen, setIsAddModalChildOpen] = useState(false);
    const [galleryName, setGalleryName] = useState("");
    const [galleryDescription, setGalleryDescription] = useState("");
    const [galleryPrivate, setGalleryPrivate] = useState(false);
    const [addedArtworkToGallery, setAddedArtworkToGallery] = useState("");
    const [addedArtworkImageToGallery, setAddedArtworkImageToGallery] = useState("");
    const [galleryImage, setGalleryImage] = useState("");

    const location = useLocation();
    const {galleryData} = location.state || {};
    const classes = useStyles();
    useEffect(() => {
        console.log('galleryData: ', galleryData);
        setGalleryArtworks(galleryData.artworks);
        setCurrentGalleryIsPrivate(galleryData.isPrivate);
        setCurrentGalleryName(galleryData.gallery);
        setCurrentGalleryDescription(galleryData.galleryDescription);
    },);


    const Artworks = (() => {
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
                    : galleryArtworks.map((artwork) => (
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
        console.log("check: ", value)
        setGalleryPrivate(value);
    };

    const handleCreateGallerySubmit = async (event) => {
        event.preventDefault();
        if (!galleryName) {
            return;
        }
        try {
            const response = await saveGalleryIntoDataBase(addedArtworkToGallery, galleryName, addedArtworkImageToGallery, galleryDescription, galleryPrivate);
        } catch (err) {
            console.error(err);
        }
        const response = await getGalleries();
        console.log('galleries', response.galleries)

        setGalleryName("");
        setGalleryDescription("");
        setGalleryPrivate(false);
        setIsAddModalChildOpen(!isAddModalChildOpen);
    };


    const handleCreateNewGalleryCardClick = (event) => {
        setGalleryPrivate(galleryData.isPrivate);
        setGalleryName(galleryData.gallery);
        setGalleryImage(galleryData.image);
        setGalleryDescription(galleryData.galleryDescription);
        setIsAddModalChildOpen(!isAddModalChildOpen);
    }

    const handleUpdateGallery = async () => {
        let gallery = {
            gallery: galleryName,
            image: galleryImage,
            artworks: galleryArtworks,
            galleryDescription: galleryDescription,
            isPrivate: galleryPrivate
        };
        const response = await updateGalleryFromDataBase(gallery).then(() => {
            console.log("name:", gallery.gallery);
            setCurrentGalleryIsPrivate(gallery.isPrivate);
            setCurrentGalleryName("gallery.gallery"); // Use gallery.gallery here
            console.log("name:", currentGalleryName);
            setCurrentGalleryDescription(gallery.galleryDescription); // Shouldn't this be gallery.galleryDescription?
        });

        setIsAddModalChildOpen(!isAddModalChildOpen);
    }


    const handleDeleteGallery = async () => {
        const response = await deleteGalleryFromDataBase(currentGalleryName);
        window.location.href = '/UserProfile';
    }

    return (
        <>
            <Grid
                container
                spacing={5}
                direction="row"
                className={classes.gridContainer}
            >
                <Grid item xs={12}>
                    <Typography level="body-sm">
                        GALLERY
                    </Typography>
                </Grid>

                <Grid item xs={12}>
                    <Typography level="h3" style={{fontWeight: 'bold'}}>
                        {currentGalleryName}
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography level="body-sm">
                        <FaceIcon/> Curated by @{localStorage.getItem('loggedInUser')}
                    </Typography>
                </Grid>
                {currentGalleryIsPrivate ? <><Grid item xs={2}>
                        <Typography level="body-sm">
                            <><LockIcon/> Private gallery</>
                        </Typography>
                    </Grid>
                        <Grid item xs={8}>
                        </Grid>
                    </>
                    : <></>}


                <Grid item xs={12}>
                    <Button component="a" color="secondary" style={{
                        background: '#f1f1ee',
                        border: '1px solid #f1f1ee',
                        borderRadius: '0.25rem',
                        color: '#4d4d4d',
                        fontSize: '.875rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        marginBottom: '100px'
                    }
                    } onClick={(e) => {
                        handleCreateNewGalleryCardClick(e);
                    }}>
                        <ModeEditOutlinedIcon/>
                        Edit
                    </Button>
                </Grid>
            </Grid>
            <Grid style={{backgroundColor: '#ededed'}}
                  container
                  spacing={1}
                  direction="row"
            >
                <Grid item sx={12} style={{paddingLeft: '150px'}}>{galleryArtworks.length} ITEM</Grid>
                <Grid item xs={12} style={{paddingLeft: '120px'}}>
                    <Artworks/>
                </Grid>
            </Grid>

            <Dialog
                sx={{top: '-5%', '& .MuiBackdrop-root': {opacity: '0.9'}}}
                open={isAddModalChildOpen}
                keepMounted
                onClose={() => setIsAddModalChildOpen(!isAddModalChildOpen)}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{"Edit gallery"}</DialogTitle>
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
                                    maxWidth: '750px',
                                    minWidth: '550px',
                                    marginBottom: '0'
                                }} fullWidth={true}/>
                            <br/>
                            <br/>
                            <label> Gallery description</label>
                            <TextField
                                multiline
                                rows={4}
                                label=""
                                variant="outlined"
                                value={galleryDescription}
                                onChange={handleGalleryDescriptionChange}
                                fullWidth={true}/>
                            <FormControlLabel style={{
                                marginLeft: '1px',
                            }}
                                              control={<Checkbox checked={galleryPrivate}
                                                                 onChange={handleGalleryPublicChange}/>}
                                              label="Keep this gallery private"/>
                        </form>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Grid container spacing={2}>
                        <Grid item xs={3}>
                            <Button style={{
                                border: '2px solid black',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                borderColor: '#2196F3',
                                color: 'dodgerblue',
                                maxWidth: '85px',
                                minWidth: '65px',
                                marginLeft: '10px',
                                marginBottom: '20px',
                            }} variant="outlined"
                                    onClick={() => setIsAddModalChildOpen(!isAddModalChildOpen)}>Close</Button>
                        </Grid>
                        <Grid item xs={1}>

                        </Grid>

                        <Grid item xs={4} style={{justifyContent: 'flex-end'}}>
                            <Button style={{backgroundColor: "#dc3545", fontSize: '.875rem'}} variant="contained"
                                    onClick={handleDeleteGallery}>
                                DELETE GALLERY
                            </Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button style={{backgroundColor: "#0a72cc", fontSize: '.875rem'}}
                                    variant="contained"
                                    onClick={handleUpdateGallery}>
                                UPDATE GALLERY
                            </Button>
                        </Grid>

                    </Grid>


                </DialogActions>
            </Dialog>
        </>
    );


}
export default Gallery;