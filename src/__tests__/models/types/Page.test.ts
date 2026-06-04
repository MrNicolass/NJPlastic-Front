import type { Page } from '@/models/types/Page';

describe('Page<T>', () => {
  it('accepts a fully populated page shape', () => {
    const page: Page<{ id: string }> = {
      content: [{ id: 'a' }, { id: 'b' }],
      totalElements: 2,
      totalPages: 1,
      size: 20,
      number: 0,
      first: true,
      last: true,
      numberOfElements: 2,
      empty: false,
    };

    expect(page.content).toHaveLength(2);
    expect(page.totalElements).toBe(2);
    expect(page.totalPages).toBe(1);
    expect(page.size).toBe(20);
    expect(page.number).toBe(0);
    expect(page.first).toBe(true);
    expect(page.last).toBe(true);
    expect(page.numberOfElements).toBe(2);
    expect(page.empty).toBe(false);
  });

  it('accepts an empty page shape', () => {
    const page: Page<number> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
      first: true,
      last: true,
      numberOfElements: 0,
      empty: true,
    };

    expect(page.content).toEqual([]);
    expect(page.empty).toBe(true);
  });
});
