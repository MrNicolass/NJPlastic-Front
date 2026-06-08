import { njPalette, njTheme } from '@/theme/njTheme';

describe('njPalette', () => {
  it('exposes the NJPlastic brand colors', () => {
    expect(njPalette.cobalt).toBe('#1168BD');
    expect(njPalette.cerulean).toBe('#2596BE');
    expect(njPalette.tealDeep).toBe('#296274');
    expect(njPalette.charcoal).toBe('#2D2D2A');
    expect(njPalette.warmGray).toBe('#80807A');
    expect(njPalette.cinnabar).toBe('#C14953');
    expect(njPalette.bone).toBe('#E5DCC5');
  });

  it.each(Object.entries(njPalette))('uses a 6-digit hex value for %s', (_, value) => {
    expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe('njTheme', () => {
  it('maps the primary tokens to the corresponding palette colors', () => {
    expect(njTheme.token?.colorPrimary).toBe(njPalette.cobalt);
    expect(njTheme.token?.colorInfo).toBe(njPalette.cerulean);
    expect(njTheme.token?.colorTextBase).toBe(njPalette.charcoal);
    expect(njTheme.token?.colorTextSecondary).toBe(njPalette.warmGray);
    expect(njTheme.token?.colorBorder).toBe(njPalette.warmGray);
    expect(njTheme.token?.colorError).toBe(njPalette.cinnabar);
    expect(njTheme.token?.colorBgLayout).toBe(njPalette.bone);
  });

  it('uses the IBM Plex Sans CSS variable as the base font family', () => {
    expect(njTheme.token?.fontFamily).toBe('var(--font-ibm-plex-sans), sans-serif');
  });

  it('overrides the Layout sider and header backgrounds with tealDeep', () => {
    expect(njTheme.components?.Layout?.siderBg).toBe(njPalette.tealDeep);
    expect(njTheme.components?.Layout?.headerBg).toBe(njPalette.tealDeep);
  });
});
