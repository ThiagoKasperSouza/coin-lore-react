import "./style.css"
import {  Link } from 'react-router';
import Chart from 'react-apexcharts'; // Importando o ApexCharts
import React, { useState, useEffect } from 'react';

export default function Home() {
    const [cryptos, setCryptos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para controlar a moeda selecionada e os dados OHLCV
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [ohlcvData, setOhlcvData] = useState([]);
  const [loadingOhlcv, setLoadingOhlcv] = useState(false);

    async function fetchData() {
        // 2. Aguardamos a resposta do fetch
        const response = await fetch('https://api.coinlore.net/api/tickers/');
        // 3. Verificamos se a resposta foi bem-sucedida
        if (!response.ok) {
          throw new Error('Falha ao carregar os dados da API');
        }
        // 4. Aguardamos a conversão dos dados para JSON
        return await response.json();
    }
    // Função para buscar os dados na API da CoinLore
    useEffect(() => {
        let ignore = false;
        async function getData() {
            try {
                const response = await fetchData();
                if(!ignore && response.data) {
                    setCryptos(response.data);
                    setLoading(false);
                }
            } catch(error) {
                console.error(error);
            }
           
        }

        getData();
        
        return () => {
            ignore=true;
        }
    },[]);

    // 2. Busca o OHLCV sempre que uma moeda for selecionada
    useEffect(() => {
        if (!selectedCoin) return;
        let ignore =false;

        async function fetchOhlcv() {
        try {
            setLoadingOhlcv(true);
            const response = await fetch(`https://api.coinlore.net/api/coin/ohlcv/?coin=${selectedCoin.id}`);
            if (!response.ok) throw new Error('Falha ao carregar dados OHLCV');
            const data = await response.json();

            console.log("ESTRUTURA DA API OHLCV:", data);
            
            // TRATAMENTO DE SEGURANÇA:
            // Se a API retornar um objeto encapsulado ou precisar de conversão, tratamos aqui.
            // Se o dado já for um array, mantemos. Se for um objeto, transformamos em array com Object.values(data)
            if(!ignore) {
                if (Array.isArray(data)) {
                    setOhlcvData(data);
                } else if (data && typeof data === 'object') {
                    // Caso a API retorne um objeto estruturado (ex: { ohlcv: [...] } ou chaves por dias)
                    const parsedData = data.ohlcv || Object.values(data);
                    setOhlcvData(Array.isArray(parsedData) ? parsedData : []);
                } else {
                    setOhlcvData([]);
                }
            }
            

        } catch (err) {
            console.error(err);
            setOhlcvData([]); // Em caso de erro, zera para evitar quebra no map
        } finally {
            setLoadingOhlcv(false);
        }
        }

        fetchOhlcv();
        return () => {
            ignore = true;
        }
    }, [selectedCoin]);

    if (loading) return <div className="loading">Carregando criptomoedas...</div>;
    if (error) return <div className="error">Erro: {error}</div>;

    // Transforma o estado ohlcvData em um array compatível com o ApexCharts
    const chartSeries = [
        {
        data: ohlcvData && typeof ohlcvData === 'object'
            ? Object.values(ohlcvData).map((item) => {
                // item é o array: [timestamp, open, high, low, close, volume]
                return {
                x: new Date(item[0] * 1000), // Índice 0: Timestamp
                y: [
                    parseFloat(item[1]), // Índice 1: Open
                    parseFloat(item[2]), // Índice 2: High
                    parseFloat(item[3]), // Índice 3: Low
                    parseFloat(item[4]), // Índice 4: Close
                ],
                };
            })
            : [],
        },
    ];
    // Configurações visuais do gráfico (Tema escuro para combinar com o dashboard)
    const chartOptions = {
        chart: {
        type: 'candlestick',
        height: 350,
        background: 'transparent',
        },
        title: {
        text: `Gráfico de Velas (OHLCV) - ${selectedCoin?.name || ''}`,
        align: 'left',
        style: { color: '#38bdf8' },
        },
        xaxis: {
        type: 'datetime',
        labels: { style: { colors: '#94a3b8' } },
        },
        yaxis: {
        tooltip: { enabled: true },
        labels: { style: { colors: '#94a3b8' } },
        },
        grid: {
        borderColor: '#1e293b',
        },
        theme: {
        mode: 'dark',
        },
    };

    return <>
    <div className="crypto-container">
      <header className="crypto-header">
        <h1>🚀 Dashboard Cripto & Candlestick</h1>
        <p>Clique em qualquer moeda para visualizar o gráfico de velas histórico</p>
      </header>

      {selectedCoin ? (
        <div className="ohlcv-view">
          <button className="back-btn" onClick={() => setSelectedCoin(null)}>
            ← Voltar para a Tabela
          </button>

          {loadingOhlcv ? (
            <p className="loading">Gerando gráfico de velas...</p>
          ) : (
            <div className="chart-wrapper" style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
              {chartSeries[0].data.length > 0 ? (
                <Chart
                  options={chartOptions}
                  series={chartSeries}
                  type="candlestick"
                  height={400}
                />
              ) : (
                <p className="loading">Não há dados suficientes para exibir o gráfico.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="crypto-table clickable-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Moeda</th>
                <th>Símbolo</th>
                <th>Preço (USD)</th>
                <th>Mudança 24h</th>
              </tr>
            </thead>
            <tbody>
              {cryptos.map((coin) => {
                const isPositive = parseFloat(coin.percent_change_24h) >= 0;
                return (
                  <tr 
                    key={coin.id} 
                    onClick={() => setSelectedCoin(coin)}
                    title="Clique para ver o Gráfico de Velas"
                  >
                    <td>{coin.rank}</td>
                    <td className="coin-name"><strong>{coin.name}</strong></td>
                    <td><span className="badge">{coin.symbol}</span></td>
                    <td>${parseFloat(coin.price_usd).toLocaleString()}</td>
                    <td className={isPositive ? 'positive' : 'negative'}>
                      {isPositive ? '▲' : '▼'} {coin.percent_change_24h}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
}