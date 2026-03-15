export default function Header({
  isBanplus,
  bizNumber,
  onBanplusClick,
  onLogout,
  onSavePng,
  onSavePdf,
  onPrint,
  onSaveTemplate,
  onLoadTemplates,
  onExportJson,
  onImportJson,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  darkMode,
  onToggleDarkMode,
  saving,
  savingOp,
}) {
  const displayBiz = bizNumber
    ? bizNumber.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')
    : '';

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">🏪 POP 제작기</h1>
        {isBanplus ? (
          <div className="banplus-badge">
            <span>🏆 밴플러스</span>
            <span className="biz-num">{displayBiz}</span>
            <button className="btn-logout" onClick={onLogout}>로그아웃</button>
          </div>
        ) : (
          <button className="btn-banplus" onClick={onBanplusClick}>
            🏪 밴플러스 인증
          </button>
        )}
      </div>

      <div className="header-actions">
        <button
          className="btn btn-secondary"
          onClick={onUndo}
          disabled={!canUndo}
          title="실행 취소 (Ctrl+Z)"
        >
          ↩ 실행 취소
        </button>
        <button
          className="btn btn-secondary"
          onClick={onRedo}
          disabled={!canRedo}
          title="다시 실행 (Ctrl+Shift+Z)"
        >
          ↪ 다시 실행
        </button>
        <div className="header-divider" />
        <button className="btn btn-secondary" onClick={onLoadTemplates}>
          📂 내 템플릿
        </button>
        <button className="btn btn-secondary" onClick={onSaveTemplate} disabled={saving}>
          {savingOp === 'template' ? '💾 저장 중...' : '💾 저장'}
        </button>
        <button className="btn btn-secondary" onClick={onExportJson} title="작업물을 JSON 파일로 내보내기">
          📤 JSON 내보내기
        </button>
        <label className="btn btn-secondary" style={{ cursor: 'pointer' }} title="JSON 파일로 작업물 가져오기">
          📥 JSON 가져오기
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={onImportJson} />
        </label>
        <div className="header-divider" />
        <button className="btn btn-primary" onClick={onSavePng} disabled={saving}>
          {savingOp === 'png' ? '⏳ 변환 중...' : '🖼 PNG'}
        </button>
        <button className="btn btn-primary" onClick={onSavePdf} disabled={saving}>
          {savingOp === 'pdf' ? '⏳ 변환 중...' : '📄 PDF'}
        </button>
        <button className="btn btn-success" onClick={onPrint}>
          🖨 인쇄
        </button>
        <div className="header-divider" />
        <button
          className="btn-icon"
          onClick={onToggleDarkMode}
          title={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
          aria-label={darkMode ? '라이트 모드' : '다크 모드'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
