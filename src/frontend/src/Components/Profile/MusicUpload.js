import React, { useState, useRef } from 'react';
import { Upload, Music, X, Play, Pause, Check, AlertCircle } from 'lucide-react';
import './MusicUpload.css';

export default function MusicUpload() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const audioFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a|flac)$/i)
    );

    const newFiles = audioFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      status: 'ready', // ready, uploading, success, error
      progress: 0,
      url: URL.createObjectURL(file)
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    handleFileSelect(files);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
    
    if (currentPlaying === fileId) {
      setCurrentPlaying(null);
    }
  };

  const togglePlay = (fileId) => {
    if (currentPlaying === fileId) {
      setCurrentPlaying(null);
    } else {
      setCurrentPlaying(fileId);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const simulateUpload = (fileId) => {
    setUploadedFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, status: 'uploading', progress: 0 } : file
    ));

    const interval = setInterval(() => {
      setUploadedFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          const newProgress = Math.min(file.progress + Math.random() * 30, 100);
          if (newProgress >= 100) {
            clearInterval(interval);
            return { ...file, status: 'success', progress: 100 };
          }
          return { ...file, progress: newProgress };
        }
        return file;
      }));
    }, 500);
  };

  const uploadAll = () => {
    uploadedFiles.forEach(file => {
      if (file.status === 'ready') {
        simulateUpload(file.id);
      }
    });
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1 className="upload-title">Upload de Músicas</h1>
        <p className="upload-subtitle">Faça upload dos seus arquivos de áudio</p>

        {/* Área de Drop */}
        <div 
          className={`drop-zone ${isDragging ? 'drop-zone-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="drop-zone-content">
            <Upload className="drop-zone-icon" />
            <h3 className="drop-zone-title">
              {isDragging ? 'Solte os arquivos aqui' : 'Clique ou arraste arquivos'}
            </h3>
            <p className="drop-zone-text">
              Suporta MP3, WAV, OGG, M4A, FLAC
            </p>
            <button className="upload-button">
              Selecionar Arquivos
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
            onChange={handleFileInput}
            className="file-input"
          />
        </div>

        {/* Lista de Arquivos */}
        {uploadedFiles.length > 0 && (
          <div className="files-section">
            <div className="files-header">
              <h2 className="files-title">Arquivos Selecionados ({uploadedFiles.length})</h2>
              <button 
                className="upload-all-button"
                onClick={uploadAll}
                disabled={uploadedFiles.every(f => f.status !== 'ready')}
              >
                Upload de Todos
              </button>
            </div>

            <div className="files-list">
              {uploadedFiles.map(file => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <div className="file-icon">
                      <Music size={20} />
                    </div>
                    <div className="file-details">
                      <h4 className="file-name">{file.name}</h4>
                      <p className="file-size">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  <div className="file-actions">
                    {file.status === 'ready' && (
                      <>
                        <button
                          className="action-button play-button"
                          onClick={() => togglePlay(file.id)}
                        >
                          {currentPlaying === file.id ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button
                          className="action-button upload-single-button"
                          onClick={() => simulateUpload(file.id)}
                        >
                          Upload
                        </button>
                      </>
                    )}

                    {file.status === 'uploading' && (
                      <div className="upload-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{Math.round(file.progress)}%</span>
                      </div>
                    )}

                    {file.status === 'success' && (
                      <div className="upload-success">
                        <Check size={16} className="success-icon" />
                        <span>Enviado</span>
                      </div>
                    )}

                    {file.status === 'error' && (
                      <div className="upload-error">
                        <AlertCircle size={16} className="error-icon" />
                        <span>Erro</span>
                      </div>
                    )}

                    <button
                      className="action-button remove-button"
                      onClick={() => removeFile(file.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Player de áudio oculto */}
                  {currentPlaying === file.id && (
                    <audio
                      src={file.url}
                      controls
                      autoPlay
                      className="hidden-audio"
                      onEnded={() => setCurrentPlaying(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}