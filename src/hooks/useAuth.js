import { useState } from 'react';
import { validateBizNumber } from '../utils/storage';

export function useAuth() {
  // localStorage에서 초기 인증 상태 로드 (lazy initializer로 effect 없이 처리)
  const [bizNumber, setBizNumber] = useState(() => localStorage.getItem('pop_banplus') || '');
  const [isBanplus, setIsBanplus] = useState(() => !!localStorage.getItem('pop_banplus'));

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
