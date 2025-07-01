import React, { useState, useRef } from 'react';
import { Upload, Music, X, Play, Pause, Check, AlertCircle } from 'lucide-react';
import './MusicUpload.css';

export default function MusicUpload({ onClose }) {
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
      status: 'ready',
      progress: 0,
      url: URL.createObjectURL(file),
      // Novos campos para metadados
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: '',
      album: '',
      genre: ''
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

  // Função para enviar um arquivo para o backend
  const uploadFileToBackend = async (fileObj) => {
    const formData = new FormData();
    // Use os nomes em português conforme o serializer espera
    formData.append('titulo', fileObj.title);
    formData.append('artista', fileObj.artist);
    formData.append('album', fileObj.album);
    formData.append('genero', fileObj.genre);
    formData.append('arquivo_audio', fileObj.file);
    // Se quiser permitir imagem de capa, adicione: formData.append('imagem_capa', ...)

    try {
      const response = await fetch('http://localhost:8000/api/song-upload/', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (err) {
      return { success: false };
    }
  };

  // Substitui simulateUpload para upload real
  const simulateUpload = async (fileId) => {
    const fileObj = uploadedFiles.find(f => f.id === fileId);
    // Só faz upload se todos os campos estiverem preenchidos
    if (!fileObj.title || !fileObj.artist || !fileObj.album || !fileObj.genre) {
      setUploadedFiles(prev => prev.map(file =>
        file.id === fileId ? { ...file, status: 'error', progress: 0 } : file
      ));
      return;
    }
    setUploadedFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, status: 'uploading', progress: 0 } : file
    ));

    // Simula progresso
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 40;
      setUploadedFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          return { ...file, progress: Math.min(progress, 95) };
        }
        return file;
      }));
    }, 300);

    // Faz upload real
    const result = await uploadFileToBackend(fileObj);
    clearInterval(interval);
    setUploadedFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        if (result.success) {
          return { ...file, status: 'success', progress: 100 };
        } else {
          return { ...file, status: 'error', progress: 0 };
        }
      }
      return file;
    }));
  };

  // Substitui uploadAll para upload real
  const uploadAll = () => {
    uploadedFiles.forEach(file => {
      if (file.status === 'ready') {
        simulateUpload(file.id);
      }
    });
  };

  // Adiciona função para atualizar metadados
  const updateFileMeta = (fileId, field, value) => {
    setUploadedFiles(prev => prev.map(file =>
      file.id === fileId ? { ...file, [field]: value } : file
    ));
  };

  // Função para fechar o upload
  const handleClose = () => {
    // Limpa URLs dos arquivos para evitar vazamento de memória
    uploadedFiles.forEach(file => {
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
    });
    
    // Chama a função onClose se foi fornecida
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <div className="upload-header">
          <div>
            <h1 className="upload-title">Upload de Músicas</h1>
            <p className="upload-subtitle">Faça upload dos seus arquivos de áudio</p>
          </div>
          <button 
            className="close-button"
            onClick={handleClose}
            title="Fechar"
          >
            <X size={24} />
          </button>
        </div>

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
                      {/* Inputs para metadados */}
                      <input type="text" placeholder="Título" value={file.title} onChange={e => updateFileMeta(file.id, 'title', e.target.value)} className="meta-input" />
                      <input type="text" placeholder="Artista" value={file.artist} onChange={e => updateFileMeta(file.id, 'artist', e.target.value)} className="meta-input" />
                      <input type="text" placeholder="Álbum" value={file.album} onChange={e => updateFileMeta(file.id, 'album', e.target.value)} className="meta-input" />
                      <input type="text" placeholder="Gênero" value={file.genre} onChange={e => updateFileMeta(file.id, 'genre', e.target.value)} className="meta-input" />
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