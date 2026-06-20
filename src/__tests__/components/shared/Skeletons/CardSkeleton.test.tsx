import { render } from '@testing-library/react';
import { CardSkeleton } from '@/components/shared/Skeletons/CardSkeleton';

describe('CardSkeleton', () => {
  it('renders an antd Card with an active skeleton inside', () => {
    const { container } = render(<CardSkeleton />);

    expect(container.querySelector('.ant-card')).toBeInTheDocument();
    const skeleton = container.querySelector('.ant-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton?.className).toContain('active');
  });

  it('renders the default number of paragraph rows', () => {
    const { container } = render(<CardSkeleton />);

    const rows = container.querySelectorAll('.ant-skeleton-paragraph > li');
    expect(rows.length).toBe(3);
  });

  it('renders the custom number of paragraph rows when supplied', () => {
    const { container } = render(<CardSkeleton rows={7} />);

    const rows = container.querySelectorAll('.ant-skeleton-paragraph > li');
    expect(rows.length).toBe(7);
  });

  it('propagates the style prop to the underlying Card', () => {
    const { container } = render(<CardSkeleton style={{ marginTop: 42 }} />);

    const card = container.querySelector('.ant-card') as HTMLElement;
    expect(card.style.marginTop).toBe('42px');
  });
});
