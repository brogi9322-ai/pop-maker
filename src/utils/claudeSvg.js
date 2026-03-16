// Claude API를 호출해 SVG 아이콘을 생성하는 유틸
// 반환: sanitize된 SVG data URL (data:image/svg+xml;base64,...)
// 에러 시: throw Error

import Anthropic from '@anthropic-ai/sdk';
import DOMPurify from 'dompurify';

// Claude에게 전달할 시스템 프롬프트 — SVG만 반환하도록 엄격히 설계
const SYSTEM_PROMPT = `당신은 SVG 아이콘 생성 전문가입니다.
사용자의 설명을 보고 깔끔하고 단순한 SVG 아이콘을 생성하세요.

규칙:
- 반드시 유효한 SVG 코드만 반환하세요. 설명이나 마크다운 없이 <svg>...</svg> 태그만.
- viewBox="0 0 100 100" 사용
- width, height 속성 없이 viewBox만 사용
- xmlns="http://www.w3.org/2000/svg" 속성 반드시 포함
- 단순하고 인식하기 쉬운 디자인
- 약국 POP 광고물에 적합한 스타일
- 스크립트, 외부 리소스, 이벤트 핸들러 절대 포함 금지`;

/**
 * Claude API를 호출해 SVG 아이콘을 생성한다.
 * @param {string} prompt - 생성할 아이콘 설명
 * @returns {Promise<string>} sanitize된 SVG data URL
 */
export async function generateSvgAsset(prompt) {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (!apiKey || apiKey.startsWith('your_')) {
    throw new Error('Claude API 키가 설정되지 않았습니다. .env 파일에 VITE_CLAUDE_API_KEY를 설정해주세요.');
  }

  // dangerouslyAllowBrowser: true — Spark 플랜 유지를 위해 Firebase Functions 대신
  // 브라우저에서 직접 호출. 내부 도구 용도로 허용된 의도적 결정.
  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `다음을 SVG로 그려주세요: ${prompt}` }],
  });

  const rawText = message.content[0]?.text?.trim();
  if (!rawText) {
    throw new Error('SVG 생성에 실패했습니다. 다시 시도해주세요.');
  }

  // Claude 응답에서 <svg>...</svg> 태그만 추출 (설명 텍스트 제거)
  const match = rawText.match(/<svg[\s\S]*?<\/svg>/i);
  if (!match) {
    throw new Error('SVG 생성에 실패했습니다. 다시 시도해주세요.');
  }

  const svgCode = match[0];

  // DOMPurify로 XSS 방어 sanitize — script, 이벤트 핸들러 등 위험 요소 제거
  const clean = DOMPurify.sanitize(svgCode, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['script', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });

  if (!clean || !clean.includes('<svg')) {
    throw new Error('생성된 SVG가 보안 검사를 통과하지 못했습니다.');
  }

  return svgToDataUrl(clean);
}

/**
 * SVG 문자열을 base64 data URL로 변환한다.
 * @param {string} svgString - 변환할 SVG 문자열
 * @returns {string} data:image/svg+xml;base64,... 형태의 URL
 */
export function svgToDataUrl(svgString) {
  const base64 = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${base64}`;
}
