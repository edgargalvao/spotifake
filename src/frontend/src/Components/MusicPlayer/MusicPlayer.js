import React, { useRef, useState, useEffect } from 'react';

const MusicPlayer = ({ src, title, artist, onEnded, onNext, onPrevious, hasNext, hasPrevious }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const duration = audioRef.current?.duration || 0;
  const currentTime = audioRef.current?.currentTime || 0;
  console.log("Tocando src:", src);

  // Tocar automaticamente ao mudar a música
  useEffect(() => {
    if (audioRef.current && src) {
      audioRef.current.load();
      audioRef.current.play();
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  }, [src]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime / audioRef.current.duration || 0);
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current) return;
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * audioRef.current.duration;
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div className="bottom-bar-content" style={{
      display: "flex",
      alignItems: "center",
      width: "100%",
      maxWidth: "1100px",
      margin: "0 auto",
      padding: "0 12px",
      height: "100%",
      flexWrap: "wrap"
    }}>
      <img src="https://i.scdn.co/image/ab67616d0000b273b1e2e2e2e2e2e2e2e2e2e2" alt="Album" style={{ width: 48, height: 48, borderRadius: 6, marginRight: 12, objectFit: "cover", boxShadow: "0 2px 8px #0006" }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title || 'Selecione uma música'}</div>
        <div style={{ fontSize: 13, color: "#b3b3b3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{artist || ''}</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 16, marginRight: 16 }}>
        <button
          style={{ 
            background: "none", 
            border: "none", 
            color: hasPrevious ? "#fff" : "#666", 
            fontSize: 20, 
            cursor: hasPrevious ? "pointer" : "not-allowed" 
          }}
          title="Anterior"
          onClick={onPrevious}
          disabled={!hasPrevious}
        >⏮️</button>

        <button
          style={{ background: "none", border: "none", color: "#fff", fontSize: 28, cursor: "pointer" }}
          title="Play/Pause"
          onClick={handlePlayPause}
        >
          {playing ? '⏸️' : '▶️'}
        </button>

        <button
          style={{ 
            background: "none", 
            border: "none", 
            color: hasNext ? "#fff" : "#666", 
            fontSize: 20, 
            cursor: hasNext ? "pointer" : "not-allowed" 
          }}
          title="Próxima"
          onClick={onNext}
          disabled={!hasNext}
        >⏭️</button>
      </div>

      <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 8, minWidth: 120 }}>
        <span style={{ fontSize: 12, color: "#b3b3b3", minWidth: 32, textAlign: "right" }}>{formatTime(currentTime)}</span>
        <div style={{ background: "#404040", height: 4, borderRadius: 2, flex: 1, position: "relative", cursor: "pointer", minWidth: 60 }} onClick={handleProgressClick}>
          <div style={{ background: "#1db954", width: `${progress * 100}%`, height: 4, borderRadius: 2 }}></div>
        </div>
        <span style={{ fontSize: 12, color: "#b3b3b3", minWidth: 32 }}>{formatTime(duration)}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 16, minWidth: 90 }}>
        <span style={{ fontSize: 18 }}>🔊</span>
        <input type="range" min={0} max={1} step={0.01} value={volume} onChange={handleVolumeChange} style={{ width: 70, accentColor: "#1db954" }} />
      </div>

      <audio
        ref={audioRef}
        src={src || ''}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={onEnded} // ← chama ao finalizar música
        onLoadedMetadata={handleTimeUpdate}
      />
    </div>
  );
};

export default MusicPlayer;
