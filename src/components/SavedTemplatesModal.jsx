import { useEffect, useState } from 'react';
import {
  getMyTemplates,
  getBanplusSharedTemplates,
  getBanplusMyTemplates,
  deleteTemplate,
} from '../utils/storage';

export default function SavedTemplatesModal({ isBanplus, bizNumber, onLoad, onClose }) {
  const [tab, setTab] = useState('my'); // 'my' | 'shared'
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, [tab]);

  async function fetchTemplates() {
    setLoading(true);
    setError('');
    try {
      let data;
      if (tab === 'my') {
        data = isBanplus ? await getBanplusMyTemplates(bizNumber) : await getMyTemplates();
      } else {
        data = await getBanplusSharedTemplates();
      }
      setTemplates(data);
    } catch (e) {
      setError('불러오기 실패: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      await deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      alert('삭제 실패: ' + e.message);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">저장된 템플릿</h2>

        <div className="tab-bar">
          <button
            className={`tab-btn ${tab === 'my' ? 'active' : ''}`}
            onClick={() => setTab('my')}
          >
            내 템플릿
          </button>
          {isBanplus && (
            <button
              className={`tab-btn ${tab === 'shared' ? 'active' : ''}`}
              onClick={() => setTab('shared')}
            >
              🏪 밴플러스 공유 템플릿
            </button>
          )}
        </div>

        <div className="saved-templates-list">
          {loading && <p className="loading-msg">불러오는 중...</p>}
          {error && <p className="error-msg">{error}</p>}
          {!loading && !error && templates.length === 0 && (
            <p className="empty-msg">저장된 템플릿이 없습니다.</p>
          )}
          {!loading &&
            templates.map((tpl) => (
              <div key={tpl.id} className="saved-template-item" onClick={() => onLoad(tpl)}>
                {tpl.thumbnail && (
                  <img src={tpl.thumbnail} alt={tpl.name} className="saved-template-thumb" />
                )}
                <div className="saved-template-info">
                  <span className="saved-template-name">{tpl.name}</span>
                  {tpl.bizNumber && (
                    <span className="saved-template-biz">
                      사업자: {tpl.bizNumber.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')}
                    </span>
                  )}
                  <span className="saved-template-date">
                    {tpl.updatedAt?.toDate
                      ? tpl.updatedAt.toDate().toLocaleDateString('ko-KR')
                      : '날짜 없음'}
                  </span>
                </div>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={(e) => handleDelete(tpl.id, e)}
                >
                  삭제
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
