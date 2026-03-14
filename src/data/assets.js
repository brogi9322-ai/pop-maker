// 기본 내장 에셋 데이터
// 배경 없는 순수 아이콘 SVG (투명 배경, 텍스트 레이블 없음)

function makeSvgAsset(id, name, svg) {
  return { id, name, src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, isBuiltIn: true };
}

const ASSETS_RAW = [
  // ── 감기/콧물 ─────────────────────────────────
  makeSvgAsset('cold_01', '콧물', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="40" rx="28" ry="22" fill="#a5b4fc"/>
    <ellipse cx="38" cy="46" rx="10" ry="10" fill="#f9fafb"/>
    <ellipse cx="62" cy="46" rx="10" ry="10" fill="#f9fafb"/>
    <circle cx="38" cy="46" r="5" fill="#4338ca"/>
    <circle cx="62" cy="46" r="5" fill="#4338ca"/>
    <path d="M38 56 Q50 64 62 56" stroke="#6366f1" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="38" cy="63" rx="4" ry="7" fill="#93c5fd" opacity="0.9"/>
    <ellipse cx="62" cy="63" rx="4" ry="7" fill="#93c5fd" opacity="0.9"/>
  </svg>`),

  makeSvgAsset('cold_02', '재채기', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="48" r="26" fill="#fca5a5"/>
    <ellipse cx="40" cy="43" rx="5" ry="6" fill="#f9fafb"/>
    <ellipse cx="60" cy="43" rx="5" ry="6" fill="#f9fafb"/>
    <circle cx="40" cy="43" r="3" fill="#1e40af"/>
    <circle cx="60" cy="43" r="3" fill="#1e40af"/>
    <path d="M40 58 Q50 66 60 58" stroke="#dc2626" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M22 22 Q28 14 36 18" stroke="#93c5fd" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M14 30 Q18 20 26 22" stroke="#93c5fd" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M10 42 Q12 32 20 34" stroke="#93c5fd" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`),

  makeSvgAsset('cold_03', '체온계', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="45" y="10" width="10" height="55" rx="5" fill="#e5e7eb"/>
    <rect x="47" y="20" width="6" height="38" rx="3" fill="#ef4444"/>
    <circle cx="50" cy="76" r="14" fill="#ef4444"/>
    <circle cx="50" cy="76" r="9" fill="#fca5a5"/>
    <line x1="55" y1="24" x2="64" y2="24" stroke="#9ca3af" stroke-width="2"/>
    <line x1="55" y1="33" x2="61" y2="33" stroke="#9ca3af" stroke-width="2"/>
    <line x1="55" y1="42" x2="64" y2="42" stroke="#9ca3af" stroke-width="2"/>
    <line x1="55" y1="51" x2="61" y2="51" stroke="#9ca3af" stroke-width="2"/>
  </svg>`),

  makeSvgAsset('cold_04', '마스크', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M10 35 Q50 25 90 35 L90 65 Q50 80 10 65 Z" fill="#6ee7b7"/>
    <path d="M10 35 Q50 25 90 35" stroke="#34d399" stroke-width="2" fill="none"/>
    <path d="M10 65 Q50 80 90 65" stroke="#34d399" stroke-width="2" fill="none"/>
    <line x1="10" y1="50" x2="0" y2="37" stroke="#34d399" stroke-width="3" stroke-linecap="round"/>
    <line x1="90" y1="50" x2="100" y2="37" stroke="#34d399" stroke-width="3" stroke-linecap="round"/>
    <path d="M25 50 Q50 60 75 50" stroke="#10b981" stroke-width="2" fill="none" stroke-dasharray="4 3"/>
  </svg>`),

  makeSvgAsset('cold_05', '감기약', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <g transform="rotate(-30 50 50)">
      <rect x="15" y="35" width="70" height="30" rx="15" fill="#a78bfa"/>
      <rect x="15" y="35" width="35" height="30" rx="15" fill="#7c3aed"/>
      <line x1="50" y1="35" x2="50" y2="65" stroke="white" stroke-width="2.5"/>
    </g>
  </svg>`),

  // ── 소아/아이 ─────────────────────────────────
  makeSvgAsset('child_01', '아기', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="34" r="22" fill="#fde68a"/>
    <circle cx="41" cy="30" r="4" fill="#1e40af"/>
    <circle cx="59" cy="30" r="4" fill="#1e40af"/>
    <circle cx="42" cy="28" r="1.5" fill="white"/>
    <circle cx="60" cy="28" r="1.5" fill="white"/>
    <path d="M41 44 Q50 52 59 44" stroke="#d97706" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="35" cy="36" r="5" fill="#fca5a5" opacity="0.6"/>
    <circle cx="65" cy="36" r="5" fill="#fca5a5" opacity="0.6"/>
    <path d="M28 57 Q50 75 72 57 L72 85 Q50 95 28 85 Z" fill="#fbbf24"/>
  </svg>`),

  makeSvgAsset('child_02', '어린이', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="26" r="18" fill="#fde68a"/>
    <circle cx="42" cy="23" r="3.5" fill="#1e3a8a"/>
    <circle cx="58" cy="23" r="3.5" fill="#1e3a8a"/>
    <path d="M42 33 Q50 39 58 33" stroke="#d97706" stroke-width="2" fill="none" stroke-linecap="round"/>
    <rect x="35" y="46" width="30" height="33" rx="8" fill="#60a5fa"/>
    <line x1="50" y1="46" x2="50" y2="79" stroke="#3b82f6" stroke-width="1.5"/>
    <rect x="22" y="49" width="13" height="22" rx="6" fill="#93c5fd"/>
    <rect x="65" y="49" width="13" height="22" rx="6" fill="#93c5fd"/>
    <rect x="38" y="79" width="10" height="16" rx="5" fill="#6b7280"/>
    <rect x="52" y="79" width="10" height="16" rx="5" fill="#6b7280"/>
  </svg>`),

  makeSvgAsset('child_03', '젖병', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="38" y="8" width="24" height="10" rx="4" fill="#d1fae5"/>
    <ellipse cx="50" cy="20" rx="10" ry="6" fill="#6ee7b7"/>
    <rect x="34" y="25" width="32" height="58" rx="14" fill="#a7f3d0"/>
    <rect x="34" y="25" width="32" height="28" rx="14" fill="#d1fae5"/>
    <line x1="40" y1="43" x2="60" y2="43" stroke="#10b981" stroke-width="2" stroke-dasharray="4 3"/>
    <ellipse cx="50" cy="18" rx="6" ry="4" fill="#34d399"/>
  </svg>`),

  makeSvgAsset('child_04', '소아과', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="38" r="25" fill="#fed7aa"/>
    <circle cx="42" cy="33" r="4" fill="#431407"/>
    <circle cx="58" cy="33" r="4" fill="#431407"/>
    <path d="M40 48 Q50 56 60 48" stroke="#c2410c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="35" cy="39" r="6" fill="#fca5a5" opacity="0.5"/>
    <circle cx="65" cy="39" r="6" fill="#fca5a5" opacity="0.5"/>
    <path d="M32 18 Q50 8 68 18" stroke="#fb923c" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M27 25 Q50 12 73 25" stroke="#fb923c" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/>
  </svg>`),

  // ── 임산부 ────────────────────────────────────
  makeSvgAsset('preg_01', '임산부', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="22" r="15" fill="#f9a8d4"/>
    <circle cx="44" cy="19" r="3" fill="#9d174d"/>
    <circle cx="56" cy="19" r="3" fill="#9d174d"/>
    <path d="M44 27 Q50 32 56 27" stroke="#be185d" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M38 38 Q28 52 30 70 L70 70 Q72 52 62 38 Q50 33 38 38Z" fill="#f9a8d4"/>
    <ellipse cx="50" cy="58" rx="14" ry="14" fill="#fce7f3"/>
    <rect x="32" y="70" width="12" height="22" rx="6" fill="#f9a8d4"/>
    <rect x="56" y="70" width="12" height="22" rx="6" fill="#f9a8d4"/>
  </svg>`),

  makeSvgAsset('preg_02', '신생아', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="52" rx="35" ry="28" fill="#ffe4e6"/>
    <circle cx="50" cy="38" r="18" fill="#fda4af"/>
    <circle cx="43" cy="35" r="3" fill="#881337"/>
    <circle cx="57" cy="35" r="3" fill="#881337"/>
    <path d="M43 44 Q50 50 57 44" stroke="#e11d48" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="34" cy="40" r="6" fill="#fecdd3" opacity="0.7"/>
    <circle cx="66" cy="40" r="6" fill="#fecdd3" opacity="0.7"/>
    <circle cx="25" cy="58" r="8" fill="#ffe4e6"/>
    <circle cx="75" cy="58" r="8" fill="#ffe4e6"/>
  </svg>`),

  makeSvgAsset('preg_03', '엽산', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="55" rx="30" ry="25" fill="#bbf7d0"/>
    <path d="M50 20 C30 25 18 42 22 58 C26 72 40 78 50 75 C60 78 74 72 78 58 C82 42 70 25 50 20Z" fill="#4ade80" opacity="0.7"/>
    <path d="M50 20 C50 35 44 50 38 62" stroke="#15803d" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M50 20 C50 35 56 50 62 62" stroke="#15803d" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/>
    <path d="M32 38 C40 34 50 33 58 36" stroke="#15803d" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`),

  makeSvgAsset('preg_04', '모성케어', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M50 85 C20 65 5 42 12 27 C18 13 36 12 50 30 C64 12 82 13 88 27 C95 42 80 65 50 85Z" fill="#f9a8d4"/>
    <path d="M50 74 C28 57 16 40 22 28 C27 17 42 16 50 30 C58 16 73 17 78 28 C84 40 72 57 50 74Z" fill="#fce7f3"/>
    <circle cx="50" cy="52" r="10" fill="#f9a8d4" opacity="0.6"/>
  </svg>`),

  // ── 약/의약품 ─────────────────────────────────
  makeSvgAsset('med_01', '알약', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <g transform="rotate(-35 50 50)">
      <rect x="10" y="35" width="80" height="30" rx="15" fill="#a78bfa"/>
      <rect x="10" y="35" width="40" height="30" rx="15" fill="#7c3aed"/>
      <line x1="50" y1="35" x2="50" y2="65" stroke="white" stroke-width="2.5"/>
    </g>
  </svg>`),

  makeSvgAsset('med_02', '비타민', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="52" r="28" fill="#fde68a"/>
    <circle cx="50" cy="52" r="20" fill="#fbbf24"/>
    <text x="50" y="61" text-anchor="middle" font-size="24" font-family="serif" fill="#92400e" font-weight="bold">V</text>
    <circle cx="50" cy="16" r="6" fill="#fde68a"/>
    <circle cx="82" cy="31" r="5" fill="#fde68a"/>
    <circle cx="87" cy="64" r="4" fill="#fde68a"/>
    <circle cx="18" cy="31" r="5" fill="#fde68a"/>
    <circle cx="13" cy="64" r="4" fill="#fde68a"/>
  </svg>`),

  makeSvgAsset('med_03', '약병', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="38" y="10" width="24" height="12" rx="4" fill="#bae6fd"/>
    <rect x="34" y="22" width="32" height="65" rx="10" fill="#38bdf8"/>
    <rect x="34" y="22" width="32" height="26" rx="10" fill="#7dd3fc"/>
    <rect x="38" y="53" width="24" height="3" rx="1.5" fill="white" opacity="0.7"/>
    <rect x="38" y="61" width="18" height="3" rx="1.5" fill="white" opacity="0.7"/>
    <rect x="38" y="69" width="20" height="3" rx="1.5" fill="white" opacity="0.5"/>
  </svg>`),

  makeSvgAsset('med_04', '처방전', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="18" y="10" width="64" height="80" rx="8" fill="white" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="26" y="22" width="48" height="4" rx="2" fill="#94a3b8"/>
    <rect x="26" y="32" width="35" height="3" rx="1.5" fill="#cbd5e1"/>
    <rect x="26" y="40" width="42" height="3" rx="1.5" fill="#cbd5e1"/>
    <rect x="26" y="48" width="28" height="3" rx="1.5" fill="#cbd5e1"/>
    <rect x="26" y="56" width="38" height="3" rx="1.5" fill="#cbd5e1"/>
    <path d="M30 70 L40 80 L62 62" stroke="#22c55e" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`),

  // ── 건강/홍보 ─────────────────────────────────
  makeSvgAsset('promo_01', '건강', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M50 88 C15 65 2 40 10 24 C17 10 37 8 50 28 C63 8 83 10 90 24 C98 40 85 65 50 88Z" fill="#fb7185"/>
    <path d="M50 76 C22 56 12 36 19 22 C25 12 42 10 50 28 C58 10 75 12 81 22 C88 36 78 56 50 76Z" fill="#fda4af"/>
  </svg>`),

  makeSvgAsset('promo_02', '추천', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <polygon points="50,8 62,38 95,38 70,57 80,88 50,68 20,88 30,57 5,38 38,38" fill="#fbbf24"/>
    <polygon points="50,18 60,42 85,42 65,57 73,81 50,66 27,81 35,57 15,42 40,42" fill="#fde68a"/>
  </svg>`),

  makeSvgAsset('promo_03', '특가', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <polygon points="50,5 65,30 95,30 74,50 84,78 50,60 16,78 26,50 5,30 35,30" fill="#ef4444"/>
    <text x="50" y="54" text-anchor="middle" font-size="16" font-family="sans-serif" fill="white" font-weight="bold">특가</text>
  </svg>`),

  makeSvgAsset('promo_04', '이벤트', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="20" y="38" width="60" height="45" rx="10" fill="#e879f9"/>
    <rect x="20" y="38" width="60" height="15" rx="10" fill="#d946ef"/>
    <rect x="45" y="15" width="10" height="28" rx="5" fill="#d946ef"/>
    <rect x="25" y="20" width="10" height="22" rx="5" fill="#a21caf"/>
    <rect x="65" y="20" width="10" height="22" rx="5" fill="#a21caf"/>
    <path d="M45 52 L55 52" stroke="white" stroke-width="3" stroke-linecap="round"/>
    <path d="M50 47 L50 57" stroke="white" stroke-width="3" stroke-linecap="round"/>
  </svg>`),

  makeSvgAsset('promo_05', '약국', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="15" y="50" width="70" height="45" rx="6" fill="#4ade80"/>
    <polygon points="10,53 50,15 90,53" fill="#22c55e"/>
    <rect x="37" y="63" width="26" height="32" rx="4" fill="#166534"/>
    <rect x="28" y="55" width="44" height="18" rx="4" fill="#86efac"/>
    <path d="M42 63 L58 63" stroke="#16a34a" stroke-width="3" stroke-linecap="round"/>
    <path d="M50 55 L50 71" stroke="#16a34a" stroke-width="3" stroke-linecap="round"/>
  </svg>`),

  makeSvgAsset('promo_06', '면역', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M50 8 L72 24 L72 56 Q72 82 50 92 Q28 82 28 56 L28 24 Z" fill="#60a5fa"/>
    <path d="M50 18 L64 30 L64 57 Q64 76 50 84 Q36 76 36 57 L36 30 Z" fill="#93c5fd"/>
    <path d="M42 52 L50 60 L64 44" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`),
];

export const ASSET_CATEGORIES = [
  { id: 'cold', label: '감기/콧물', ids: ['cold_01', 'cold_02', 'cold_03', 'cold_04', 'cold_05'] },
  { id: 'child', label: '소아/아이', ids: ['child_01', 'child_02', 'child_03', 'child_04'] },
  { id: 'pregnancy', label: '임산부', ids: ['preg_01', 'preg_02', 'preg_03', 'preg_04'] },
  { id: 'medicine', label: '약/의약품', ids: ['med_01', 'med_02', 'med_03', 'med_04'] },
  { id: 'promo', label: '건강/홍보', ids: ['promo_01', 'promo_02', 'promo_03', 'promo_04', 'promo_05', 'promo_06'] },
];

// id → asset 빠른 조회
const ASSET_MAP = Object.fromEntries(ASSETS_RAW.map((a) => [a.id, a]));

export function getAssetsByCategory(categoryId) {
  const cat = ASSET_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return [];
  return cat.ids.map((id) => ASSET_MAP[id]).filter(Boolean);
}

export function getAllAssets() {
  return ASSETS_RAW;
}
