import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function useCurrency() {
  const [currency, setCurrency] = useState('USD');
  const [rate, setRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRate = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = import.meta.env.VITE_CURRENCY_API_URL;
      const key = import.meta.env.VITE_CURRENCY_API_KEY;
      if (url && key) {
        const response = await axios.get(`${url}?apikey=${key}&currencies=INR&base_currency=USD`);
        const inrRate = response.data.data.INR.value;
        setRate(inrRate);
        localStorage.setItem('pnl_inr_rate', inrRate);
      }
    } catch (error) {
      console.error("Failed to fetch currency rate:", error);
      const savedRate = localStorage.getItem('pnl_inr_rate');
      if (savedRate) setRate(parseFloat(savedRate));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currency === 'INR' && rate === 1) {
      fetchRate();
    }
  }, [currency, fetchRate, rate]);

  const toggleCurrency = () => {
    setCurrency(prev => (prev === 'USD' ? 'INR' : 'USD'));
  };

  return { currency, rate, isLoading, toggleCurrency };
}
