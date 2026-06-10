import { readCookie, readAccessTokenExpSeconds } from '@/utils/CookieUtils';

describe('CookieUtils', () => {
  afterEach(() => {
    document.cookie.split('; ').forEach((entry) => {
      const name = entry.split('=')[0];
      document.cookie = `${name}=; Path=/; Max-Age=0`;
    });
  });

  describe('readCookie', () => {
    it('returns the value of a present cookie decoded', () => {
      document.cookie = 'foo=hello%20world; Path=/';
      expect(readCookie('foo')).toBe('hello world');
    });

    it('returns null when the cookie is missing', () => {
      expect(readCookie('missing')).toBeNull();
    });

    it('does not match a cookie whose name is a prefix of another', () => {
      document.cookie = 'access_token_exp=123; Path=/';
      expect(readCookie('access_token')).toBeNull();
    });
  });

  describe('readAccessTokenExpSeconds', () => {
    it('returns the numeric value when the cookie is set', () => {
      document.cookie = 'access_token_exp=1717628400; Path=/';
      expect(readAccessTokenExpSeconds()).toBe(1717628400);
    });

    it('returns null when the cookie is missing', () => {
      expect(readAccessTokenExpSeconds()).toBeNull();
    });

    it('returns null when the cookie cannot be parsed to a finite number', () => {
      document.cookie = 'access_token_exp=not-a-number; Path=/';
      expect(readAccessTokenExpSeconds()).toBeNull();
    });
  });
});
