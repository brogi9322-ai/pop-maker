import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AssetPanel from './AssetPanel';
import { ASSET_CATEGORIES, getAssetsByCategory } from '../data/assets';

describe('AssetPanel — 초기 렌더링', () => {
  it('모든 카테고리 탭이 렌더링된다', () => {
    render(<AssetPanel onAddAsset={vi.fn()} />);
    ASSET_CATEGORIES.forEach((cat) => {
      expect(screen.getByRole('button', { name: cat.label })).toBeInTheDocument();
    });
  });

  it('AI 생성 탭이 렌더링된다', () => {
    render(<AssetPanel onAddAsset={vi.fn()} />);
    expect(screen.getByRole('button', { name: /AI 생성/ })).toBeInTheDocument();
  });

  it('첫 번째 카테고리 탭이 active 상태로 초기화된다', () => {
    render(<AssetPanel onAddAsset={vi.fn()} />);
    const firstCatButton = screen.getByRole('button', { name: ASSET_CATEGORIES[0].label });
    expect(firstCatButton).toHaveClass('active');
  });

  it('초기에 첫 번째 카테고리의 에셋이 표시된다', () => {
    render(<AssetPanel onAddAsset={vi.fn()} />);
    const initialAssets = getAssetsByCategory(ASSET_CATEGORIES[0].id);

    initialAssets.forEach((asset) => {
      expect(screen.getByTitle(asset.name)).toBeInTheDocument();
    });
  });

  it('관리자 에셋 업로드 안내 문구가 표시된다', () => {
    render(<AssetPanel onAddAsset={vi.fn()} />);
    expect(screen.getByText(/관리자 에셋 업로드/)).toBeInTheDocument();
  });
});

describe('AssetPanel — 카테고리 탭 전환', () => {
  it('다른 카테고리 탭을 클릭하면 해당 카테고리의 에셋이 표시된다', async () => {
    const user = userEvent.setup();
    render(<AssetPanel onAddAsset={vi.fn()} />);

    const secondCategory = ASSET_CATEGORIES[1];
    await user.click(screen.getByRole('button', { name: secondCategory.label }));

    const secondCatAssets = getAssetsByCategory(secondCategory.id);
    secondCatAssets.forEach((asset) => {
      expect(screen.getByTitle(asset.name)).toBeInTheDocument();
    });
  });

  it('카테고리 전환 시 클릭한 탭이 active 클래스를 갖는다', async () => {
    const user = userEvent.setup();
    render(<AssetPanel onAddAsset={vi.fn()} />);

    const secondCategory = ASSET_CATEGORIES[1];
    const tabButton = screen.getByRole('button', { name: secondCategory.label });
    await user.click(tabButton);

    expect(tabButton).toHaveClass('active');
  });

  it('카테고리 전환 시 이전 탭은 active 클래스를 잃는다', async () => {
    const user = userEvent.setup();
    render(<AssetPanel onAddAsset={vi.fn()} />);

    const firstCatButton = screen.getByRole('button', { name: ASSET_CATEGORIES[0].label });
    await user.click(screen.getByRole('button', { name: ASSET_CATEGORIES[1].label }));

    expect(firstCatButton).not.toHaveClass('active');
  });
});

describe('AssetPanel — 에셋 추가', () => {
  it('에셋 클릭 시 onAddAsset 콜백이 호출된다', async () => {
    const user = userEvent.setup();
    const onAddAsset = vi.fn();
    render(<AssetPanel onAddAsset={onAddAsset} />);

    const firstAssets = getAssetsByCategory(ASSET_CATEGORIES[0].id);
    await user.click(screen.getByTitle(firstAssets[0].name));

    expect(onAddAsset).toHaveBeenCalledTimes(1);
  });

  it('에셋 클릭 시 onAddAsset에 해당 에셋 데이터가 전달된다', async () => {
    const user = userEvent.setup();
    const onAddAsset = vi.fn();
    render(<AssetPanel onAddAsset={onAddAsset} />);

    const firstAssets = getAssetsByCategory(ASSET_CATEGORIES[0].id);
    const targetAsset = firstAssets[0];
    await user.click(screen.getByTitle(targetAsset.name));

    expect(onAddAsset).toHaveBeenCalledWith(targetAsset);
  });
});

