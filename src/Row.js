export default function Row({ title, movies, onSelect }) {
  return (
    <div style={{ margin: "20px" }}>
      <h2 style={{ marginLeft: "20px" }}>{title}</h2>

      <div
        style={{
          display: "flex",
          overflowX: "auto",
          padding: "10px 20px",
        }}
      >
        {movies.map((movie) => (
          <img
            key={movie.imdbID}
            src={
              movie.Poster !== "N/A"
                ? movie.Poster
                : "https://via.placeholder.com/150x220?text=No+Image"
            }
            alt={movie.Title}
            onClick={() => onSelect(movie.imdbID, movie.Title)}
            style={{
              width: window.innerWidth < 600 ? "100px" : "150px",
              marginRight: "10px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "transform 0.3s",
            }}
            onMouseOver={(e) =>
              (e.target.style.transform = "scale(1.1)")
            }
            onMouseOut={(e) =>
              (e.target.style.transform = "scale(1)")
            }
          />
        ))}
      </div>
    </div>
  );
}