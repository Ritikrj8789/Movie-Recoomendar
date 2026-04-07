import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import YouTube from "react-youtube";

const OMDB_API_KEY = "1f00d5d9";
const YOUTUBE_API_KEY = "AIzaSyBO2NwPh2OVPADqfRIRE9V6uDJp-huWyyE";

const FIXED_HERO = {
  title: "Dhurandhar: The Revenge",
  searchTitle: "Dhurandhar The Revenge",
  subtitle: "Explore Bollywood, Tollywood, romance, action and classics.",
};

const categoriesList = [
  { key: "bollywood", title: "Bollywood Hits", term: "bollywood" },
  { key: "tollywood", title: "Tollywood Picks", term: "telugu" },
  { key: "romance", title: "Romantic Indian Movies", term: "romance hindi" },
  { key: "action", title: "South Action Movies", term: "action telugu" },
  { key: "classic", title: "Bollywood Classics", term: "amitabh bachchan" },
];

function MovieCard({ movie, onSelect, onToggleWatchlist, isSaved }) {
  return (
    <div
      onClick={() => onSelect(movie.imdbID, movie.Title)}
      style={{
        minWidth: 180,
        maxWidth: 180,
        background: "#111",
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        color: "white",
      }}
    >
      <div style={{ position: "relative", height: 260, background: "#222" }}>
        <img
          src={
            movie.Poster !== "N/A"
              ? movie.Poster
              : "https://via.placeholder.com/300x450?text=No+Poster"
          }
          alt={movie.Title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(movie);
          }}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            border: "none",
            borderRadius: "50%",
            width: 34,
            height: 34,
            cursor: "pointer",
            background: "rgba(0,0,0,0.7)",
            color: isSaved ? "red" : "white",
            fontSize: 18,
          }}
        >
          ❤
        </button>
      </div>

      <div style={{ padding: 10 }}>
        <div style={{ fontWeight: "bold", fontSize: 14 }}>{movie.Title}</div>
        <div style={{ color: "#bbb", fontSize: 12 }}>{movie.Year}</div>
      </div>
    </div>
  );
}

