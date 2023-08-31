const axios = require('axios');
const querystring = require('querystring');


const Api_Key = process.env.Api_Key;
const Format = process.env.Format;
const Max_Records = process.env.Max_Records;
const Sort_Order = process.env.Sort_Order;
const Sort_Field = process.env.Sort_Field;
const Base_URL_For_Europeana = process.env.Base_URL_For_Europeana;
const yakeURL = "http://3.138.179.7:5000/yake/";


module.exports = {

    retrieveDocumentsFromEuropeanaAPI: async function (searchInput, filterQuery, pageNumber, response) {
        let startRecord = 24 * (pageNumber - 1) + 1;
        let targetURI = Base_URL_For_Europeana + `profile=standard&sort=score+desc&query=${searchInput}&${filterQuery}&rows=${Max_Records}&start=${startRecord}&wskey=${Api_Key}`;

        console.log("targetURI: ", targetURI);

        try {
            const apiResponse = await axios.get(targetURI, {
                headers: {
                    Accept: "application/json, text/plain",
                    "Accept-Encoding": "gzip, deflate",
                    "Content-Type": "application/json",
                    "Accept-Language": "en-ca",
                },
            });

            const responseData = apiResponse.data;
            return responseData;
        } catch (error) {
            console.error("Error retrieving data from API:", error);
            return null;
        }
    },
    
    retrieveKeywordsFromYAKE: async function (title) {
        try {
            const response = await axios.post(yakeURL, {
                language: "en",
                max_ngram_size: 2,
                number_of_keywords: 5,
                text: title
            }, {
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/json"
                }
            });
    
            const keywords = response.data ? response.data.map(keywordObj => keywordObj.ngram) : [];
        // console.log(`YAKE API response for title "${title}":`, keywords);
        // console.log("YAKE API full response:", response.data);
        return keywords;
        } catch (error) {
            console.error("Error retrieving keywords from YAKE:", error);
            return [];
        }
    }
};
