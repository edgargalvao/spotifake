import React, { useState, useEffect } from 'react';
import './PlaylistSongs.css';

function PlaylistSongs({ userId, onSelectSong }) {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedPlaylist, setExpandedPlaylist] = useState(null);
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [songs, setSongs] = useState([]);
    const [selectedSongs, setSelectedSongs] = useState(new Set());
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState(null);
    
    // Função para abrir o modal e carregar as músicas
    const openCreateModal = async () => {
      setShowCreateModal(true);
      setNewPlaylistName('');
      setSelectedSongs(new Set());
      setCreateError(null);
      try {
        const res = await fetch('http://localhost:8000/api/songs/');
        if (!res.ok) throw new Error('Erro ao carregar músicas');
        const data = await res.json();
        setSongs(data);
      } catch (err) {
        alert('Erro ao carregar músicas: ' + err.message);
      }
    };
    
    // Toggle seleção das músicas
    const toggleSongSelection = (songId) => {
      const newSet = new Set(selectedSongs);
      if (newSet.has(songId)) newSet.delete(songId);
      else newSet.add(songId);
      setSelectedSongs(newSet);
    };
    
    // Criar playlist no backend
    const createPlaylist = async () => {
      if (!newPlaylistName.trim()) {
        setCreateError('Nome da playlist é obrigatório');
        return;
      }
      if (selectedSongs.size === 0) {
        setCreateError('Selecione pelo menos uma música');
        return;
      }
      setCreating(true);
      setCreateError(null);
    
      try {
        const res = await fetch('http://localhost:8000/api/playlists/create/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: newPlaylistName,
            user_id: userId,              
            song_ids: Array.from(selectedSongs),  // ✅ CERTO
        }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Erro ao criar playlist');
        }
        // Atualiza lista de playlists e fecha modal
        fetchPlaylists();
        setShowCreateModal(false);
      } catch (err) {
        setCreateError(err.message);
      } finally {
        setCreating(false);
      }
    };
    useEffect(() => {
        if (!userId) {
            setError('ID do usuário não fornecido ou inválido');
            setLoading(false);
            return;
        }

        fetchPlaylists();
    }, [userId]);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`http://localhost:8000/api/playlists/?userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            if (data.success && data.playlists) {
                setPlaylists(data.playlists);
            } else if (data.error) {
                throw new Error(data.error);
            } else {
                setPlaylists(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const togglePlaylist = (playlistId) => {
        setExpandedPlaylist(expandedPlaylist === playlistId ? null : playlistId);
    };

    const handleDelete = async (playlistId) => {
        if (!window.confirm('Tem certeza que deseja excluir esta playlist?')) return;

        try {
            const response = await fetch(`http://localhost:8000/api/playlists/${playlistId}/delete/`, {
              method: 'DELETE',
              credentials: 'include'
            });
        
            if (response.ok) {
              alert("Playlist excluída com sucesso!");
              fetchPlaylists(); // recarrega as playlists
            } else {
              const data = await response.json();
              alert("Erro: " + (data.error || "Erro ao excluir playlist."));
            }
          } catch (error) {
            alert("Erro ao conectar com o servidor.");
            console.error(error);
          }
    };

    const handleEdit = (playlistId) => {
        alert(`Função de edição para a playlist ${playlistId} ainda não implementada.`);
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
    };

    if (!userId) {
        return (
            <div className="playlist-container">
                <p className="error-message">⚠️ Usuário não identificado</p>
                <p style={{ color: '#888' }}>Faça login para visualizar suas playlists</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="playlist-container">
                <p>Carregando playlists...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="playlist-container">
                <p className="error-message">❌ {error}</p>
                <button onClick={fetchPlaylists}>Tentar novamente</button>
            </div>
        );
    }

    return (
        <div className="playlist-container">
            <h2 className="playlist-title">Suas Playlists ({playlists.length})</h2>
            <button
                    className="retry-btn"
                    style={{ marginLeft: '12px', padding: '6px 14px', fontSize: '1rem' }}
                    onClick={openCreateModal}
                    >
                    + Criar Playlist
                    </button>
            {playlists.length === 0 ? (
                <p className="empty-message">🎵 Nenhuma playlist encontrada.</p>
            ) : (
                <div className="playlist-list">
                    {playlists.map(playlist => (
                        <div key={playlist.id} className="playlist-item">
                            <div className="playlist-header" onClick={() => togglePlaylist(playlist.id)}>
                                <div className="playlist-info-main">
                                    <div className="cover-image-wrapper">
                                        {playlist.capa || playlist.imagem_capa_playlist ? (
                                            <img src={playlist.capa || playlist.imagem_capa_playlist} alt="Capa" className="playlist-cover-image" />
                                        ) : (
                                            <div className="playlist-cover-placeholder">
                                                <span>🎵</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="playlist-details">
                                        <div className="playlist-name">{playlist.nome}</div>
                                        <div className="playlist-user">
                                            <div className="user-avatar">
                                                {playlist.perfil_usuario?.imagem_perfil ? (
                                                    <img src={playlist.perfil_usuario.imagem_perfil} alt="Avatar" className="user-avatar-image" />
                                                ) : (
                                                    <div className="user-avatar-placeholder">
                                                        {getInitials(playlist.perfil_usuario?.nome || playlist.usuario)}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="username">{playlist.perfil_usuario?.nome || playlist.usuario}</span>
                                        </div>
                                        <div className="playlist-description">
                                            {playlist.musicas?.length || 0} músicas
                                        </div>
                                    </div>
                                </div>

                                <div className="playlist-actions">
                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(playlist.id); }}>✏️</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(playlist.id); }}>🗑️</button>
                                    <span className={`expand-icon ${expandedPlaylist === playlist.id ? 'expanded' : ''}`}>▼</span>
                                </div>
                            </div>

                            {expandedPlaylist === playlist.id && (
                                <div className="playlist-songs">
                                    {playlist.musicas && playlist.musicas.length > 0 ? (
                                        <div className="songs-list">
                                            <div className="songs-header">
                                                <span className="song-play"></span>
                                                <span className="song-title">Título</span>
                                                <span className="song-artist">Artista</span>
                                                <span className="song-album">Álbum</span>
                                                <span className="song-duration">⏱️</span>
                                            </div>
                                            {playlist.musicas.map((musica, index) => (
                                                <div key={musica.id || index} className="song-item">
                                                    <button
                                                    className="play-button"
                                                    onClick={() => onSelectSong?.(musica.arquivo_audio, musica.titulo, musica.artista)}
                                                    >
                                                    ▶️
                                                    </button>
                                                    <div className="song-title">{musica.titulo || 'Sem título'}</div>
                                                    <div className="song-artist">{musica.artista || 'Desconhecido'}</div>
                                                    <div className="song-album">{musica.album || 'Álbum desconhecido'}</div>
                                                    <div className="song-duration">{formatDuration(musica.duracao)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>Esta playlist não contém músicas.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {showCreateModal && (
  <div
    className="modal-overlay"
    style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}
    onClick={() => !creating && setShowCreateModal(false)}
  >
    <div
      className="modal-content"
      style={{
        backgroundColor: '#181818',
        padding: '24px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '480px',
        color: '#fff',
        boxShadow: '0 0 20px #1db954',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 style={{ marginBottom: '16px' }}>Criar Nova Playlist</h3>
      <label style={{ display: 'block', marginBottom: '12px' }}>
        Nome da Playlist:
        <input
          type="text"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          disabled={creating}
          style={{
            width: '100%',
            padding: '8px',
            marginTop: '6px',
            borderRadius: '4px',
            border: 'none',
            outline: 'none',
            fontSize: '1rem',
            backgroundColor: '#121212',
            color: '#fff',
          }}
        />
      </label>

      <div
        style={{
          maxHeight: '250px',
          overflowY: 'auto',
          marginBottom: '12px',
          border: '1px solid #333',
          borderRadius: '6px',
          padding: '8px',
          backgroundColor: '#121212',
        }}
      >
        {songs.length === 0 && <p>Carregando músicas...</p>}
        {songs.map((song) => (
          <label
            key={song.id}
            style={{
              display: 'block',
              padding: '6px',
              cursor: creating ? 'not-allowed' : 'pointer',
              color: selectedSongs.has(song.id) ? '#1db954' : '#fff',
            }}
          >
            <input
              type="checkbox"
              checked={selectedSongs.has(song.id)}
              onChange={() => toggleSongSelection(song.id)}
              disabled={creating}
              style={{ marginRight: '10px' }}
            />
            {song.titulo} - {song.artista}
          </label>
        ))}
      </div>

      {createError && (
        <p style={{ color: '#ff4d4d', marginBottom: '12px' }}>{createError}</p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          className="retry-btn"
          onClick={() => setShowCreateModal(false)}
          disabled={creating}
          style={{ backgroundColor: '#333', color: '#fff' }}
        >
          Cancelar
        </button>
        <button
          className="retry-btn"
          onClick={createPlaylist}
          disabled={creating}
        >
          {creating ? 'Criando...' : 'Criar'}
        </button>
      </div>
    </div>
  </div>
)}

        </div>
    );
}

export default PlaylistSongs;
