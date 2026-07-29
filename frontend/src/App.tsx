import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './App.css';

interface StockAnalysis {
  ticker: string;
  prices: { date: string; close: number }[];
  earnings: { fiscalDateEnding: string; reportedEPS: number }[];
}

function App() {
  const [data, setData] = useState<StockAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [currentTicker, setCurrentTicker] = useState('AAPL');

  const fetchData = (tickerToFetch: string) => {
    setLoading(true);
    setError(null);

    axios.get(`http://localhost:8080/api/company/${tickerToFetch}/analysis`)
      .then(res => {
        if (res.data && res.data.prices) {
          setData(res.data);
        } else {
          setError("API-gräns nådd eller felaktigt svar från servern. Försök igen om en minut.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Fel vid hämtning:", err);
        setError(`Kunde inte hämta data för ${tickerToFetch}. Kontrollera din Spring Boot-konsol.`);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(currentTicker);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim() !== '') {
      const upperTicker = searchInput.toUpperCase();
      setCurrentTicker(upperTicker);
      fetchData(upperTicker);
      setSearchInput('');
    }
  };

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data.prices)) return [];

    const sortedPrices = [...data.prices].sort((a, b) => a.date.localeCompare(b.date));
    const sortedEarnings = data.earnings && Array.isArray(data.earnings)
        ? [...data.earnings].sort((a, b) => a.fiscalDateEnding.localeCompare(b.fiscalDateEnding))
        : [];

    let lastReportedQuarterDate = '';

    return sortedPrices.map(priceObj => {
      const pastEarnings = sortedEarnings.filter(e => e.fiscalDateEnding <= priceObj.date);
      const latestEarning = pastEarnings.length > 0 ? pastEarnings[pastEarnings.length - 1] : null;

      let epsValue = null;

      if (latestEarning && latestEarning.fiscalDateEnding !== lastReportedQuarterDate) {
        epsValue = latestEarning.reportedEPS;
        lastReportedQuarterDate = latestEarning.fiscalDateEnding;
      }

      return {
        date: priceObj.date,
        price: priceObj.close,
        eps: epsValue,
      };
    });
  }, [data]);

  return (
    <div style={{ padding: '40px', backgroundColor: '#1e1e24', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>

      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem' }}>{data?.ticker || currentTicker}</h1>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Sök ticker (t.ex. NFLX)"
            style={{
              padding: '10px 15px',
              borderRadius: '5px',
              border: '1px solid #444',
              backgroundColor: '#2b2b36',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: '#fff',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Sök
          </button>
        </form>
      </div>

      {!loading && !error && (!data?.earnings || data.earnings.length === 0) && data && (
        <div style={{ padding: '15px', backgroundColor: '#ffcc00', color: '#000', marginBottom: '20px', borderRadius: '5px' }}>
          <strong>Obs!</strong> Kvartalsvis vinstdata saknas för denna period. Visar endast prisutveckling.
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px', backgroundColor: '#2b2b36', borderRadius: '10px' }}>
          <h2 style={{ color: '#a0a0a0' }}>Hämtar data för {currentTicker}...</h2>
        </div>
      )}

      {error && !loading && (
        <div style={{ padding: '20px', backgroundColor: '#4a1c1c', border: '1px solid #ff4d4d', color: '#ff4d4d', borderRadius: '10px' }}>
          <strong>Ett fel uppstod:</strong> {error}
        </div>
      )}

      {!loading && !error && chartData.length > 0 && (
        <div style={{ height: '500px', width: '100%', backgroundColor: '#2b2b36', padding: '20px', borderRadius: '10px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#888"
                tick={{ fill: '#888' }}
                minTickGap={60}
              />

              <YAxis
                yAxisId="left"
                stroke="#3b82f6"
                tick={{ fill: '#3b82f6' }}
                domain={[0, 'auto']}
                allowDataOverflow={true} // Tvingar klippning vid 0
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                tick={{ fill: '#10b981' }}
                domain={[0, 'auto']}
                allowDataOverflow={true} // Tvingar klippning vid 0 även om det finns historiska förluster
              />

              <Tooltip
                contentStyle={{ backgroundColor: '#1e1e24', border: '1px solid #444', borderRadius: '5px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36}/>

              <Bar
                yAxisId="right"
                dataKey="eps"
                name="Kvartalsvinst / EPS (USD)"
                fill="#10b981"
                opacity={0.7}
                barSize={4}
              />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="price"
                name="Aktiepris (USD)"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}

export default App;