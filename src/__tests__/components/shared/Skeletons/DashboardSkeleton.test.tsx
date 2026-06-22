import { render } from '@testing-library/react';
import { DashboardSkeleton } from '@/components/shared/Skeletons/DashboardSkeleton';

// jsdom does not implement matchMedia, which antd's responsive Row/Col observe.
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

describe('DashboardSkeleton', () => {
  it('renders the default number of card skeletons in a responsive grid', () => {
    const { container } = render(<DashboardSkeleton />);

    expect(container.querySelector('.ant-row')).toBeInTheDocument();
    const cards = container.querySelectorAll('.ant-card');
    expect(cards.length).toBe(4);
  });

  it('renders the supplied number of card skeletons', () => {
    const { container } = render(<DashboardSkeleton cardCount={6} />);

    const cards = container.querySelectorAll('.ant-card');
    expect(cards.length).toBe(6);
  });

  it('renders no card when cardCount is zero', () => {
    const { container } = render(<DashboardSkeleton cardCount={0} />);

    const cards = container.querySelectorAll('.ant-card');
    expect(cards.length).toBe(0);
  });
});
