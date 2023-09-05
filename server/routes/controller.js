const express = require("express");
const app = express();

const recordRoutes = express.Router();
const apiCall = require("../business/ApiCall");
const databaseOperations = require("../business/databaseOperation");

recordRoutes.route("/").get(function () {
    console.log("api connected!\n");
});

app.use(function (req, res, next) {
    // running front-end application on port 3000
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// This section will help you get a list of all the records.
recordRoutes.route("/recordList").post(function (request, response) {
    console.log('get record list operation ____________________________________________');
    let searchInput = String(request.body.searchInput).trim().toLowerCase();
    (searchInput==null|| searchInput==""|| searchInput==undefined)?searchInput=null:searchInput;

    let filterQuery = String(request.body.filterQuery).trim();
    let pageNumber = request.body.pageNumber;


    console.log("endpoint hit! ---- search term=", searchInput, filterQuery," ------page# =", pageNumber, "\n");

    if (searchInput === undefined || searchInput === "") {
        response.status(404).send({
            success: 'false',
            data: [],
        })
        console.log("Error:  No data received for empty string\n");
    }

    apiCall.retrieveDocumentsFromEuropeanaAPI(searchInput, filterQuery,pageNumber, response).then(function (data) {

        console.log("retrieved items count from API: ", data.itemsCount, "\n");

        if (data.success) {
            response.status(200).send({
                success: 'true',
                data: data,
            })
        } else {
            console.log("Error:  No data exists for current query.\n");
            response.status(404).send({
                success: 'false',
                data: [],
            })
        }
    });
});

recordRoutes.route("/saveGalleryIntoDataBase").post(async function (request, response) {
    console.log('save Gallery into dataBase operation ____________________________________________');

    let gallery = String(request.body.gallery).trim();
    let artwork = request.body.artwork;
    let image = request.body.image;
    let isPrivate = request.body.isPrivate;
    let galleryDescription = request.body.galleryDescription;
    let user = request.body.user.trim().toLowerCase();
    let query = request.body.query.trim();
    await databaseOperations.saveGallery(gallery, artwork, image, galleryDescription, user,isPrivate, query).then(function (isSavedSuccessful) {
        console.log("is gallery save Successful: ", isSavedSuccessful);
            if (isSavedSuccessful) {
                response.status(200).send({
                    success: 'true',
                    data: [],
                });
            } else {
                response.status(500).send({
                    success: 'false',
                    data: [],
                })
            }
    })

});

recordRoutes.route("/saveArtworkIntoDataBase").post(async function (request, response) {
    console.log('save Gallery into dataBase operation ____________________________________________');

    let artwork = request.body.artwork;
    let user = request.body.user.trim().toLowerCase();
    await databaseOperations.saveLikedArtwork(artwork, user).then(function (isSavedSuccessful) {
        console.log("is artwork save Successful: ", isSavedSuccessful);
            if (isSavedSuccessful) {
                response.status(200).send({
                    success: 'true',
                    data: [],
                });
            } else {
                response.status(500).send({
                    success: 'false',
                    data: [],
                })
            }
    })

});

recordRoutes.route("/deleteLikedArtwork").post(async function (request, response) {
    console.log('delete Liked Artwork from dataBase operation ____________________________________________');

    let artworkId = request.body.artworkId;
    let user = request.body.user.trim().toLowerCase();
    await databaseOperations.deleteLikedArtwork(artworkId, user).then(function (isSavedSuccessful) {
        console.log("is artwork deleted Successful: ", isSavedSuccessful);
            if (isSavedSuccessful) {
                response.status(200).send({
                    success: 'true',
                    data: [],
                });
            } else {
                response.status(500).send({
                    success: 'false',
                    data: [],
                })
            }
    })

});

recordRoutes.route("/deleteGallery").post(async function (request, response) {
    console.log(' delete Gallery from dataBase operation ____________________________________________');

    let galleryName = request.body.galleryName.trim().toLowerCase();
    let user = request.body.user.trim().toLowerCase();
    await databaseOperations.deleteGallery(galleryName, user).then(function (isSavedSuccessful) {
        console.log("is artwork deleted Successful: ", isSavedSuccessful);
            if (isSavedSuccessful) {
                response.status(200).send({
                    success: 'true',
                    data: [],
                });
            } else {
                response.status(500).send({
                    success: 'false',
                    data: [],
                })
            }
    })

});

recordRoutes.route("/deleteArtworkFromGallery").post(async function (request, response) {
    console.log(' delete Gallery from dataBase operation ____________________________________________');

    let galleryId = request.body.galleryId.trim().toLowerCase();
    let artworkId = request.body.artworkId.trim().toLowerCase();
    let user = request.body.user.trim().toLowerCase();
    await databaseOperations.deleteArtworkFromGallery(galleryId, artworkId, user).then(function (isSavedSuccessful) {
        console.log("is artwork deleted Successful: ", isSavedSuccessful);
            if (isSavedSuccessful) {
                response.status(200).send({
                    success: 'true',
                    data: [],
                });
            } else {
                response.status(500).send({
                    success: 'false',
                    data: [],
                })
            }
    })

});

recordRoutes.route("/updateGallery").post(async function (request, response) {
    console.log('update deleteGallery from dataBase operation ____________________________________________');

    let gallery = request.body.gallery;
    let user = request.body.user.trim().toLowerCase();
    await databaseOperations.updateGallery(gallery, user).then(function (isSavedSuccessful) {
        console.log("is artwork update Successful: ", isSavedSuccessful);
            if (isSavedSuccessful) {
                response.status(200).send({
                    success: 'true',
                    data: [],
                });
            } else {
                response.status(500).send({
                    success: 'false',
                    data: [],
                })
            }
    })

});

recordRoutes.route("/getGalleries").post(function (request, response) {
    console.log('get gallery  operation ____________________________________________');
    let user = request.body.user ? request.body.user.trim().toLowerCase() : '';
    databaseOperations.getGalleries(user).then(
        function (galleries) {
            console.log("retrieved galleries count from database: ", galleries.length, "\n");
            response.status(200).send({
                success: 'true',
                galleries: galleries
            });
        })

});

recordRoutes.route("/getLikedArtworksForUser").post(function (request, response) {
    console.log('get gallery  operation ____________________________________________');
    let user = request.body.user ? request.body.user.trim().toLowerCase() : '';
    databaseOperations.getLikedArtworksForUser(user).then(
        function (likedArtworks) {
            console.log("retrieved user liked artworks count from database: ", likedArtworks.length, "\n");
            response.status(200).send({
                success: 'true',
                likedArtworks: likedArtworks
            });
        })

});

recordRoutes.route("/getKeywords").post(async function (request, response) {
    const title = request.body.title;
    console.log(`Received title for keyword extraction: "${title}"`);
    const keywords = await apiCall.retrieveKeywordsFromYAKE(title);
    console.log(`Extracted keywords for title "${title}":`, keywords);
    response.status(200).send(keywords);
});


module.exports = recordRoutes;