describe('AssetPanel — AI 생성 탭', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('AI 생성 탭 클릭 시 입력창과 생성 버튼이 표시된다', async () => {
    // API 키 설정 상태 시뮬레이션
    vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key');

    const user = userEvent.setup();
    render(<AssetPanel onAddAsset={vi.fn()} aiAssets={[]} generating={false} onGenerateAsset={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /AI 생성/ }));

    expect(screen.getByPlaceholderText(/그릴 아이콘을 설명하세요/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '생성' })).toBeInTheDocument();
  });

  it('VITE_CLAUDE_API_KEY 미설정 시 안내 메시지가 표시된다', async () => {
    vi.stubEnv('VITE_CLAUDE_API_KEY', '');

    const user = userEvent.setup();
    render(<AssetPanel onAddAsset={vi.fn()} aiAssets={[]} generating={false} onGenerateAsset={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /AI 생성/ }));

    expect(screen.getByText(/API 키가 설정되지 않았습니다/)).toBeInTheDocument();
    expect(screen.getByText(/VITE_CLAUDE_API_KEY/)).toBeInTheDocument();
  });

  it('VITE_CLAUDE_API_KEY가 기본값이면 안내 메시지가 표시된다', async () => {
    vi.stubEnv('VITE_CLAUDE_API_KEY', 'your_claude_api_key_here');

    const user = userEvent.setup();
    render(<AssetPanel onAddAsset={vi.fn()} aiAssets={[]} generating={false} onGenerateAsset={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /AI 생성/ }));

    expect(screen.getByText(/API 키가 설정되지 않았습니다/)).toBeInTheDocument();
  });

  it('생성 버튼 클릭 시 onGenerateAsset이 프롬프트와 함께 호출된다', async () => {
    vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key');

    const user = userEvent.setup();
    const onGenerateAsset = vi.fn();
    render(<AssetPanel onAddAsset={vi.fn()} aiAssets={[]} generating={false} onGenerateAsset={onGenerateAsset} />);

    await user.click(screen.getByRole('button', { name: /AI 생성/ }));
    await user.type(screen.getByPlaceholderText(/그릴 아이콘을 설명하세요/), '빨간 하트');
    await user.click(screen.getByRole('button', { name: '생성' }));

    expect(onGenerateAsset).toHaveBeenCalledWith('빨간 하트');
  });

  it('generating=true 일 때 생성 버튼이 비활성화되고 로딩 텍스트가 표시된다', async () => {
    vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key');

    const user = userEvent.setup();
    render(<AssetPanel onAddAsset={vi.fn()} aiAssets={[]} generating={true} onGenerateAsset={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /AI 생성/ }));

    expect(screen.getByRole('button', { name: /AI가 그리는 중/ })).toBeDisabled();
  });

  it('생성된 AI 에셋이 목록에 표시된다', async () => {
    vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key');

    const aiAssets = [
      { id: 'ai-1', name: '빨간 하트', src: 'data:image/svg+xml;base64,abc', isAiGenerated: true },
    ];

    const user = userEvent.setup();
    render(<AssetPanel onAddAsset={vi.fn()} aiAssets={aiAssets} generating={false} onGenerateAsset={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /AI 생성/ }));

    expect(screen.getByTitle('빨간 하트')).toBeInTheDocument();
  });

  it('AI 에셋 클릭 시 onAddAsset 콜백이 호출된다', async () => {
    vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key');

    const aiAssets = [
      { id: 'ai-1', name: '빨간 하트', src: 'data:image/svg+xml;base64,abc', isAiGenerated: true },
    ];

    const user = userEvent.setup();
    const onAddAsset = vi.fn();
    render(<AssetPanel onAddAsset={onAddAsset} aiAssets={aiAssets} generating={false} onGenerateAsset={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /AI 생성/ }));
    await user.click(screen.getByTitle('빨간 하트'));

    expect(onAddAsset).toHaveBeenCalledWith(aiAssets[0]);
  });

  it('AI 에셋 삭제 버튼 클릭 시 onRemoveAiAsset이 해당 id와 함께 호출된다', async () => {
    vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key');

    const aiAssets = [
      { id: 'ai-1', name: '빨간 하트', src: 'data:image/svg+xml;base64,abc', isAiGenerated: true },
    ];

    const user = userEvent.setup();
    const onRemoveAiAsset = vi.fn();
    render(
      <AssetPanel
        onAddAsset={vi.fn()}
        aiAssets={aiAssets}
        generating={false}
        onGenerateAsset={vi.fn()}
        onRemoveAiAsset={onRemoveAiAsset}
      />
    );

    await user.click(screen.getByRole('button', { name: /AI 생성/ }));

    // 삭제 버튼 (aria-label으로 찾기)
    const deleteBtn = screen.getByRole('button', { name: '빨간 하트 삭제' });
    await user.click(deleteBtn);

    expect(onRemoveAiAsset).toHaveBeenCalledWith('ai-1');
  });

  it('AI 에셋이 없을 때 안내 문구가 표시된다', async () => {
    vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key');

    const user = userEvent.setup();
    render(<AssetPanel onAddAsset={vi.fn()} aiAssets={[]} generating={false} onGenerateAsset={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /AI 생성/ }));

    expect(screen.getByText(/입력창에 설명을 입력하고/)).toBeInTheDocument();
  });

  it('Enter 키 입력 시 onGenerateAsset이 호출된다', async () => {
    vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key');

    const user = userEvent.setup();
    const onGenerateAsset = vi.fn();
    render(<AssetPanel onAddAsset={vi.fn()} aiAssets={[]} generating={false} onGenerateAsset={onGenerateAsset} />);

    await user.click(screen.getByRole('button', { name: /AI 생성/ }));
    const input = screen.getByPlaceholderText(/그릴 아이콘을 설명하세요/);
    await user.type(input, '하트{Enter}');

    expect(onGenerateAsset).toHaveBeenCalledWith('하트');
  });
});
