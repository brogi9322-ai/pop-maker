import { useState, useEffect } from 'react';
import { validateBizNumber } from '../utils/storage';

export function useAuth() {
  const [isBanplus, setIsBanplus] = useState(false);
  const [bizNumber, setBizNumber] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('pop_banplus');
    if (saved) {
      setBizNumber(saved);
      setIsBanplus(true);
    }
  }, []);

  function login(biz) {
    if (!validateBizNumber(biz)) return false;
    localStorage.setItem('pop_banplus', biz.replace(/-/g, ''));
    setBizNumber(biz.replace(/-/g, ''));
    setIsBanplus(true);
    return true;
  }

  function logout() {
    localStorage.removeItem('pop_banplus');
    setBizNumber('');
    setIsBanplus(false);
  }

  return { isBanplus, bizNumber, login, logout };
}
