// Exemplo de como fazer a requisição no React
import React, { useState, useEffect } from 'react';

function PlaylistSongs({userId}) {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            setError('ID do usuário não fornecido');
            setLoading(false);
            return;
        }

        fetchPlaylists();
    }, [userId]);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Fazendo requisição para userId:', userId);
            
            // Fazendo a requisição com o userId como parâmetro
            const response = await fetch(`http://localhost:8000/api/playlists/?userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Para incluir cookies de sessão se necessário
            });

            console.log('Status da resposta:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro na resposta:', errorData);
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('Resposta completa da API:', data);
            
            // Com a nova estrutura de resposta
            if (data.success && data.playlists) {
                setPlaylists(data.playlists);
                console.log(`${data.count} playlists carregadas`);
            } else if (data.error) {
                throw new Error(data.error);
            } else {
                // Fallback para estrutura antiga
                setPlaylists(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Erro ao buscar playlists:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Carregando playlists...</div>;
    if (error) return <div>Erro: {error}</div>;

    return (
        <div>
            <h2>Suas Playlists ({playlists.length})</h2>
            {playlists.length === 0 ? (
                <p>Nenhuma playlist encontrada para este usuário.</p>
            ) : (
                <div>
                    {playlists.map(playlist => (
                        <div key={playlist.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                            <h3>{playlist.nome}</h3>
                            <p>Criado por: {playlist.usuario}</p>
                            <p>Músicas: {playlist.musicas ? playlist.musicas.length : 0}</p>
                            
                            {playlist.musicas && playlist.musicas.length > 0 && (
                                <div>
                                    <h4>Músicas:</h4>
                                    <ul>
                                        {playlist.musicas.map(musica => (
                                            <li key={musica.id}>
                                                {musica.titulo} - {musica.artista}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PlaylistSongs;