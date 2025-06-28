import React, { useState } from 'react';
import './Profile.css';
import MusicUpload from './MusicUpload';
import PlaylistSongs from '../Musicas/PlaylistSongs.js';

export default function MusicProfile() {
  const [showUploadModal, setShowUploadModal] = useState(false);

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
              <span className="avatar-initials">LM</span>
            </div>
          </div>
        </div>

        {/* Nome e Título */}
        <div className="profile-info">
          <h1 className="artist-name">Luna Morena</h1>
          <p className="artist-title">Artista Musical</p>
        </div>

        {/* Descrição */}
        <div className="profile-description">
          <h2 className="description-title">Sobre</h2>
          <div className="description-content">
            <p>
              Luna Morena é uma artista brasileira que conquistou o cenário musical com sua mistura única de pop eletrônico, 
              R&B e influências latinas...
            </p>
          </div>
        </div>

        {/* Botão que abre o modal */}
        <button className="open-upload-modal-button" onClick={() => setShowUploadModal(true)}>
          Upload de Músicas
        </button>
      </div>
      <PlaylistSongs  />
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
    </div>
  );
}
