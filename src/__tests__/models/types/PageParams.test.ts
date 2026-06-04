import { createPageParams, type PageParams } from '@/models/types/PageParams';

describe('createPageParams', () => {
  it('builds a PageParams object without sort when sort is omitted', () => {
    const result = createPageParams(0, 20);

    expect(result).toEqual({ page: 0, size: 20 });
    expect(result).not.toHaveProperty('sort');
  });

  it('builds a PageParams object without sort when sort is undefined', () => {
    const result = createPageParams(2, 50, undefined);

    expect(result).toEqual({ page: 2, size: 50 });
    expect(result).not.toHaveProperty('sort');
  });

  it('includes sort when provided', () => {
    const result = createPageParams(1, 10, 'pulseTimestamp,desc');

    expect(result).toEqual({ page: 1, size: 10, sort: 'pulseTimestamp,desc' });
  });

  it('omits sort when an empty string is supplied', () => {
    const result = createPageParams(0, 25, '');

    expect(result).toEqual({ page: 0, size: 25 });
    expect(result).not.toHaveProperty('sort');
  });

  it('returns a value matching the PageParams type', () => {
    const result: PageParams = createPageParams(3, 30, 'code,asc');

    expect(result.page).toBe(3);
    expect(result.size).toBe(30);
    expect(result.sort).toBe('code,asc');
  });
});
