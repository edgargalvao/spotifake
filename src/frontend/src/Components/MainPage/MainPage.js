import React, { useRef, useState, useEffect } from 'react';

import Profile from '../Profile/Profile';
import MusicPlayer from '../MusicPlayer/MusicPlayer';
import Feed from '../Feed/Feed';

const MainPage = () => {
  const [user, setUser] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentArtist, setCurrentArtist] = useState('');

  // Função para tocar música globalmente
  const handleSelectSong = (audioUrl, title, artist) => {
    setCurrentSong(audioUrl);
    setCurrentTitle(title);
    setCurrentArtist(artist);
  };

  // Modificação: Puxe os dados do usuário do localStorage quando o componente montar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []); // O array vazio [] garante que isso rode apenas uma vez


  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-content">
          <h3>Menu</h3>
          {user && <p>Bem-vindo, {user.username}!</p>}
          {/* Passe handleSelectSong para o Profile */}
          <Profile user={user} onSelectSong={handleSelectSong} />
        </div>
        
      </aside>

      <main className="main-content">
        <div className="content-area">
          {/* Passe o usuário como prop para outros componentes */}
          <Feed  />
        </div>
      </main>

      <footer className="bottom-bar" style={{
        width: "100%",
        background: "#181818",
        color: "#fff",
        left: 0,
        bottom: 0,
        height: "80px",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.3)",
        zIndex: 100
      }}>
        {/* Passe as props para o player global */}
        <MusicPlayer src={currentSong} title={currentTitle} artist={currentArtist} />
      </footer>
    </div>
  );
};


export default MainPage;