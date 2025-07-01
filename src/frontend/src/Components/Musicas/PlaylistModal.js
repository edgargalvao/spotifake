import React from 'react';

export default function PlaylistModal({
  isOpen,
  onClose,
  isEditing,
  playlistName,
  setPlaylistName,
  songs,
  selectedSongs,
  toggleSongSelection,
  onSubmit,
  creating,
  createError
}) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={() => !creating && onClose()}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#181818',
          padding: '24px',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '480px',
          color: '#fff',
          boxShadow: '0 0 20px #1db954',
        }}
      >
        <h3>{isEditing ? 'Editar Playlist' : 'Criar Nova Playlist'}</h3>
        <label>
          Nome da Playlist:
          <input
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            disabled={creating}
            style={{
              width: '100%',
              marginTop: '8px',
              marginBottom: '16px',
              padding: '8px',
              borderRadius: '4px',
              border: 'none',
              outline: 'none',
            }}
          />
        </label>
        <div
          className="song-selection"
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            marginBottom: '16px',
          }}
        >
          {songs.length === 0 && <p>Carregando músicas...</p>}
          {songs.map((song) => (
            <label
              key={song.id}
              style={{
                display: 'block',
                marginBottom: '8px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={selectedSongs.has(song.id)}
                onChange={() => toggleSongSelection(song.id)}
                disabled={creating}
                style={{ marginRight: '8px' }}
              />
              {song.titulo} - {song.artista}
            </label>
          ))}
        </div>
        {createError && (
          <p style={{ color: 'red', marginBottom: '12px' }}>{createError}</p>
        )}
        <div className="modal-actions" style={{ textAlign: 'right' }}>
          <button
            onClick={onClose}
            disabled={creating}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #fff',
              borderRadius: '4px',
              color: '#fff',
              padding: '8px 16px',
              marginRight: '8px',
              cursor: creating ? 'not-allowed' : 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={creating}
            style={{
              backgroundColor: '#1db954',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              padding: '8px 16px',
              cursor: creating ? 'not-allowed' : 'pointer',
            }}
          >
            {creating ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
}
