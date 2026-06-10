import { decodeJwtPayload, isJwtExpired } from '@/utils/JwtUtils';

const encodeBase64Url = (json: object): string => {
  const text = JSON.stringify(json);
  const base64 = Buffer.from(text, 'utf-8').toString('base64');
  return base64.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const buildJwt = (payload: object): string => {
  const header = encodeBase64Url({ alg: 'HS256', typ: 'JWT' });
  const body = encodeBase64Url(payload);
  return `${header}.${body}.signature`;
};

describe('JwtUtils', () => {
  describe('decodeJwtPayload', () => {
    it('decodes the payload of a well-formed JWT', () => {
      const payload = { sub: 'manager', role: 'MANAGER', exp: 1717628400 };
      const token = buildJwt(payload);

      expect(decodeJwtPayload(token)).toEqual(payload);
    });

    it('returns null when the token does not have three parts', () => {
      expect(decodeJwtPayload('only.one.part.too.many')).toBeNull();
      expect(decodeJwtPayload('one-part')).toBeNull();
    });

    it('returns null when the payload is not valid JSON', () => {
      const header = encodeBase64Url({ alg: 'HS256' });
      const malformed = Buffer.from('not json', 'utf-8').toString('base64').replace(/=+$/, '');
      expect(decodeJwtPayload(`${header}.${malformed}.sig`)).toBeNull();
    });
  });

  describe('isJwtExpired', () => {
    it('returns true when the payload is null', () => {
      expect(isJwtExpired(null, 1000)).toBe(true);
    });

    it('returns true when exp is missing or not a number', () => {
      expect(isJwtExpired({} as never, 1000)).toBe(true);
      expect(isJwtExpired({ exp: 'soon' } as never, 1000)).toBe(true);
    });

    it('returns true when exp is in the past or equal to now', () => {
      expect(isJwtExpired({ exp: 999 }, 1000)).toBe(true);
      expect(isJwtExpired({ exp: 1000 }, 1000)).toBe(true);
    });

    it('returns false when exp is in the future', () => {
      expect(isJwtExpired({ exp: 1001 }, 1000)).toBe(false);
    });
  });
});
