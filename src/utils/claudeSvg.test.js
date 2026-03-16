import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateSvgAsset, svgToDataUrl } from './claudeSvg';

// Anthropic 인스턴스의 messages.create를 테스트 간 공유하기 위한 변수
let mockMessagesCreate;

// @anthropic-ai/sdk 목킹 — class로 구현해야 new Anthropic()이 동작함
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      constructor() {
        this.messages = { create: (...args) => mockMessagesCreate(...args) };
      }
    },
  };
});

// dompurify 목킹
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((input) => input),
  },
}));

// 목킹된 모듈 import
import DOMPurify from 'dompurify';

describe('generateSvgAsset', () => {
  // 각 테스트 전 import.meta.env 초기화
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    // DOMPurify.sanitize 기본 동작: 입력 그대로 반환
    DOMPurify.sanitize.mockImplementation((input) => input);
    // 기본 mockMessagesCreate 초기화
    mockMessagesCreate = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('VITE_CLAUDE_API_KEY 미설정 시 에러를 throw한다', async () => {
    vi.stubEnv('VITE_CLAUDE_API_KEY', '');

    await expect(generateSvgAsset('하트')).rejects.toThrow(
      'Claude API 키가 설정되지 않았습니다'
    );
  });

  it('VITE_CLAUDE_API_KEY가 기본값(your_로 시작)이면 에러를 throw한다', async () => {
    vi.stubEnv('VITE_CLAUDE_API_KEY', 'your_claude_api_key_here');

    await expect(generateSvgAsset('하트')).rejects.toThrow(
      'Claude API 키가 설정되지 않았습니다'
    );
  });

  it('API 호출 성공 시 SVG data URL을 반환한다', async () => {
    vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key');

    const mockSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red"/></svg>';
    mockMessagesCreate = vi.fn().mockResolvedValue({ content: [{ text: mockSvg }] });

    const result = await generateSvgAsset('빨간 원');

    expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
    expect(DOMPurify.sanitize).toHaveBeenCalledWith(mockSvg, expect.objectContaining({
      USE_PROFILES: { svg: true, svgFilters: true },
    }));
  });

  it('API 응답에 SVG 태그가 없으면 에러를 throw한다', async () => {
    vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key');

    mockMessagesCreate = vi.fn().mockResolvedValue({
      content: [{ text: '여기에 SVG가 없습니다. 단순 텍스트만 있습니다.' }],
    });

    await expect(generateSvgAsset('테스트')).rejects.toThrow(
      'SVG 생성에 실패했습니다'
    );
  });

  it('응답 텍스트가 비어있으면 에러를 throw한다', async () => {
    vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key');

    mockMessagesCreate = vi.fn().mockResolvedValue({ content: [] });

    await expect(generateSvgAsset('테스트')).rejects.toThrow(
      'SVG 생성에 실패했습니다'
    );
  });

  it('DOMPurify sanitize 후 SVG가 없으면 보안 에러를 throw한다', async () => {
    vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key');

    const mockSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>';
    mockMessagesCreate = vi.fn().mockResolvedValue({ content: [{ text: mockSvg }] });

    // sanitize가 빈 문자열 반환하도록 목킹 (위험 콘텐츠 제거 시뮬레이션)
    DOMPurify.sanitize.mockReturnValue('');

    await expect(generateSvgAsset('테스트')).rejects.toThrow(
      '보안 검사를 통과하지 못했습니다'
    );
  });

  it('Claude 응답 텍스트에서 SVG 태그만 추출한다 (설명 텍스트 제거)', async () => {
    vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key');

    const svgPart = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="blue"/></svg>';
    const responseWithText = `여기에 SVG 아이콘을 생성했습니다:\n${svgPart}\n잘 활용하세요!`;

    mockMessagesCreate = vi.fn().mockResolvedValue({ content: [{ text: responseWithText }] });

    const result = await generateSvgAsset('파란 사각형');

    expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
    // sanitize가 svgPart만 받아야 함
    expect(DOMPurify.sanitize).toHaveBeenCalledWith(svgPart, expect.any(Object));
  });
});

describe('svgToDataUrl', () => {
  it('SVG 문자열을 올바른 base64 data URL로 변환한다', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"></svg>';
    const result = svgToDataUrl(svg);

    expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
    // base64 디코딩 후 원본과 일치하는지 확인
    const base64Part = result.replace('data:image/svg+xml;base64,', '');
    const decoded = decodeURIComponent(escape(atob(base64Part)));
    expect(decoded).toBe(svg);
  });

  it('한국어 포함 SVG도 올바르게 인코딩한다', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text>약국</text></svg>';
    const result = svgToDataUrl(svg);

    expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
    const base64Part = result.replace('data:image/svg+xml;base64,', '');
    const decoded = decodeURIComponent(escape(atob(base64Part)));
    expect(decoded).toBe(svg);
  });
});
