const express = require("express");
const app = express();

const recordRoutes = express.Router();
const apiCall = require("../business/ApiCall");

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

module.exports = recordRoutes;
