const dbo = require("../config/connection");
const sort = {savedOrderId: 1};
const limit = 10;
let ObjectId = require('mongodb').ObjectId;

module.exports = {

    saveGallery: async function (gallery, artworkId, image, galleryDescription, user,isPrivate) {
        let newArtworkIdIds = [];
        let db_connect = dbo.getDb();

        let galleryFromDatabase = await this.getGalleryFromDatabaseByGalleryName(gallery, user);
        if (galleryFromDatabase != null && galleryFromDatabase != "" && galleryFromDatabase != undefined) {
            newArtworkIdIds = galleryFromDatabase.artworkIds;
            !newArtworkIdIds.includes(artworkId) ? newArtworkIdIds.push(artworkId) : newArtworkIdIds;
            let newValue = {$set: {newGalleryIds: newArtworkIdIds}};
            const filter = {"gallery": {$regex: new RegExp(gallery, "i")}, user: user};
            try {
                let res = await db_connect.collection("galleryCollection").findOneAndUpdate(filter, newValue, {returnDocument: "after"});
                console.log("1 gallery updated: ", res);
                return true;
            } catch (err) {
                console.error(`Something went wrong: ${err}`);
                return false;
            }
        } else {
            newArtworkIdIds.push(artworkId);
            let galleryFroSavingIntoDatabase = {
                gallery: gallery,
                image: image,
                artworkIdIds: newArtworkIdIds,
                galleryDescription: galleryDescription,
                user: user,
                isPrivate:isPrivate
            };

            try {
                let res = await db_connect.collection("galleryCollection").insertOne(galleryFroSavingIntoDatabase);
                console.log("1 gallery inserted: ", res);
                return true;
            } catch (err) {
                console.error(`Something went wrong: ${err}`);
                return false;
            }
        }
    },


    saveLikedArtwork: async function (artwork, user) {
        let newArtworks = [];
        let db_connect = dbo.getDb();

        let userFromDatabase = await this.getUserLikedArtworksFromDatabaseByUserName(user);
        if (userFromDatabase != null && userFromDatabase != "" && userFromDatabase != undefined) {
            newArtworks = userFromDatabase.artworks;
            !newArtworks.includes(artwork.artworkId) ? newArtworks.push(artwork.artworkId) : newArtworks;
            let newValue = {$set: {newArtworks: newArtworks}};
            const filter = {"artwork": {$regex: new RegExp(artwork, "i")}, user: user};
            try {
                let res = await db_connect.collection("userLikedArtworksCollection").findOneAndUpdate(filter, newValue, {returnDocument: "after"});
                console.log("1 user data updated: ", res);
                return true;
            } catch (err) {
                console.error(`Something went wrong: ${err}`);
                return false;
            }
        } else {
            newArtworks.push(artwork);
            let userArtworkFroSavingIntoDatabase = {
                artworks: newArtworks,
                user: user,
            };

            try {
                let res = await db_connect.collection("userLikedArtworksCollection").insertOne(userArtworkFroSavingIntoDatabase);
                console.log("1 gallery inserted: ", res);
                return true;
            } catch (err) {
                console.error(`Something went wrong: ${err}`);
                return false;
            }
        }
    },


    getGalleries: async function (user) {
        let db_connect = dbo.getDb();
        let galleries = [];
        galleries = await db_connect.collection('galleryCollection').find({
            user: user
        }).toArray();
        return galleries;
    },


    getLikedArtworksForUser: async function (user) {
        let db_connect = dbo.getDb();
        let likedArtworks = [];
        likedArtworks = await db_connect.collection('userLikedArtworksCollection').find({
            user: user
        }).toArray();
        return likedArtworks;
    },

    getGalleryFromDatabaseByGalleryName: async function (gallery, user) {
        let db_connect = dbo.getDb();
        let existingGallery;
        existingGallery = await db_connect.collection('galleryCollection').findOne({
            "gallery": {$regex: new RegExp(gallery, "i")},
            user: user
        });
        return existingGallery;
    },


    getUserLikedArtworksFromDatabaseByUserName: async function (user) {
        let db_connect = dbo.getDb();
        let existingUser;
        existingUser = await db_connect.collection('userLikedArtworksCollection').findOne({
            "user": {$regex: new RegExp(user, "i")},
            user: user
        });
        return existingUser;
    }
}
