import React, { useState } from 'react';
import './Feed.css';

const Feed = () => {
  const [activeTab, setActiveTab] = useState('playlists');

  return (
    <div className="feed-page">
      <div className="feed-header">
        <button
          className={`feed-tab ${activeTab === 'playlists' ? 'active' : ''}`}
          onClick={() => setActiveTab('playlists')}
        >
          Playlists
        </button>
        <button
          className={`feed-tab ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          Seguindo
        </button>
      </div>

      <div className="feed-content">
        {activeTab === 'playlists' ? (
          <div className="feed-section">
            {/* Placeholder de conteúdo de playlists */}
            <div className="feed-card">Playlist 1</div>
            <div className="feed-card">Playlist 2</div>
            <div className="feed-card">Playlist 3</div>
          </div>
        ) : (
          <div className="feed-section">
            {/* Placeholder de conteúdo de usuários seguidos */}
            <div className="feed-card">Artista 1</div>
            <div className="feed-card">Artista 2</div>
            <div className="feed-card">Artista 3</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
