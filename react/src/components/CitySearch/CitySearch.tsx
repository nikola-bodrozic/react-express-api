import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import "./CitySearch.css";

interface CityResponse {
  prefix: string;
  count: number;
  cities: string[];
}

const CitySearch = () => {
  const [prefix, setPrefix] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simplified debounce function
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const fetchCities = async (searchPrefix: string) => {
    if (searchPrefix.length < 2) {
      setCities([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<CityResponse>(`/cities/${searchPrefix}`);
      setCities(response.data.cities);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || 'Failed to fetch cities');
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchCities = useCallback(
    debounce(fetchCities, 300),
    []
  );

  useEffect(() => {
    debouncedFetchCities(prefix);
  }, [prefix, debouncedFetchCities]);

  return (
    <div className="city-search">
      <p>Filtering city names. Try "ac" and then "aci"</p>
      <input
        type="text"
        value={prefix}
        onChange={(e) => setPrefix(e.target.value)}
        placeholder="Min. 2 chars"
      />
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <ul>
        {cities.map(city => (
          <li key={city}>{city}</li>
        ))}
      </ul>
    </div>
  );
};

export default CitySearch;