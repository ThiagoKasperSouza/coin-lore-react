import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router'; // Importando do React Router unificado
import './style.css'; // Opcional para estilizar

export default function CoinMarkets() {
  // Se você usar rota dinâmica (/markets/:id), o useParams pega o ID da URL
  const { id } = useParams();
  
  // Ou caso queira um input manual para digitar o ID (1 a 100)
  const [coinId, setCoinId] = useState(id || '90'); // Default Bitcoin (ID 90)
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para buscar os mercados da moeda escolhida
  const fetchMarkets = async (targetId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://api.coinlore.net/api/coin/markets/?id=${targetId}`);
      
      if (!response.ok) {
        throw new Error('Não foi possível carregar os mercados desta moeda.');
      }
      
      const data = await response.json();
      
      // A API de markets retorna um array direto ou um objeto com os dados
      if(data) {
        if (Array.isArray(data)) {
            setMarkets(data);
        } else if (data && typeof data === 'object') {
            const parsed = Object.values(data);
            setMarkets(Array.isArray(parsed) ? parsed : []);
        } else {
            setMarkets([]);
        }
      }
     
    } catch (err) {
      setError("Mercados não encontrados ou erro na API.");
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  };

  // Dispara a busca sempre que o coinId mudar ou ao carregar a página
  useEffect(() => {
    let ignore = false;
    if (coinId && !ignore) {
      fetchMarkets(coinId);
    }
    return () => { ignore = true; };
  }, [coinId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMarkets(coinId);
  };

  return (
    <div className="crypto-container">
      <header className="crypto-header">
        <h1>📊 Mercados por Criptomoeda</h1>
        <p>Consulte as corretoras e pares de negociação</p>
      </header>

      {/* Navegação de volta */}
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" className="back-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
          ← Voltar para o Dashboard
        </Link>
      </div>

      {/* Formulário para buscar por ID/Rank */}
      <form onSubmit={handleSearchSubmit} className="search-form" style={{ marginBottom: '1.5rem' }}>
        <label style={{ marginRight: '10px', color: '#cbd5e1' }}>Digite o ID da Moeda:</label>
        <input 
          type="number" 
          value={coinId} 
          onChange={(e) => setCoinId(e.target.value)}
          placeholder="Ex: 90 (Bitcoin)"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #334155', background: '#1e293b', color: '#fff', marginRight: '10px' }}
        />
        <button type="submit" className="back-btn" style={{ padding: '8px 12px' }}>Buscar</button>
      </form>

      {loading && <div className="loading">Carregando mercados...</div>}
      {error && <div className="error">Erro: {error}</div>}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="crypto-table">
            <thead>
              <tr>
                <th>Corretora (Exchange)</th>
                <th>Par (Pair)</th>
                <th>Preço (USD)</th>
                <th>Volume (24h)</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(markets) && markets.length > 0 ? (
                markets.map((market, index) => (
                  <tr key={index}>
                    <td><strong>{market.name}</strong></td>
                    <td><span className="badge">{market.base}/{market.quote}</span></td>
                    <td>${parseFloat(market.price_usd || 0).toLocaleString()}</td>
                    <td>${parseFloat(market.volume_usd || 0).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>Nenhum mercado encontrado para este ID.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}