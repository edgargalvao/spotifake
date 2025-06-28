import React, { useEffect, useState } from 'react';
import './PlaylistSongs.css'; 

export default function PlaylistSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/songs/')
      .then(response => response.json())
      .then(data => {
        setSongs(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar músicas:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="loading-text">Carregando músicas...</p>;

  return (
    <div className="playlist-container">
      <h2 className="playlist-title">Todas as Músicas</h2>

      {songs.length === 0 ? (
        <p className="no-songs-text">Nenhuma música encontrada.</p>
      ) : (
        <ul className="song-list">
          {songs.map(song => (
            <li key={song.id} className="song-item">
              <div className="cover-image-wrapper">
                {song.cover_image ? (
                  <img src={song.cover_image} alt={song.title} className="cover-image" />
                ) : (
                  <div className="cover-placeholder">🎵</div>
                )}
              </div>
              <div className="song-details">
                <h3 className="song-title">{song.title}</h3>
                <p className="song-artist">{song.artist}</p>
                <p className="song-album">{song.album}</p>
                <span className="song-genre">{song.genre}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}