function Row({ title, movies, onSelect, onToggleWatchlist, watchlistIds }) {
  if (!movies || movies.length === 0) return null;

  return (
    <div style={{ padding: "20px 30px" }}>
      <h2 style={{ color: "white", marginBottom: 12 }}>{title}</h2>
      <div
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          paddingBottom: 10,
        }}
      >
        {movies.map((movie) => (
          <MovieCard
            key={movie.imdbID}
            movie={movie}
            onSelect={onSelect}
            onToggleWatchlist={onToggleWatchlist}
            isSaved={watchlistIds.includes(movie.imdbID)}
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [heroMovie, setHeroMovie] = useState(null);
  const [categories, setCategories] = useState({});
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem("movie_hub_watchlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const watchlistIds = useMemo(
    () => watchlist.map((movie) => movie.imdbID),
    [watchlist]
  );

  useEffect(() => {
    localStorage.setItem("movie_hub_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const fetchMovies = async (term) => {
    try {
      const res = await axios.get(
        `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(term)}`
      );
      return res.data.Search || [];
    } catch (error) {
      console.log("Movie fetch error:", error);
      return [];
    }
  };

  const fetchMovieDetails = async (id) => {
    const res = await axios.get(
      `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${id}&plot=full`
    );
    return res.data;
  };

  const fetchTrailer = async (title) => {
    if (
      !YOUTUBE_API_KEY ||
      YOUTUBE_API_KEY === "YOUR_YOUTUBE_API_KEY_HERE"
    ) {
      return "";
    }

    const searchTerms = [
      `${title} official trailer`,
      `${title} trailer`,
      `${title} official hindi trailer`,
      `${title} teaser`,
    ];

    for (const term of searchTerms) {
      try {
        const res = await axios.get(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
            term
          )}&type=video&maxResults=3&key=${YOUTUBE_API_KEY}`
        );

        const items = res.data.items || [];
        if (items.length > 0) {
          return items[0].id.videoId;
        }
      } catch (error) {
        console.log("Trailer fetch error:", error);
      }
    }

    return "";
  };

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      setError("");

      try {
        const [hero, bollywood, tollywood, romance, action, classic] =
          await Promise.all([
            fetchMovies(FIXED_HERO.searchTitle),
            fetchMovies("bollywood"),
            fetchMovies("telugu"),
            fetchMovies("romance hindi"),
            fetchMovies("action telugu"),
            fetchMovies("amitabh bachchan"),
          ]);

        setHeroMovie(hero?.[0] || null);

        setCategories({
          bollywood,
          tollywood,
          romance,
          action,
          classic,
        });
      } catch (error) {
        console.log(error);
        setError("Failed to load movies.");
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const results = await fetchMovies(query);
      setSearchResults(results);
    } catch (error) {
      console.log(error);
      setError("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (id, title) => {
    setLoading(true);
    setError("");

    try {
      const [details, trailer] = await Promise.all([
        fetchMovieDetails(id),
        fetchTrailer(title),
      ]);

      setSelectedMovie(details);
      setTrailerUrl(trailer);
    } catch (error) {
      console.log(error);
      setError("Could not open movie details.");
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = (movie) => {
    setWatchlist((prev) => {
      const exists = prev.some((item) => item.imdbID === movie.imdbID);

      if (exists) {
        return prev.filter((item) => item.imdbID !== movie.imdbID);
      }

      return [movie, ...prev];
    });
  };

  const closePopup = () => {
    setSelectedMovie(null);
    setTrailerUrl("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode ? "black" : "#f2f2f2",
        color: darkMode ? "white" : "black",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          padding: "16px 30px",
          background: darkMode ? "rgba(0,0,0,0.92)" : "rgba(255,255,255,0.95)",
          borderBottom: darkMode ? "1px solid #222" : "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ color: "red", fontSize: 28, fontWeight: "bold" }}>
            MOVIE HUB BY RITIK
          </div>
          <div style={{ fontSize: 13, color: darkMode ? "#aaa" : "#555" }}>
            Bollywood • Tollywood • Romance • Action • Classics
          </div>
        </div>

        <button
          onClick={() => setDarkMode((prev) => !prev)}
          style={{
            padding: "10px 14px",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            background: darkMode ? "#fff" : "#111",
            color: darkMode ? "#000" : "#fff",
            fontWeight: "bold",
          }}
        >
          {darkMode ? "☀ Light" : "🌙 Dark"}
        </button>
      </div>

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
            padding: 30,
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

          <div style={{ position: "relative", zIndex: 2, maxWidth: 700 }}>
            <h1 style={{ fontSize: 48, marginBottom: 10 }}>
              {FIXED_HERO.title}
            </h1>
            <p style={{ color: "#ddd", marginBottom: 15 }}>
              {FIXED_HERO.subtitle}
            </p>

            <button
              onClick={() =>
                handleSelect(heroMovie.imdbID, FIXED_HERO.searchTitle)
              }
              style={{
                padding: "10px 20px",
                backgroundColor: "white",
                color: "black",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ▶ Play
            </button>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", padding: 30 }}>
        <input
          placeholder="Search Bollywood or Tollywood movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{
            padding: 12,
            width: 320,
            borderRadius: 6,
            border: "1px solid #333",
            marginRight: 10,
            backgroundColor: darkMode ? "#111" : "white",
            color: darkMode ? "white" : "black",
          }}
        />

        <button
          onClick={handleSearch}
          style={{
            padding: "12px 20px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Search
        </button>
      </div>

      {error && (
        <p style={{ textAlign: "center", color: "red", marginBottom: 20 }}>
          {error}
        </p>
      )}

      {loading && (
        <p style={{ textAlign: "center", color: "#aaa", marginBottom: 20 }}>
          Loading...
        </p>
      )}

      {watchlist.length > 0 && (
        <Row
          title="My Watchlist"
          movies={watchlist}
          onSelect={handleSelect}
          onToggleWatchlist={toggleWatchlist}
          watchlistIds={watchlistIds}
        />
      )}

      {searchResults.length > 0 && (
        <Row
          title={`Search Results: ${query}`}
          movies={searchResults}
          onSelect={handleSelect}
          onToggleWatchlist={toggleWatchlist}
          watchlistIds={watchlistIds}
        />
      )}

      {Object.entries(categories).map(([key, movies]) => {
        const title =
          categoriesList.find((item) => item.key === key)?.title || key;

        return (
          <Row
            key={key}
            title={title}
            movies={movies}
            onSelect={handleSelect}
            onToggleWatchlist={toggleWatchlist}
            watchlistIds={watchlistIds}
          />
        );
      })}

      <div
        style={{
          textAlign: "center",
          padding: 20,
          color: darkMode ? "#888" : "#666",
          marginTop: 30,
        }}
      >
        Built with React, OMDb API, and YouTube API
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
              padding: 20,
              borderRadius: 10,
              maxWidth: 700,
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              color: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <h2>{selectedMovie.Title}</h2>

              <button
                onClick={closePopup}
                style={{
                  background: "transparent",
                  color: "white",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ✖
              </button>
            </div>

            {trailerUrl ? (
              <YouTube videoId={trailerUrl} opts={{ width: "100%", height: "300" }} />
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
              style={{ marginTop: 15, borderRadius: 8 }}
            />

            <p>
              <b>Year:</b> {selectedMovie.Year}
            </p>
            <p>
              <b>Genre:</b> {selectedMovie.Genre}
            </p>
            <p>
              <b>IMDb:</b> {selectedMovie.imdbRating}
            </p>
            <p>
              <b>Plot:</b> {selectedMovie.Plot}
            </p>
            <p>
              <b>Actors:</b> {selectedMovie.Actors}
            </p>

            <button
              onClick={() => toggleWatchlist(selectedMovie)}
              style={{
                marginTop: 10,
                padding: "10px 18px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {watchlistIds.includes(selectedMovie.imdbID)
                ? "Remove from Watchlist"
                : "Add to Watchlist"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}