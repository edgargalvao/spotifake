import React, { useState } from 'react';
import './Profile.css';
import MusicUpload from './MusicUpload';
import PlaylistSongs from '../Musicas/PlaylistSongs.js';
import SongList from '../Musicas/SongList';
import MusicPlayer from '../MusicPlayer/MusicPlayer';

export default function MusicProfile({ user, onSelectSong }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentArtist, setCurrentArtist] = useState('');

  const handleSelectSong = (audioUrl, title, artist) => {
    setCurrentSong(audioUrl);
    setCurrentTitle(title);
    setCurrentArtist(artist);
    if (onSelectSong) {
      onSelectSong(audioUrl, title, artist);
    }
  };

  return (
    <div className="profile-page">
      {/* Foto de Capa */}
      <div className="cover-photo">
        <div className="cover-overlay"></div>
      </div>

      {/* Container do Perfil */}
      <div className="profile-container">
        {/* Foto de Perfil */}
        <div className="profile-picture-wrapper">
          <div className="profile-picture">
            <div className="profile-avatar">
              <span className="avatar-initials">{user && user.username ? user.username.charAt(0).toUpperCase() : ''}</span>
            </div>
          </div>
        </div>

        {/* Nome e Título */}
        <div className="profile-info">
          <h1 className="artist-name">{user ? user.username : 'Carregando...'}</h1>
          <p className="artist-title">Artista Musical</p>
        </div>

        {/* Descrição */}
        {/* <div className="profile-description">
          <h2 className="description-title">Sobre</h2>
          <div className="description-content">
            <p>
              Luna Morena é uma artista brasileira que conquistou o cenário musical com sua mistura única de pop eletrônico, 
              R&B e influências latinas...
            </p>
          </div>
        </div> */}

        {/* Botão que abre o modal */}
        <button className="open-upload-modal-button" onClick={() => setShowUploadModal(true)}>
          Upload de Músicas
        </button>
      </div>
      <PlaylistSongs  />
      {/* Lista de músicas */}
      <SongList onSelect={handleSelectSong} />
      {/* Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal-button" onClick={() => setShowUploadModal(false)}>
              ✖
            </button>
            <MusicUpload />
          </div>
        </div>
      )}
      {/* Player fixo na página do perfil */}
      {/* <div style={{ marginTop: 32 }}>
        <MusicPlayer src={currentSong} title={currentTitle} artist={currentArtist} />
      </div> */}
    </div>
  );
}
