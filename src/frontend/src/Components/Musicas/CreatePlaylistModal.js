import React, { useState, useEffect } from 'react';
import './CreatePlaylistModal.css';

function CreatePlaylistModal({ userId, onClose, onPlaylistCreated }) {
    const [songs, setSongs] = useState([]);
    const [selectedSongs, setSelectedSongs] = useState([]);
    const [playlistName, setPlaylistName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/songs/')
            .then(res => res.json())
            .then(data => {
                setSongs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro ao buscar músicas:", err);
                setLoading(false);
            });
    }, []);

    const toggleSong = (songId) => {
        setSelectedSongs(prev =>
            prev.includes(songId)
                ? prev.filter(id => id !== songId)
                : [...prev, songId]
        );
    };

    const handleCreate = async () => {
        if (!playlistName.trim() || selectedSongs.length === 0) return;

        const response = await fetch('http://localhost:8000/api/playlists/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: playlistName,
                user_id: userId,
                song_ids: selectedSongs
            })
        });

        if (response.ok) {
            onPlaylistCreated(); // Atualiza lista principal
            onClose(); // Fecha modal
        } else {
            console.error('Erro ao criar playlist');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Criar Nova Playlist</h2>
                <input
                    type="text"
                    placeholder="Nome da playlist"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                />
                {loading ? <p>Carregando músicas...</p> : (
                    <div className="song-list">
                        {songs.map(song => (
                            <label key={song.id} className="song-item">
                                <input
                                    type="checkbox"
                                    checked={selectedSongs.includes(song.id)}
                                    onChange={() => toggleSong(song.id)}
                                />
                                {song.title} - {song.artist}
                            </label>
                        ))}
                    </div>
                )}
                <div className="modal-actions">
                    <button onClick={onClose}>Cancelar</button>
                    <button onClick={handleCreate}>Criar</button>
                </div>
            </div>
        </div>
    );
}

export default CreatePlaylistModal;
