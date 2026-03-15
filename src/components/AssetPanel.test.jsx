import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AssetPanel from './AssetPanel';
import { ASSET_CATEGORIES, getAssetsByCategory } from '../data/assets';

describe('AssetPanel — 초기 렌더링', () => {
  it('모든 카테고리 탭이 렌더링된다', () => {
    render(<AssetPanel onAddAsset={vi.fn()} />);
    ASSET_CATEGORIES.forEach((cat) => {
      expect(screen.getByRole('button', { name: cat.label })).toBeInTheDocument();
    });
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
