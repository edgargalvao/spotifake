import React, { useEffect, useState } from 'react';

export default function SongList({ onSelect }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/songs/')
      .then(res => res.json())
      .then(data => {
        setSongs(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Carregando músicas...</div>;

  return (
    <div className="song-list">
      <h2 style={{ color: '#fff', fontSize: 28, margin: '24px 0 12px 0' }}>Todas as Músicas</h2>
      {songs.length === 0 ? (
        <div style={{ color: '#fff', opacity: 0.7, marginTop: 16 }}>Nenhuma música encontrada.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {songs.map(song => {
            // Garante que a URL do áudio seja absoluta
            const audioUrl = song.arquivo_audio.startsWith('http')
              ? song.arquivo_audio
              : `http://localhost:8000${song.arquivo_audio}`;
            return (
              <li key={song.id} style={{ marginBottom: 10 }}>
                <button
                  onClick={() => onSelect(audioUrl, song.titulo, song.artista)}
                  style={{ background: 'none', border: 'none', color: '#1db954', cursor: 'pointer', fontSize: 18 }}
                >
                  {song.titulo} - {song.artista}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
