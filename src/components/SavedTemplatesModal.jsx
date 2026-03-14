import { useEffect, useState, useCallback } from 'react';
import {
  getMyTemplates,
  getAllTemplates,
  getBanplusMyTemplates,
  deleteTemplate,
  updateTemplateVisibility,
  getUserId,
} from '../utils/storage';

export default function SavedTemplatesModal({ isBanplus, bizNumber, onLoad, onClose }) {
  const [tab, setTab] = useState('my'); // 'my' | 'all'
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState(null); // 공개 토글 중인 템플릿 ID

  // 현재 사용자 ID (삭제/토글 버튼 표시 기준)
  const myUserId = isBanplus
    ? `biz_${bizNumber.replace(/-/g, '')}`
    : getUserId();

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (tab === 'my') {
        data = isBanplus ? await getBanplusMyTemplates(bizNumber) : await getMyTemplates();
      } else {
        // 밴플러스 사용자만 접근 가능한 전체 탭
        data = await getAllTemplates();
      }
      setTemplates(data);
    } catch (e) {
      const code = e?.code || '';
      if (code === 'unavailable' || (e.message || '').includes('network')) {
        setError('네트워크 연결을 확인해 주세요.');
      } else {
        setError('템플릿을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setLoading(false);
    }
  }, [tab, isBanplus, bizNumber]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      await deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('삭제 실패:', err);
      setError('삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  async function handleTogglePublic(tpl, e) {
    e.stopPropagation();
    setTogglingId(tpl.id);
    try {
      await updateTemplateVisibility(tpl.id, !tpl.isPublic);
      setTemplates((prev) =>
        prev.map((t) => (t.id === tpl.id ? { ...t, isPublic: !tpl.isPublic } : t))
      );
    } catch (err) {
      console.error('공개 설정 변경 실패:', err);
      setError('공개 설정 변경에 실패했습니다.');
    } finally {
      setTogglingId(null);
    }
  }

  function handleCopyLink(id, e) {
    e.stopPropagation();
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      // 링크 복사 성공 — 버튼 텍스트로 피드백 (별도 toast 없이 처리)
    }).catch(() => {
      setError('링크 복사에 실패했습니다. 수동으로 복사해 주세요.');
    });
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
              className={`tab-btn ${tab === 'all' ? 'active' : ''}`}
              onClick={() => setTab('all')}
            >
              🏪 전체 템플릿
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
            templates.map((tpl) => {
              const isOwner = tpl.userId === myUserId;
              return (
                <div key={tpl.id} className="saved-template-item" onClick={() => onLoad(tpl)}>
                  {tpl.thumbnail && (
                    <img src={tpl.thumbnail} alt={tpl.name} className="saved-template-thumb" />
                  )}
                  <div className="saved-template-info">
                    <span className="saved-template-name">{tpl.name}</span>
                    {tpl.isBanplus && tpl.bizNumber ? (
                      <span className="saved-template-biz">
                        🏪 {tpl.bizNumber.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')}
                      </span>
                    ) : (
                      <span className="saved-template-general">일반 사용자</span>
                    )}
                    <span className="saved-template-date">
                      {tpl.updatedAt?.toDate
                        ? tpl.updatedAt.toDate().toLocaleDateString('ko-KR')
                        : '날짜 없음'}
                    </span>
                  </div>
                  {isOwner && (
                    <div className="saved-template-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className={`btn btn-sm ${tpl.isPublic ? 'btn-success' : 'btn-secondary'}`}
                        onClick={(e) => handleTogglePublic(tpl, e)}
                        disabled={togglingId === tpl.id}
                        title={tpl.isPublic ? '공개 중 — 클릭 시 비공개로 변경' : '비공개 — 클릭 시 공개로 변경'}
                      >
                        {tpl.isPublic ? '🔓 공개' : '🔒 비공개'}
                      </button>
                      {tpl.isPublic && (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={(e) => handleCopyLink(tpl.id, e)}
                          title="공유 링크 복사"
                        >
                          🔗 링크 복사
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => handleDelete(tpl.id, e)}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
