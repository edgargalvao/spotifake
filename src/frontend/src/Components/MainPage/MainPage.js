import React, { useEffect, useState } from 'react';
import Profile from '../Profile/Profile';
import MusicPlayer from '../MusicPlayer/MusicPlayer';
import Feed from '../Feed/Feed';

const MainPage = () => {
  const [user, setUser] = useState(null);

  // Fila de músicas da playlist
  const [playlistQueue, setPlaylistQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [currentSong, setCurrentSong] = useState(null);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentArtist, setCurrentArtist] = useState('');

  // Quando muda a música da fila, atualiza o player
  useEffect(() => {
    if (playlistQueue.length > 0 && currentIndex < playlistQueue.length) {
      const song = playlistQueue[currentIndex];
      const audioUrl = song.arquivo_audio.startsWith('http')
        ? song.arquivo_audio
        : `http://localhost:8000${song.arquivo_audio}`;
      setCurrentSong(audioUrl);
      setCurrentTitle(song.titulo);
      setCurrentArtist(song.artista);
    } else {
      setCurrentSong(null);
      setCurrentTitle('');
      setCurrentArtist('');
      setPlaylistQueue([]);
      setCurrentIndex(0);
    }
  }, [playlistQueue, currentIndex]);

  // Função para tocar toda a playlist
  const handlePlayPlaylist = (musicas) => {
    setPlaylistQueue(musicas);
    setCurrentIndex(0);
  };

  // Avança para próxima música da fila quando atual acabar
  const handleSongEnded = () => {
    if (currentIndex + 1 < playlistQueue.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setPlaylistQueue([]);
      setCurrentIndex(0);
      setCurrentSong(null);
      setCurrentTitle('');
      setCurrentArtist('');
    }
  };

  // Tocar música avulsa (clicada individualmente)
  const handleSelectSong = (audioUrl, title, artist) => {
    setPlaylistQueue([]);
    setCurrentIndex(0);
    setCurrentSong(audioUrl);
    setCurrentTitle(title);
    setCurrentArtist(artist);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-content">
          <h3>Menu</h3>
          {user && <p>Bem-vindo, {user.username}!</p>}
          {/* Passe handleSelectSong para o Profile */}
          <Profile
            user={user}
            onSelectSong={handleSelectSong}
            onPlayPlaylist={handlePlayPlaylist} // Passa para o Profile
          />
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
        <MusicPlayer
  src={currentSong}
  title={currentTitle}
  artist={currentArtist}
  onEnded={handleSongEnded}   // toca a próxima automaticamente
  onNext={handleSongEnded}    // botão "⏭️" também avança
/>
        </footer>
    </div>
  );
};


export default MainPage;