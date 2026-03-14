// 기본 내장 에셋 데이터
// src: SVG data URI (내장) 또는 Firebase Storage URL (관리자 업로드)

function makeSvgAsset(id, name, svg) {
  return { id, name, src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, isBuiltIn: true };
}

const ASSETS_RAW = [
  // ── 감기/콧물 ─────────────────────────────────
  makeSvgAsset('cold_01', '콧물', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#EEF2FF"/>
    <ellipse cx="60" cy="52" rx="28" ry="22" fill="#a5b4fc"/>
    <ellipse cx="48" cy="58" rx="10" ry="10" fill="#f9fafb"/>
    <ellipse cx="72" cy="58" rx="10" ry="10" fill="#f9fafb"/>
    <circle cx="48" cy="58" r="5" fill="#4338ca"/>
    <circle cx="72" cy="58" r="5" fill="#4338ca"/>
    <path d="M48 68 Q60 76 72 68" stroke="#6366f1" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="48" cy="75" rx="4" ry="7" fill="#93c5fd" opacity="0.8"/>
    <ellipse cx="72" cy="75" rx="4" ry="7" fill="#93c5fd" opacity="0.8"/>
    <text x="60" y="108" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#4338ca" font-weight="bold">콧물</text>
  </svg>`),

  makeSvgAsset('cold_02', '재채기', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#FFF0F0"/>
    <circle cx="60" cy="50" r="26" fill="#fca5a5"/>
    <ellipse cx="50" cy="46" rx="5" ry="6" fill="#f9fafb"/>
    <ellipse cx="70" cy="46" rx="5" ry="6" fill="#f9fafb"/>
    <circle cx="50" cy="46" r="3" fill="#1e40af"/>
    <circle cx="70" cy="46" r="3" fill="#1e40af"/>
    <path d="M50 60 Q60 68 70 60" stroke="#dc2626" stroke-width="3" fill="none" stroke-linecap="round"/>
    <text x="30" y="32" font-size="18" font-family="serif">💨</text>
    <text x="60" y="108" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#dc2626" font-weight="bold">재채기</text>
  </svg>`),

  makeSvgAsset('cold_03', '체온계', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#FFF5F5"/>
    <rect x="55" y="20" width="10" height="60" rx="5" fill="#e5e7eb"/>
    <rect x="57" y="32" width="6" height="40" rx="3" fill="#ef4444"/>
    <circle cx="60" cy="88" r="14" fill="#ef4444"/>
    <circle cx="60" cy="88" r="9" fill="#fca5a5"/>
    <line x1="65" y1="35" x2="75" y2="35" stroke="#9ca3af" stroke-width="2"/>
    <line x1="65" y1="45" x2="72" y2="45" stroke="#9ca3af" stroke-width="2"/>
    <line x1="65" y1="55" x2="75" y2="55" stroke="#9ca3af" stroke-width="2"/>
    <text x="60" y="115" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#dc2626" font-weight="bold">체온계</text>
  </svg>`),

  makeSvgAsset('cold_04', '마스크', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#F0FFF4"/>
    <path d="M20 45 Q60 35 100 45 L100 75 Q60 90 20 75 Z" fill="#6ee7b7"/>
    <path d="M20 45 Q60 35 100 45" stroke="#34d399" stroke-width="2" fill="none"/>
    <path d="M20 75 Q60 90 100 75" stroke="#34d399" stroke-width="2" fill="none"/>
    <line x1="20" y1="60" x2="8" y2="45" stroke="#34d399" stroke-width="3" stroke-linecap="round"/>
    <line x1="100" y1="60" x2="112" y2="45" stroke="#34d399" stroke-width="3" stroke-linecap="round"/>
    <path d="M35 60 Q60 70 85 60" stroke="#10b981" stroke-width="2" fill="none" stroke-dasharray="4 3"/>
    <text x="60" y="112" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#059669" font-weight="bold">마스크</text>
  </svg>`),

  makeSvgAsset('cold_05', '감기약', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#F5F0FF"/>
    <g transform="rotate(-30 60 60)">
      <rect x="30" y="45" width="60" height="30" rx="15" fill="#a78bfa"/>
      <rect x="30" y="45" width="30" height="30" rx="15" fill="#7c3aed"/>
      <line x1="60" y1="45" x2="60" y2="75" stroke="white" stroke-width="2"/>
    </g>
    <text x="60" y="112" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#7c3aed" font-weight="bold">감기약</text>
  </svg>`),

  // ── 소아/아이 ─────────────────────────────────
  makeSvgAsset('child_01', '아기', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#FFFDE7"/>
    <circle cx="60" cy="42" r="22" fill="#fde68a"/>
    <circle cx="51" cy="38" r="4" fill="#1e40af"/>
    <circle cx="69" cy="38" r="4" fill="#1e40af"/>
    <circle cx="52" cy="36" r="1.5" fill="white"/>
    <circle cx="70" cy="36" r="1.5" fill="white"/>
    <path d="M50 52 Q60 60 70 52" stroke="#d97706" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="44" cy="44" r="5" fill="#fca5a5" opacity="0.6"/>
    <circle cx="76" cy="44" r="5" fill="#fca5a5" opacity="0.6"/>
    <path d="M38 65 Q60 85 82 65 L82 95 Q60 105 38 95 Z" fill="#fbbf24"/>
    <text x="60" y="116" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#d97706" font-weight="bold">아기</text>
  </svg>`),

  makeSvgAsset('child_02', '어린이', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#EFF6FF"/>
    <circle cx="60" cy="35" r="18" fill="#fde68a"/>
    <circle cx="52" cy="32" r="3.5" fill="#1e3a8a"/>
    <circle cx="68" cy="32" r="3.5" fill="#1e3a8a"/>
    <path d="M52 42 Q60 48 68 42" stroke="#d97706" stroke-width="2" fill="none" stroke-linecap="round"/>
    <rect x="45" y="55" width="30" height="35" rx="8" fill="#60a5fa"/>
    <line x1="60" y1="55" x2="60" y2="90" stroke="#3b82f6" stroke-width="1.5"/>
    <rect x="32" y="58" width="13" height="22" rx="6" fill="#93c5fd"/>
    <rect x="75" y="58" width="13" height="22" rx="6" fill="#93c5fd"/>
    <rect x="48" y="90" width="10" height="18" rx="5" fill="#6b7280"/>
    <rect x="62" y="90" width="10" height="18" rx="5" fill="#6b7280"/>
    <text x="60" y="118" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#1d4ed8" font-weight="bold">어린이</text>
  </svg>`),

  makeSvgAsset('child_03', '젖병', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#ECFDF5"/>
    <rect x="48" y="15" width="24" height="10" rx="4" fill="#d1fae5"/>
    <ellipse cx="60" cy="27" rx="10" ry="6" fill="#6ee7b7"/>
    <rect x="44" y="32" width="32" height="58" rx="14" fill="#a7f3d0"/>
    <rect x="44" y="32" width="32" height="30" rx="14" fill="#d1fae5"/>
    <line x1="50" y1="50" x2="70" y2="50" stroke="#10b981" stroke-width="2" stroke-dasharray="4 3"/>
    <ellipse cx="60" cy="25" rx="6" ry="4" fill="#34d399"/>
    <text x="60" y="108" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#059669" font-weight="bold">젖병</text>
  </svg>`),

  makeSvgAsset('child_04', '소아과', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#FFF7ED"/>
    <circle cx="60" cy="45" r="25" fill="#fed7aa"/>
    <circle cx="52" cy="40" r="4" fill="#431407"/>
    <circle cx="68" cy="40" r="4" fill="#431407"/>
    <path d="M50 55 Q60 63 70 55" stroke="#c2410c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="45" cy="46" r="6" fill="#fca5a5" opacity="0.5"/>
    <circle cx="75" cy="46" r="6" fill="#fca5a5" opacity="0.5"/>
    <path d="M42 25 Q60 15 78 25" stroke="#fb923c" stroke-width="3" fill="none" stroke-linecap="round"/>
    <text x="60" y="88" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#ea580c" font-weight="bold">소아과</text>
    <text x="60" y="112" text-anchor="middle" font-size="11" font-family="sans-serif" fill="#9a3412">전문 케어</text>
  </svg>`),

  // ── 임산부 ────────────────────────────────────
  makeSvgAsset('preg_01', '임산부', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#FDF2F8"/>
    <circle cx="60" cy="28" r="15" fill="#f9a8d4"/>
    <circle cx="54" cy="25" r="3" fill="#9d174d"/>
    <circle cx="66" cy="25" r="3" fill="#9d174d"/>
    <path d="M54 33 Q60 38 66 33" stroke="#be185d" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M48 45 Q38 60 40 80 L80 80 Q82 60 72 45 Q60 40 48 45Z" fill="#f9a8d4"/>
    <ellipse cx="60" cy="68" rx="14" ry="16" fill="#fce7f3"/>
    <rect x="42" y="80" width="12" height="25" rx="6" fill="#f9a8d4"/>
    <rect x="66" y="80" width="12" height="25" rx="6" fill="#f9a8d4"/>
    <text x="60" y="116" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#be185d" font-weight="bold">임산부</text>
  </svg>`),

  makeSvgAsset('preg_02', '신생아', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#FFF1F2"/>
    <ellipse cx="60" cy="55" rx="35" ry="28" fill="#ffe4e6"/>
    <circle cx="60" cy="42" r="18" fill="#fda4af"/>
    <circle cx="53" cy="39" r="3" fill="#881337"/>
    <circle cx="67" cy="39" r="3" fill="#881337"/>
    <path d="M53 48 Q60 54 67 48" stroke="#e11d48" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="44" cy="44" r="6" fill="#fecdd3" opacity="0.7"/>
    <circle cx="76" cy="44" r="6" fill="#fecdd3" opacity="0.7"/>
    <circle cx="35" cy="62" r="8" fill="#ffe4e6"/>
    <circle cx="85" cy="62" r="8" fill="#ffe4e6"/>
    <text x="60" y="100" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#e11d48" font-weight="bold">신생아</text>
    <text x="60" y="115" text-anchor="middle" font-size="11" font-family="sans-serif" fill="#9f1239">영양제</text>
  </svg>`),

  makeSvgAsset('preg_03', '엽산', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#F0FDF4"/>
    <circle cx="60" cy="55" r="32" fill="#bbf7d0"/>
    <text x="60" y="48" text-anchor="middle" font-size="32" font-family="serif">🌿</text>
    <text x="60" y="78" text-anchor="middle" font-size="15" font-family="sans-serif" fill="#15803d" font-weight="bold">엽산</text>
    <text x="60" y="108" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#166534">임산부 필수</text>
  </svg>`),

  makeSvgAsset('preg_04', '모성케어', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#FFF0F9"/>
    <path d="M60 90 C30 70 15 50 20 35 C25 20 42 18 60 35 C78 18 95 20 100 35 C105 50 90 70 60 90Z" fill="#f9a8d4"/>
    <path d="M60 80 C38 64 26 48 30 37 C34 26 47 24 60 37 C73 24 86 26 90 37 C94 48 82 64 60 80Z" fill="#fce7f3"/>
    <text x="60" y="108" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#be185d" font-weight="bold">모성케어</text>
  </svg>`),

  // ── 약/의약품 ─────────────────────────────────
  makeSvgAsset('med_01', '알약', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#EDE9FE"/>
    <g transform="rotate(-35 60 60)">
      <rect x="25" y="45" width="70" height="30" rx="15" fill="#a78bfa"/>
      <rect x="25" y="45" width="35" height="30" rx="15" fill="#7c3aed"/>
      <line x1="60" y1="45" x2="60" y2="75" stroke="white" stroke-width="2.5"/>
    </g>
    <text x="60" y="112" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#6d28d9" font-weight="bold">알약</text>
  </svg>`),

  makeSvgAsset('med_02', '비타민', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#FFFBEB"/>
    <circle cx="60" cy="55" r="28" fill="#fde68a"/>
    <circle cx="60" cy="55" r="20" fill="#fbbf24"/>
    <text x="60" y="63" text-anchor="middle" font-size="24" font-family="serif" fill="#92400e" font-weight="bold">V</text>
    <circle cx="60" cy="20" r="6" fill="#fde68a"/>
    <circle cx="92" cy="35" r="5" fill="#fde68a"/>
    <circle cx="97" cy="68" r="4" fill="#fde68a"/>
    <circle cx="28" cy="35" r="5" fill="#fde68a"/>
    <circle cx="23" cy="68" r="4" fill="#fde68a"/>
    <text x="60" y="108" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#d97706" font-weight="bold">비타민</text>
  </svg>`),

  makeSvgAsset('med_03', '약병', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#F0F9FF"/>
    <rect x="48" y="18" width="24" height="12" rx="4" fill="#bae6fd"/>
    <rect x="44" y="30" width="32" height="60" rx="10" fill="#38bdf8"/>
    <rect x="44" y="30" width="32" height="25" rx="10" fill="#7dd3fc"/>
    <rect x="48" y="58" width="24" height="3" rx="1.5" fill="white" opacity="0.7"/>
    <rect x="48" y="65" width="18" height="3" rx="1.5" fill="white" opacity="0.7"/>
    <text x="60" y="108" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#0284c7" font-weight="bold">약병</text>
  </svg>`),

  makeSvgAsset('med_04', '처방전', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#F8FAFC"/>
    <rect x="28" y="20" width="64" height="80" rx="8" fill="white" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="36" y="32" width="48" height="4" rx="2" fill="#94a3b8"/>
    <rect x="36" y="42" width="35" height="3" rx="1.5" fill="#cbd5e1"/>
    <rect x="36" y="50" width="42" height="3" rx="1.5" fill="#cbd5e1"/>
    <rect x="36" y="60" width="30" height="3" rx="1.5" fill="#cbd5e1"/>
    <path d="M42 72 L50 80 L70 65" stroke="#22c55e" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="60" y="112" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#475569" font-weight="bold">처방전</text>
  </svg>`),

  // ── 건강/홍보 ─────────────────────────────────
  makeSvgAsset('promo_01', '건강', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#FFF1F2"/>
    <path d="M60 88 C25 65 12 42 18 28 C24 14 44 12 60 32 C76 12 96 14 102 28 C108 42 95 65 60 88Z" fill="#fb7185"/>
    <path d="M60 78 C32 58 22 40 27 28 C31 18 47 16 60 32 C73 16 89 18 93 28 C98 40 88 58 60 78Z" fill="#fda4af"/>
    <text x="60" y="112" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#e11d48" font-weight="bold">건강</text>
  </svg>`),

  makeSvgAsset('promo_02', '추천', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#FFFBEB"/>
    <polygon points="60,15 72,45 105,45 80,65 90,95 60,75 30,95 40,65 15,45 48,45" fill="#fbbf24"/>
    <polygon points="60,25 70,48 95,48 75,63 83,87 60,72 37,87 45,63 25,48 50,48" fill="#fde68a"/>
    <text x="60" y="112" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#d97706" font-weight="bold">추천</text>
  </svg>`),

  makeSvgAsset('promo_03', '특가', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#FFF0F0"/>
    <polygon points="60,10 75,35 103,35 82,55 92,82 60,65 28,82 38,55 17,35 45,35" fill="#ef4444"/>
    <text x="60" y="58" text-anchor="middle" font-size="15" font-family="sans-serif" fill="white" font-weight="bold">특가</text>
    <text x="60" y="112" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#dc2626" font-weight="bold">특가</text>
  </svg>`),

  makeSvgAsset('promo_04', '이벤트', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#FFF0FF"/>
    <rect x="30" y="40" width="60" height="45" rx="10" fill="#e879f9"/>
    <rect x="30" y="40" width="60" height="15" rx="10" fill="#d946ef"/>
    <rect x="55" y="20" width="10" height="25" rx="5" fill="#d946ef"/>
    <rect x="35" y="25" width="10" height="20" rx="5" fill="#a21caf"/>
    <rect x="75" y="25" width="10" height="20" rx="5" fill="#a21caf"/>
    <path d="M55 55 L65 55" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M60 50 L60 60" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <text x="60" y="112" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#a21caf" font-weight="bold">이벤트</text>
  </svg>`),

  makeSvgAsset('promo_05', '약국', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#F0FDF4"/>
    <rect x="25" y="55" width="70" height="50" rx="6" fill="#4ade80"/>
    <polygon points="20,58 60,20 100,58" fill="#22c55e"/>
    <rect x="47" y="68" width="26" height="37" rx="4" fill="#166534"/>
    <rect x="38" y="60" width="44" height="20" rx="4" fill="#86efac"/>
    <path d="M52 68 L68 68" stroke="#16a34a" stroke-width="3" stroke-linecap="round"/>
    <path d="M60 60 L60 76" stroke="#16a34a" stroke-width="3" stroke-linecap="round"/>
    <text x="60" y="116" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#15803d" font-weight="bold">약국</text>
  </svg>`),

  makeSvgAsset('promo_06', '면역', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="20" fill="#EFF6FF"/>
    <path d="M60 15 L80 30 L80 60 Q80 85 60 95 Q40 85 40 60 L40 30 Z" fill="#60a5fa"/>
    <path d="M60 25 L74 37 L74 62 Q74 80 60 88 Q46 80 46 62 L46 37 Z" fill="#93c5fd"/>
    <path d="M52 57 L60 65 L72 50" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="60" y="112" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#1d4ed8" font-weight="bold">면역</text>
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
