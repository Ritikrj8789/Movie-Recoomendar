import { useState } from "react";
import axios from "axios";

function App() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");

  const searchMovies = async () => {
    const res = await axios.get(
      `http://localhost:5000/movies/search?q=${query}`
    );
    setMovies(res.data);
  };

  return (
    <div className="bg-black min-h-screen text-white">
      
      {/* Navbar */}
      <div className="flex justify-between p-4">
        <h1 className="text-red-600 text-2xl font-bold">NETFLIX</h1>
        
        <div>
          <input
            className="p-2 text-black"
            placeholder="Search..."
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={searchMovies} className="bg-red-600 p-2 ml-2">
            Search
          </button>
        </div>
      </div>
{movies[0] && (
  <div
    className="h-[400px] bg-cover bg-center flex items-end p-6"
    style={{
      backgroundImage: `url(${movies[0].Poster})`,
    }}
  >
    <h1 className="text-3xl font-bold">{movies[0].Title}</h1>
  </div>
)}
      {/* Movie Row */}
      <h2 className="text-xl p-4">Movies</h2>

      <div className="flex overflow-x-scroll p-4 space-x-4">
        {movies.map((movie) => (
          <div
            key={movie.imdbID}
            className="min-w-[150px] hover:scale-110 transition transform"
            onClick={() => searchMovies(movie.Title)}
          >
            <img
              src={movie.Poster}
              alt={movie.Title}
              className="rounded-lg"
            />
            <p className="text-sm mt-2">{movie.Title}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;