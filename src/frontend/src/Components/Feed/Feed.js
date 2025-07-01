import React, { useState, useEffect } from 'react';
import './Feed.css';

const Feed = () => {
  const [activeTab, setActiveTab] = useState('playlists');
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'playlists') {
      fetchPlaylists();
    }
  }, [activeTab]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      // Substitua '1' pelo ID do usuário atual da sua aplicação
      const userId = 1; // Você pode pegar isso do contexto, props, ou estado global
      const response = await fetch(`http://localhost:8000/api/feed/playlists/${userId}/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar playlists');
      }

      const data = await response.json();
      setPlaylists(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  const PlaylistCard = ({ playlist }) => {
    const [showAllSongs, setShowAllSongs] = useState(false);
    const maxSongsToShow = 3;
    
    const songsToDisplay = showAllSongs 
      ? playlist.musicas 
      : playlist.musicas.slice(0, maxSongsToShow);

    return (
      <div className="playlist-card">
        {/* Header da Playlist */}
        <div className="playlist-header">
          <div className="playlist-cover">
            {playlist.imagem_capa_playlist ? (
              <img 
                src={playlist.imagem_capa_playlist} 
                alt={playlist.nome}
                className="playlist-cover-image"
              />
            ) : (
              <div className="playlist-cover-placeholder">
                <span className="playlist-icon">🎵</span>
              </div>
            )}
          </div>
          
          <div className="playlist-info">
            <h3 className="playlist-name">{playlist.nome}</h3>
            <div className="playlist-user">
              <div className="user-avatar">
                {playlist.perfil_usuario?.imagem_perfil ? (
                  <img 
                    src={playlist.perfil_usuario.imagem_perfil} 
                    alt={playlist.perfil_usuario.nome}
                    className="user-avatar-image"
                  />
                ) : (
                  <div className="user-avatar-placeholder">
                    {getInitials(playlist.perfil_usuario?.nome || playlist.usuario)}
                  </div>
                )}
              </div>
              <span className="username">
                {playlist.perfil_usuario?.nome || playlist.usuario}
              </span>
            </div>
            <p className="songs-count">{playlist.total_musicas} músicas</p>
          </div>
        </div>

        {/* Lista de Músicas */}
        <div className="songs-list">
          <h4 className="songs-title">Faixas:</h4>
          {songsToDisplay.map((musica, index) => (
            <div key={musica.id} className="song-item">
              <div className="song-info">
                <div className="song-cover">
                  {musica.imagem_capa ? (
                    <img 
                      src={musica.imagem_capa} 
                      alt={musica.titulo}
                      className="song-cover-image"
                    />
                  ) : (
                    <div className="song-cover-placeholder">
                      <span className="song-number">{index + 1}</span>
                    </div>
                  )}
                </div>
                <div className="song-details">
                  <p className="song-title">{musica.titulo}</p>
                  <p className="song-artist">{musica.artista}</p>
                  {musica.album && (
                    <p className="song-album">{musica.album}</p>
                  )}
                </div>
              </div>
              <span className="song-genre">{musica.genero}</span>
            </div>
          ))}
          
          {playlist.musicas.length > maxSongsToShow && (
            <button 
              className="show-more-btn"
              onClick={() => setShowAllSongs(!showAllSongs)}
            >
              {showAllSongs 
                ? 'Mostrar menos' 
                : `Ver mais ${playlist.musicas.length - maxSongsToShow} músicas`
              }
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="feed-page">
      <div className="feed-header">
        <button
          className={`feed-tab ${activeTab === 'playlists' ? 'active' : ''}`}
          onClick={() => setActiveTab('playlists')}
        >
          Playlists
        </button>
        <button
          className={`feed-tab ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          Seguindo
        </button>
      </div>

      <div className="feed-content">
        {activeTab === 'playlists' ? (
          <div className="feed-section">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando playlists...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p className="error-message">❌ {error}</p>
                <button onClick={fetchPlaylists} className="retry-btn">
                  Tentar novamente
                </button>
              </div>
            ) : playlists.length === 0 ? (
              <div className="empty-container">
                <p className="empty-message">🎵 Nenhuma playlist encontrada</p>
              </div>
            ) : (
              playlists.map(playlist => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))
            )}
          </div>
        ) : (
          <div className="feed-section">
            <div className="coming-soon">
              <h3>🚧 Em breve!</h3>
              <p>A seção "Seguindo" estará disponível em breve.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;