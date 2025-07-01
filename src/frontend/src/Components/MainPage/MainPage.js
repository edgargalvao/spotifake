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
  const [isIndividualSong, setIsIndividualSong] = useState(false);

  useEffect(() => {
    // Se é uma música individual, não mexe na fila de playlist
    if (isIndividualSong) return; 
  
    // Se há músicas na fila e o índice atual é válido
    if (playlistQueue.length > 0 && currentIndex < playlistQueue.length) {
      const song = playlistQueue[currentIndex];
      setCurrentSong(song.src);
      setCurrentTitle(song.title);
      setCurrentArtist(song.artist);
    } else if (playlistQueue.length === 0) {
      // Se a fila está vazia, limpa o player
      setCurrentSong(null);
      setCurrentTitle('');
      setCurrentArtist('');
      setCurrentIndex(0);
    }
  }, [playlistQueue, currentIndex, isIndividualSong]);
  

  const handlePlayPlaylist = (songs) => {
    if (!Array.isArray(songs) || songs.length === 0) return;
  
    const formatted = songs.map(song => ({
      src: song.arquivo_audio.startsWith('http')
        ? song.arquivo_audio
        : `http://localhost:8000${song.arquivo_audio}`,
      title: song.titulo,
      artist: song.artista
    }));
  
    setIsIndividualSong(false);   // <-- é uma playlist agora
    setPlaylistQueue(formatted);
    setCurrentIndex(0);
    
    // Força a reprodução da primeira música da playlist imediatamente
    if (formatted.length > 0) {
      const firstSong = formatted[0];
      setCurrentSong(firstSong.src);
      setCurrentTitle(firstSong.title);
      setCurrentArtist(firstSong.artist);
    }
  };

  // Avança para próxima música da fila quando atual acabar
  const handleSongEnded = () => {
    // Se não está tocando uma playlist, não faz nada
    if (isIndividualSong) return;
    
    if (currentIndex + 1 < playlistQueue.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Fim da playlist - para e limpa
      setPlaylistQueue([]);
      setCurrentIndex(0);
      setCurrentSong(null);
      setCurrentTitle('');
      setCurrentArtist('');
    }
  };

  // Função para avançar manualmente (botão próxima)
  const handleNextSong = () => {
    // Se não está tocando uma playlist, não faz nada
    if (isIndividualSong) return;
    
    // Só avança se há uma próxima música
    if (currentIndex + 1 < playlistQueue.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Função para voltar música anterior
  const handlePreviousSong = () => {
    // Se não está tocando uma playlist, não faz nada
    if (isIndividualSong) return;
    
    // Só volta se há uma música anterior
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Verifica se há próxima música disponível
  const hasNextSong = !isIndividualSong && currentIndex + 1 < playlistQueue.length;
  
  // Verifica se há música anterior disponível
  const hasPreviousSong = !isIndividualSong && currentIndex > 0;

  const handleSelectSong = (audioUrl, title, artist) => {
    setIsIndividualSong(true); 
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
          <Profile
            user={user}
            onSelectSong={handleSelectSong}
            onPlayPlaylist={handlePlayPlaylist} 
          />
        </div>
        
      </aside>

      <main className="main-content">
        <div className="content-area">
          <Feed onPlayPlaylist={handlePlayPlaylist} />
        </div>
      </main>

      <footer className="bottom-bar">
        {/* Passe as props para o player global */}
        <MusicPlayer
            src={currentSong}
            title={currentTitle}
            artist={currentArtist}
            onEnded={handleSongEnded}   // toca a próxima automaticamente
            onNext={handleNextSong}     // botão "⏭️" avança manualmente
            onPrevious={handlePreviousSong} // botão "⏮️" volta música anterior
            hasNext={hasNextSong}       // indica se há próxima música
            hasPrevious={hasPreviousSong} // indica se há música anterior
          />
        </footer>
    </div>
  );
};


export default MainPage;