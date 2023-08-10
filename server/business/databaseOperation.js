const dbo = require("../config/connection");
const sort = {savedOrderId: 1};
const limit = 10;
let ObjectId = require('mongodb').ObjectId;

module.exports = {

    saveGallery: async function (gallery, artwork, image, galleryDescription, user, isPrivate) {
        let newArtworks = [];
        let db_connect = dbo.getDb();

        let galleryFromDatabase = await this.getGalleryFromDatabaseByGalleryName(gallery, user);
        if (galleryFromDatabase != null && galleryFromDatabase != "" && galleryFromDatabase != undefined) {
            newArtworks = galleryFromDatabase.artworks;
            const filterArtworks = newArtworks.filter((artworkC) => artworkC.artworkId == artwork.artworkId);
            filterArtworks.length == 0 ? newArtworks.push(artwork) : newArtworks;

            let newValue = {$set: {artworks: newArtworks}};
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
            newArtworks.push(artwork);
            let galleryFroSavingIntoDatabase = {
                gallery: gallery,
                image: image,
                artworks: newArtworks,
                galleryDescription: galleryDescription,
                user: user,
                isPrivate: isPrivate
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
            const filterArtworks = newArtworks.filter((artworkC) => artworkC.artworkId == artwork.artworkId);
            filterArtworks.length == 0 ? newArtworks.push(artwork) : newArtworks;
            let newValue = {$set: {artworks: newArtworks}};
            const filter = {user: user};
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


    deleteLikedArtwork: async function (artworkId, user) {
        let newArtworkIds = [];
        let db_connect = dbo.getDb();

        let userFromDatabase = await this.getUserLikedArtworksFromDatabaseByUserName(user);
        newArtworkIds = userFromDatabase.artworks;
        const index1 = newArtworkIds.indexOf(artworkId);

        newArtworkIds.splice(index1, 1);
        let newValue = {$set: {artworks: newArtworkIds}};
        const filter = {user: user};
        try {
            let res = await db_connect.collection("userLikedArtworksCollection").findOneAndUpdate(filter, newValue, {returnDocument: "after"});
            console.log("1 user updated: ", res);
            return true;
        } catch (err) {
            console.error(`Something went wrong: ${err}`);
            return false;
        }

    },


    deleteGallery: async function (galleryName, user) {
        let db_connect = dbo.getDb();

        const filter = {"gallery": {$regex: new RegExp(galleryName, "i")}, user: user};
        try {
            let res = await db_connect.collection("galleryCollection").findOneAndDelete(filter, {returnDocument: "after"});
            console.log("1 gallery deleted: ", res);
            return true;
        } catch (err) {
            console.error(`Something went wrong: ${err}`);
            return false;
        }
    },


    updateGallery: async function (galleryNew, user) {
        let db_connect = dbo.getDb();
        let newValue = {$set: {gallery: galleryNew.gallery,
                image: galleryNew.image,
                artworks: galleryNew.artworks,
                galleryDescription: galleryNew.galleryDescription,
                user: user,
                isPrivate: galleryNew.isPrivate}};
            const filter = {"gallery": {$regex: new RegExp(galleryNew, "i")}, user: user};
            try {
                let res = await db_connect.collection("galleryCollection").findOneAndUpdate(filter, newValue, {returnDocument: "after"});
                console.log("1 gallery updated: ", res);
                return true;
            } catch (err) {
                console.error(`Something went wrong: ${err}`);
                return false;
            }
    },


    getTagFromDatabaseByTagId: async function (tagId) {
        let db_connect = dbo.getDb();
        let existingTag;
        existingTag = await db_connect.collection('tagCollection').findOne({"_id": ObjectId(tagId)});
        return existingTag;
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
