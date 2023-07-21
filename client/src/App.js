import React, {useState} from "react";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import SearchArtworks from "./pages/SearchArtworks";
import SavedArtworks from "./pages/SavedArtworks";
import Navbar from "./components/Navbar";
import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    createHttpLink,
} from "@apollo/client";
import {setContext} from "@apollo/client/link/context";
import {getSavedArtworkIds} from "./utils/localStorage";
import {Container, Row} from "react-bootstrap";

const httpLink = createHttpLink({
    uri: "/graphql",
});

const authLink = setContext((_, {headers}) => {
    const token = localStorage.getItem("id_token");
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        },
    };
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});

const App = () => {
    const [searchedArtworks, setSearchedArtworks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({}); // Add this state to hold the current filters

    const handleSharedVariableChange = (totalPages, artworkData) => {
        setTotalPages(totalPages);
        setSearchedArtworks(artworkData);
        setCurrentPage(1);
    };

    return (
        <ApolloProvider client={client}>
            <Router>
                <>
                    <Navbar
                        searchedArtworks={searchedArtworks}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onSharedVariableChange={handleSharedVariableChange}
                        filters={filters} // Pass the filters to Navbar
                        onFilterChange={setFilters} // Pass a function to update the filters
                    />
                    <Switch>
                        <Route
                            exact
                            path="/"
                            render={(props) => (

                                        <SearchArtworks
                                            {...props}
                                            searchedArtworks={searchedArtworks}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            filters={filters} // Pass the filters to SearchArtworks
                                            onFilterChange={setFilters} // Pass a function to update the filters
                                        />

                            )}
                        />
                        <Route exact path="/saved" component={SavedArtworks}/>
                        <Route render={() => <h1 className="display-2">Wrong page!</h1>}/>
                    </Switch>
                </>
            </Router>
        </ApolloProvider>
    );
};

export default App;
