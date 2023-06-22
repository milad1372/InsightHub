import React, {useState} from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import SearchedArtworks from "./pages/SearchArtworks";
import SavedArtworks from "./pages/SavedArtworks";
import Navbar from "./components/Navbar";

// import ApolloProvider
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import {getSavedArtworkIds} from "./utils/localStorage";

// Construct main GraphQL API endpoint
const httpLink = createHttpLink({
  uri: "/graphql",
});

// Construct request middleware that will attach the JWT token to every request as an `authorization` header
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// execute the `authLink` middleware prior to making the request to our GraphQL API
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});



const App = () => {
  const [searchedArtworks, setSearchedArtworks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
            />
            <Switch>
              <Route
                  exact
                  path="/"
                  render={(props) => (
                      <SearchedArtworks
                          {...props}
                          searchedArtworks={searchedArtworks}
                          currentPage={currentPage}
                          totalPages={totalPages}
                      />
                  )}
              />
              <Route exact path="/saved" component={SavedArtworks} />
              <Route render={() => <h1 className="display-2">Wrong page!</h1>} />
            </Switch>
          </>
        </Router>
      </ApolloProvider>
  );
};

export default App;

