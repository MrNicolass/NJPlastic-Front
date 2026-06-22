import { render } from '@testing-library/react';
import { TableSkeleton } from '@/components/shared/Skeletons/TableSkeleton';

describe('TableSkeleton', () => {
  it('renders the header strip plus the default number of row blocks', () => {
    const { container } = render(<TableSkeleton />);

    expect(container.querySelector('.ant-skeleton-input')).toBeInTheDocument();
    const skeletons = container.querySelectorAll('.ant-skeleton');
    // 1 header (Skeleton.Input) + 5 default body Skeletons
    expect(skeletons.length).toBe(6);
  });

  it('renders the supplied number of row blocks', () => {
    const { container } = render(<TableSkeleton rowCount={8} />);

    const skeletons = container.querySelectorAll('.ant-skeleton');
    expect(skeletons.length).toBe(9);
  });

  it('renders no body rows when rowCount is zero', () => {
    const { container } = render(<TableSkeleton rowCount={0} />);

    const skeletons = container.querySelectorAll('.ant-skeleton');
    expect(skeletons.length).toBe(1);
  });
});
