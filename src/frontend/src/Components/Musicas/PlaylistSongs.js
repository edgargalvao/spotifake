import React, { useState, useEffect } from 'react';
import './PlaylistSongs.css';
import PlaylistModal from './PlaylistModal';

function PlaylistSongs({ userId, onSelectSong, onPlayPlaylist  }) {
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
    const [isEditing, setIsEditing] = useState(false);
    const [editingPlaylistId, setEditingPlaylistId] = useState(null);

    const openEditModal = async (playlist) => {
        setIsEditing(true);
        setEditingPlaylistId(playlist.id);
        setNewPlaylistName(playlist.nome);
        setSelectedSongs(new Set(playlist.musicas.map(m => m.id)));
        setShowCreateModal(true);
        await loadSongs();
    };

    const openCreateModal = async () => {
        setIsEditing(false);
        setEditingPlaylistId(null);
        setNewPlaylistName('');
        setSelectedSongs(new Set());
        setShowCreateModal(true);
        await loadSongs();
    };

    const loadSongs = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/songs/');
            if (!res.ok) throw new Error('Erro ao carregar músicas');
            const data = await res.json();
            setSongs(data);
        } catch (err) {
            alert('Erro ao carregar músicas: ' + err.message);
        }
    };

    const toggleSongSelection = (songId) => {
        const newSet = new Set(selectedSongs);
        newSet.has(songId) ? newSet.delete(songId) : newSet.add(songId);
        setSelectedSongs(newSet);
    };

    const submitPlaylist = async () => {
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

        const payload = {
            name: newPlaylistName,
            user_id: userId,
            song_ids: Array.from(selectedSongs)
        };

        try {
            const url = isEditing
                ? `http://localhost:8000/api/playlists/${editingPlaylistId}/update/`
                : 'http://localhost:8000/api/playlists/create/';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Erro ao salvar playlist');
            }

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
                headers: { 'Content-Type': 'application/json' },
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
                fetchPlaylists();
            } else {
                const data = await response.json();
                alert("Erro: " + (data.error || "Erro ao excluir playlist."));
            }
        } catch (error) {
            alert("Erro ao conectar com o servidor.");
            console.error(error);
        }
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

    return (
        <div className="playlist-container">
            <h2 className="playlist-title">Suas Playlists ({playlists.length})</h2>
            <button className="retry-btn" onClick={openCreateModal}>+ Criar Playlist</button><br /><br /><br />
            {playlists.length === 0 ? (
                <p className="empty-message">🎵 Nenhuma playlist encontrada.</p>
            ) : (
                <div className="playlist-list">
                    {playlists.map(playlist => (
                        <div key={playlist.id} className="playlist-item">
                            <div className="playlist-header" onClick={() => togglePlaylist(playlist.id)}>
                                <div className="playlist-info-main">
                                    <div className="playlist-name">{playlist.nome}</div>
                                    <div className="playlist-description">{playlist.musicas?.length || 0} músicas</div>
                                </div>
                                <div className="playlist-actions">
                                     {/* Botão Tocar Tudo */}
                                    <button onClick={(e) => 
                                    {
                                        e.stopPropagation();
                                        if (playlist.musicas && playlist.musicas.length > 0) {
                                            onPlayPlaylist(playlist.musicas);
                                        } else {
                                            alert('Playlist vazia!');
                                        }
                                        }}
                                        title="Tocar toda a playlist"
                                    >
                                        ▶️
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); openEditModal(playlist); }}>✏️</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(playlist.id); }}>🗑️</button>
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

<PlaylistModal
  isOpen={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  isEditing={isEditing}
  playlistName={newPlaylistName}
  setPlaylistName={setNewPlaylistName}
  songs={songs}
  selectedSongs={selectedSongs}
  toggleSongSelection={toggleSongSelection}
  onSubmit={submitPlaylist}
  creating={creating}
  createError={createError}
/>
        </div>
    );
}

export default PlaylistSongs;
