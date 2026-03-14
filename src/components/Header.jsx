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
  onUndo,
  onRedo,
  canUndo,
  canRedo,
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
        <button className="btn btn-secondary" onClick={onSaveTemplate}>
          💾 저장
        </button>
        <div className="header-divider" />
        <button className="btn btn-primary" onClick={onSavePng}>
          🖼 PNG
        </button>
        <button className="btn btn-primary" onClick={onSavePdf}>
          📄 PDF
        </button>
        <button className="btn btn-success" onClick={onPrint}>
          🖨 인쇄
        </button>
      </div>
    </header>
  );
}
