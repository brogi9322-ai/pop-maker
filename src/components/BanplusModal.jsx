import { useState } from 'react';
import { validateBizNumber, formatBizNumber } from '../utils/storage';

export default function BanplusModal({ onLogin, onClose }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  function handleChange(e) {
    const formatted = formatBizNumber(e.target.value);
    setInput(formatted);
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validateBizNumber(input)) {
      setError('유효하지 않은 사업자번호입니다. 다시 확인해주세요.');
      return;
    }
    onLogin(input);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-logo">🏪</div>
        <h2 className="modal-title">밴플러스 인증</h2>
        <p className="modal-desc">
          사업자번호를 입력하면 밴플러스 회원으로 인증되어<br />
          다른 회원들의 공유 템플릿을 열람하고 저장할 수 있습니다.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">사업자번호</label>
            <input
              className={`text-input ${error ? 'input-error' : ''}`}
              type="text"
              placeholder="000-00-00000"
              value={input}
              onChange={handleChange}
              maxLength={12}
              autoFocus
            />
            {error && <p className="error-msg">{error}</p>}
          </div>

          <div className="modal-footer-note">
            ※ 추후 밴플러스 API 연동으로 자동 인증됩니다.
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
            <button type="submit" className="btn btn-primary">인증하기</button>
          </div>
        </form>
      </div>
    </div>
  );
}
