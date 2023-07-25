const AWS_Base_URL = "/api/";
const Local_Base_URL = "http://localhost:3001/";
const mainURL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? Local_Base_URL : AWS_Base_URL;

const getRecords = async function (searchInput, filterQuery, pageNumber) {
    if (localStorage.getItem('firstRun')!=null && localStorage.getItem('firstRun')!="true") {
        localStorage.setItem('currentQuery', searchInput);
        localStorage.setItem('currentFilter', filterQuery);

        let items = [];
        let artworkData = [];
        let totalPages = 0;
        let dataObject = {
            items: [],
            artworkData: [],
            totalPages: 0
        };
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                searchInput: searchInput,
                filterQuery: filterQuery,
                pageNumber: pageNumber,
            })
        };

        const response = await fetch(mainURL + 'recordList', requestOptions).then(function (response) {
            if (!response.ok) {
                console.log("response.ok", response.ok)
                // const message = `An error has occurred: ${response.statusText}`;
                // window.alert(message);
                return dataObject;
            } else {
                return response.json(); // returns unresolved Promise
            }
        }).then(function (result) {
            items = result.data ? result.data.items : [];
            artworkData = items.map((artwork) => ({
                artworkId: artwork.id,
                title: artwork.title[0],
                license: artwork.rights[0],
                dataProvider: artwork.dataProvider[0],
                dcCreator: artwork.dcCreator ? artwork.dcCreator[0] : "",
                type: artwork.type,
                image: artwork.edmPreview
                    ? artwork.edmPreview[0]
                    : "No image available",
                description: artwork.dcDescriptionLangAware
                    ? artwork.dcDescriptionLangAware.en
                        ? artwork.dcDescriptionLangAware.en[0]
                        : "" : "",
            }));

            dataObject = {
                items: items,
                artworkData: artworkData,
                totalPages: result.data ? result.data.totalResults : 0
            };
            return dataObject;
        });
        return dataObject;
    }
};

export default getRecords;

