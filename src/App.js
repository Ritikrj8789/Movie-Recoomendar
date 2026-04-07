import { useEffect, useState } from "react";
import axios from "axios";
import Row from "./Row";
import YouTube from "react-youtube";

const OMDB_API_KEY = "1f00d5d9";
const YOUTUBE_API_KEY = "AIzaSyBO2NwPh2OVPADqfRIRE9V6uDJp-huWyyE";

export default function App() {
  const [heroMovies, setHeroMovies] = useState([]);
  const [bollywoodMovies, setBollywoodMovies] = useState([]);
  const [tollywoodMovies, setTollywoodMovies] = useState([]);
  const [romanticMovies, setRomanticMovies] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [classicMovies, setClassicMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);

      const fetchMovies = async (term) => {
        try {
          const res = await axios.get(
            `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(term)}`
          );
          return res.data.Search || [];
        } catch (error) {
          console.log("OMDb error:", error);
          return [];
        }
      };

      const [hero, bollywood, tollywood, romantic, action, classics] =
        await Promise.all([
          fetchMovies("shah rukh khan"),
          fetchMovies("bollywood"),
          fetchMovies("telugu"),
          fetchMovies("romance hindi"),
          fetchMovies("action telugu"),
          fetchMovies("amitabh bachchan"),
        ]);

      setHeroMovies(hero);
      setBollywoodMovies(bollywood);
      setTollywoodMovies(tollywood);
      setRomanticMovies(romantic);
      setActionMovies(action);
      setClassicMovies(classics);

      setLoading(false);
    };

    loadMovies();
  }, []);

  const fetchMoviesBySearch = async (term) => {
    try {
      const res = await axios.get(
        `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(term)}`
      );
      return res.data.Search || [];
    } catch (error) {
      console.log("Search error:", error);
      return [];
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const results = await fetchMoviesBySearch(query);
    setSearchResults(results);
    setLoading(false);
  };

  const getMovieDetails = async (id) => {
    try {
      const res = await axios.get(
        `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${id}`
      );
      setSelectedMovie(res.data);
    } catch (error) {
      console.log("Details error:", error);
    }
  };

  const getTrailer = async (title) => {
    try {
      const searchTerms = [
        `${title} official trailer`,
        `${title} trailer`,
        `${title} hindi trailer`,
        `${title} telugu trailer`,
      ];

      let foundVideoId = "";

      for (const term of searchTerms) {
        const res = await axios.get(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
            term
          )}&type=video&maxResults=3&key=${YOUTUBE_API_KEY}`
        );

        const items = res.data.items || [];
        if (items.length > 0) {
          foundVideoId = items[0].id.videoId;
          break;
        }
      }

      setTrailerUrl(foundVideoId);
    } catch (error) {
      console.log("Trailer error:", error);
      setTrailerUrl("");
    }
  };

  const handleSelect = async (id, title) => {
    await getMovieDetails(id);
    await getTrailer(title);
  };

  const closePopup = () => {
    setSelectedMovie(null);
    setTrailerUrl("");
  };

  const heroMovie = heroMovies[0];

  return (
    <div style={{ backgroundColor: "black", minHeight: "100vh", color: "white" }}>
      <div
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          padding: "15px 30px",
          background: "rgba(0,0,0,0.9)",
          color: "red",
          fontSize: "24px",
          fontWeight: "bold",
          zIndex: 1000,
          boxSizing: "border-box",
        }}
      >
        MOVIE HUB BY RITIK
      </div>

      <div style={{ paddingTop: "80px" }}>
        {heroMovie && (
          <div
            style={{
              height: "70vh",
              backgroundImage: `url(${heroMovie.Poster})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              display: "flex",
              alignItems: "flex-end",
              padding: "40px",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.35), rgba(0,0,0,0.15))",
              }}
            />
            <div style={{ position: "relative", zIndex: 2, maxWidth: "600px" }}>
              <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>
                {heroMovie.Title}
              </h1>
              <p style={{ color: "#ddd", marginBottom: "15px" }}>
                Explore Bollywood, Tollywood, romance, action and classics.
              </p>
              <button
                onClick={() => handleSelect(heroMovie.imdbID, heroMovie.Title)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "white",
                  color: "black",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ▶ Play
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", padding: "30px" }}>
          <input
            placeholder="Search Bollywood or Tollywood movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              padding: "12px",
              width: "300px",
              borderRadius: "6px",
              border: "1px solid #333",
              marginRight: "10px",
              backgroundColor: "#111",
              color: "white",
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: "12px 20px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Search
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#aaa" }}>Loading...</p>
        ) : (
          <>
            {searchResults.length > 0 && (
              <Row
                title={`Search Results: ${query}`}
                movies={searchResults}
                onSelect={handleSelect}
              />
            )}

            <Row title="Bollywood Hits" movies={bollywoodMovies} onSelect={handleSelect} />
            <Row title="Tollywood Picks" movies={tollywoodMovies} onSelect={handleSelect} />
            <Row title="Romantic Indian Movies" movies={romanticMovies} onSelect={handleSelect} />
            <Row title="South Action Movies" movies={actionMovies} onSelect={handleSelect} />
            <Row title="Bollywood Classics" movies={classicMovies} onSelect={handleSelect} />
          </>
        )}

        <div
          style={{
            textAlign: "center",
            padding: "20px",
            color: "#888",
            marginTop: "30px",
          }}
        >
          Built with React, OMDb API, and YouTube API
        </div>
      </div>

      {selectedMovie && (
        <div
          onClick={closePopup}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "black",
              padding: "20px",
              borderRadius: "10px",
              maxWidth: "700px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              color: "white",
            }}
          >
            <h2>{selectedMovie.Title}</h2>

            {trailerUrl ? (
              <YouTube
                videoId={trailerUrl}
                opts={{ width: "100%", height: "300" }}
              />
            ) : (
              <p>Trailer unavailable for this title.</p>
            )}

            <img
              src={
                selectedMovie.Poster !== "N/A"
                  ? selectedMovie.Poster
                  : "https://via.placeholder.com/200x300?text=No+Image"
              }
              width="200"
              alt={selectedMovie.Title}
            />

            <p><b>Year:</b> {selectedMovie.Year}</p>
            <p><b>Genre:</b> {selectedMovie.Genre}</p>
            <p><b>IMDB:</b> {selectedMovie.imdbRating}</p>
            <p><b>Plot:</b> {selectedMovie.Plot}</p>
          </div>
        </div>
      )}
    </div>
  );
}