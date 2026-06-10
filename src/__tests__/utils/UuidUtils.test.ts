import { isUuid, UUID_REGEX } from '@/utils/UuidUtils';

describe('UuidUtils', () => {
  describe('UUID_REGEX', () => {
    it.each([
      'a0000000-0001-4001-8001-000000000001',
      '3f1c2b9e-7a4d-4e2a-9b8c-1d2e3f4a5b6c',
      'A0000000-0001-4001-8001-000000000001',
    ])('matches valid UUID %s', (value) => {
      expect(UUID_REGEX.test(value)).toBe(true);
    });

    it.each([
      'a0000000-0001-4001-8001-00000000000', // 11 chars in last group
      'a0000000-0001-4001-8001-0000000000001', // 13 chars in last group
      'g0000000-0001-4001-8001-000000000001', // non-hex character
      'a000000000014001-8001-000000000001', // missing dashes
      '',
    ])('rejects invalid UUID %s', (value) => {
      expect(UUID_REGEX.test(value)).toBe(false);
    });
  });

  describe('isUuid', () => {
    it('returns true for a well-formed UUID', () => {
      expect(isUuid('a0000000-0001-4001-8001-000000000001')).toBe(true);
    });

    it('trims surrounding whitespace before testing', () => {
      expect(isUuid('  a0000000-0001-4001-8001-000000000001  ')).toBe(true);
    });

    it.each([null, undefined, '', '   '])('returns false for empty input %p', (value) => {
      expect(isUuid(value)).toBe(false);
    });

    it('returns false for a malformed UUID', () => {
      expect(isUuid('not-a-uuid')).toBe(false);
    });
  });
});
