import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import './style.css';

export default function ExchangeDetails() {
  const [exchangeId, setExchangeId] = useState('5'); // Ex: Binance
  const [exchangeInfo, setExchangeInfo] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchExchange = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`https://api.coinlore.net/api/exchange/?id=${id}`);
      if (!response.ok) throw new Error('Erro ao buscar dados da exchange');

      const data = await response.json();

      // 1. Extraindo as informações gerais (o nome e o site costumam ficar na primeira chave, ex: "0")
      // Buscamos a primeira propriedade que não seja "pairs"
      const infoKey = Object.keys(data).find(key => key !== 'pairs');
      if (infoKey && data[infoKey]) {
        setExchangeInfo(data[infoKey]);
      } else {
        setExchangeInfo(null);
      }

      // 2. Extraindo o array de pares de negociação
      if (data.pairs && Array.isArray(data.pairs)) {
        setPairs(data.pairs);
      } else {
        setPairs([]);
      }

    } catch (err) {
      setError(err.message);
      setExchangeInfo(null);
      setPairs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    if (!ignore) {
      fetchExchange(exchangeId);
    }
    return () => { ignore = true; };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchExchange(exchangeId);
  };

  const filteredPairs = pairs.filter((pair) => {
    const term = searchTerm.toLowerCase();
    const baseMatch = pair.base && pair.base.toLowerCase().includes(term);
    const quoteMatch = pair.quote && pair.quote.toLowerCase().includes(term);
    return baseMatch || quoteMatch;
  });
  return (
    <div className="crypto-container">
      <header className="crypto-header">
        <h1>🏢 Detalhes da Exchange & Pares</h1>
        <p>Consulte as informações e os pares de negociação ativos na corretora</p>
      </header>

      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" className="back-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
          ← Voltar para o Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="exchange-search-form">
        <div className="input-group">
          <label htmlFor="exchangeId">ID da Exchange:</label>
          <input
            id="exchangeId"
            type="number"
            min="0"
            value={exchangeId}
            onChange={(e) => setExchangeId(e.target.value)}
            placeholder="Ex: 5"
          />
          <button type="submit" className="search-btn">Buscar</button>
        </div>
      </form>

      {loading && <div className="loading">Carregando corretora...</div>}
      {error && <div className="error">⚠️ {error}</div>}

      {!loading && !error && exchangeInfo && (
        <>
          {/* Card com Informações Gerais */}
          <div className="exchange-card" style={{ marginBottom: '2rem' }}>
            <div className="exchange-card-header">
              <h2>{exchangeInfo.name}</h2>
              {exchangeInfo.url && (
                <a href={exchangeInfo.url} target="_blank" rel="noopener noreferrer" className="exchange-link">
                  Acessar Site ↗
                </a>
              )}
            </div>
          </div>

          {/* Tabela de Pares da Exchange */}
          <div className="table-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                <h3>Pares de Negociação Ativos</h3>
                {/* Input de Filtro */}
                <input
                    type="text"
                    placeholder="Filtrar par (ex: BTC, USDT)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #334155',
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    width: '220px'
                    }}
                />
            </div>
            <table className="crypto-table">
              <thead>
                <tr>
                  <th>Par</th>
                  <th>Preço (USD)</th>
                  <th>Volume (24h)</th>
                </tr>
              </thead>
              <tbody>
                {filteredPairs.length > 0 ? (
                  filteredPairs.map((pair, index) => (
                    <tr key={index}>
                      <td>
                        <span className="badge">
                          {pair.base} / {pair.quote || 'N/A'}
                        </span>
                      </td>
                      <td>${parseFloat(pair.price_usd || 0).toLocaleString()}</td>
                      <td>${parseFloat(pair.volume || 0).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>Nenhum par encontrado com "{searchTerm}".</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}