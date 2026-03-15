import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TemplatePanel from './TemplatePanel';
import { TEMPLATES, CATEGORIES } from '../data/templates';

describe('TemplatePanel — 초기 렌더링', () => {
  it('전체 탭이 활성화된 상태로 렌더링된다', () => {
    render(<TemplatePanel onSelect={vi.fn()} />);
    const allTab = screen.getByRole('button', { name: '전체' });
    expect(allTab).toHaveClass('active');
  });

  it('모든 카테고리 탭이 렌더링된다', () => {
    render(<TemplatePanel onSelect={vi.fn()} />);
    CATEGORIES.forEach((cat) => {
      expect(screen.getByRole('button', { name: cat })).toBeInTheDocument();
    });
  });

  it('초기에 모든 템플릿이 표시된다', () => {
    render(<TemplatePanel onSelect={vi.fn()} />);
    TEMPLATES.forEach((tpl) => {
      expect(screen.getByTitle(tpl.name)).toBeInTheDocument();
    });
  });
});

describe('TemplatePanel — 카테고리 필터', () => {
  it('카테고리 탭을 클릭하면 해당 카테고리 템플릿만 표시된다', async () => {
    const user = userEvent.setup();
    render(<TemplatePanel onSelect={vi.fn()} />);

    const targetCategory = CATEGORIES[0]; // 첫 번째 카테고리
    await user.click(screen.getByRole('button', { name: targetCategory }));

    // 해당 카테고리 템플릿만 title로 표시되어야 함
    const expectedTemplates = TEMPLATES.filter((t) => t.category === targetCategory);
    const otherTemplates = TEMPLATES.filter((t) => t.category !== targetCategory);

    expectedTemplates.forEach((tpl) => {
      expect(screen.getByTitle(tpl.name)).toBeInTheDocument();
    });
    otherTemplates.forEach((tpl) => {
      expect(screen.queryByTitle(tpl.name)).not.toBeInTheDocument();
    });
  });

  it('카테고리 탭 클릭 시 해당 탭이 active 클래스를 갖는다', async () => {
    const user = userEvent.setup();
    render(<TemplatePanel onSelect={vi.fn()} />);

    const targetCategory = CATEGORIES[0];
    const catButton = screen.getByRole('button', { name: targetCategory });
    await user.click(catButton);

    expect(catButton).toHaveClass('active');
  });

  it('카테고리 탭 클릭 후 전체 탭은 active 클래스를 잃는다', async () => {
    const user = userEvent.setup();
    render(<TemplatePanel onSelect={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: CATEGORIES[0] }));

    expect(screen.getByRole('button', { name: '전체' })).not.toHaveClass('active');
  });

  it('전체 탭을 클릭하면 모든 템플릿이 다시 표시된다', async () => {
    const user = userEvent.setup();
    render(<TemplatePanel onSelect={vi.fn()} />);

    // 카테고리로 필터 후 전체로 돌아오기
    await user.click(screen.getByRole('button', { name: CATEGORIES[0] }));
    await user.click(screen.getByRole('button', { name: '전체' }));

    TEMPLATES.forEach((tpl) => {
      expect(screen.getByTitle(tpl.name)).toBeInTheDocument();
    });
  });
});

describe('TemplatePanel — 템플릿 선택', () => {
  it('템플릿 클릭 시 onSelect 콜백이 호출된다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TemplatePanel onSelect={onSelect} />);

    const firstTemplate = TEMPLATES[0];
    await user.click(screen.getByTitle(firstTemplate.name));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('템플릿 클릭 시 onSelect에 해당 템플릿 데이터가 전달된다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TemplatePanel onSelect={onSelect} />);

    const firstTemplate = TEMPLATES[0];
    await user.click(screen.getByTitle(firstTemplate.name));

    expect(onSelect).toHaveBeenCalledWith(firstTemplate);
  });
});
