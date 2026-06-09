import type { ThemeConfig } from 'antd';

export const njPalette = {
  cobalt: '#1168BD',
  cerulean: '#2596BE',
  tealDeep: '#296274',
  charcoal: '#2D2D2A',
  warmGray: '#80807A',
  cinnabar: '#C14953',
  bone: '#E5DCC5',
} as const;

export const njTheme: ThemeConfig = {
  token: {
    colorPrimary: njPalette.cobalt,
    colorInfo: njPalette.cerulean,
    colorTextBase: njPalette.charcoal,
    colorTextSecondary: njPalette.warmGray,
    colorBorder: njPalette.warmGray,
    colorError: njPalette.cinnabar,
    colorBgLayout: njPalette.bone,
    fontFamily: 'var(--font-ibm-plex-sans), sans-serif',
  },
  components: {
    Layout: {
      siderBg: njPalette.tealDeep,
      headerBg: njPalette.tealDeep,
    },
    Menu: {
      darkItemBg: njPalette.tealDeep,
      darkSubMenuItemBg: njPalette.tealDeep,
      darkItemColor: '#fff',
      darkItemHoverBg: njPalette.cerulean,
      darkItemHoverColor: '#fff',
      darkItemSelectedBg: njPalette.cobalt,
      darkItemSelectedColor: '#fff',
      darkGroupTitleColor: njPalette.bone,
    },
  },
};
