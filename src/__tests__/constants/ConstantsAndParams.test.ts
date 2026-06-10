import {
  AUTH,
  GENERIC_NOTIFICATIONS,
  MACHINES,
  OEE,
  REPORTS,
  UTILS,
} from '@/constants/ConstantsAndParams';

describe('ConstantsAndParams', () => {
  describe('UTILS', () => {
    it('exposes the date format catalogue and default timezone', () => {
      expect(UTILS.DATE_FORMATS.DISPLAY).toBe('DD/MM/YYYY HH:mm');
      expect(UTILS.DATE_FORMATS.ISO).toBe('YYYY-MM-DDTHH:mm:ssZ');
      expect(UTILS.DATE_FORMATS.ISO_DATE).toBe('YYYY-MM-DD');
      expect(UTILS.DATE_FORMATS.ISO_TIME).toBe('HH:mm:ss');
      expect(UTILS.DATE_FORMATS.FILENAME).toBe('YYYYMMDD-HHmmss');
      expect(UTILS.DATE_FORMATS.RANGE_PICKER).toBe('DD/MM/YYYY HH:mm');
      expect(UTILS.DEFAULT_TIMEZONE).toBe('America/Sao_Paulo');
    });
  });

  describe('GENERIC_NOTIFICATIONS', () => {
    it('mirrors KEYS, TITLES and MESSAGES with the same default-type union', () => {
      const keys = Object.keys(GENERIC_NOTIFICATIONS.KEYS).sort();
      const titles = Object.keys(GENERIC_NOTIFICATIONS.TITLES).sort();
      const messages = Object.keys(GENERIC_NOTIFICATIONS.MESSAGES).sort();

      expect(keys).toEqual(titles);
      expect(keys).toEqual(messages);
      expect(keys).toEqual([
        'GENERIC_ERROR',
        'INTERNAL_SERVER_ERROR',
        'SESSION_EXPIRED',
        'UNAUTHORIZED',
      ]);
    });

    it('uses the topRight placement and the default duration', () => {
      expect(GENERIC_NOTIFICATIONS.CONFIGS.PLACEMENT).toBe('topRight');
      expect(GENERIC_NOTIFICATIONS.CONFIGS.DURATION).toBe(4.5);
    });
  });

  describe('AUTH', () => {
    it('exposes the login screen labels and validation messages', () => {
      expect(AUTH.KEY).toBe('auth');
      expect(AUTH.LOGIN.LABELS.LOGIN).toBe('Usuário');
      expect(AUTH.LOGIN.LABELS.PASSWORD).toBe('Senha');
      expect(AUTH.LOGIN.BUTTONS.SUBMIT).toBe('Entrar');
      expect(AUTH.LOGIN.VALIDATION_MESSAGES.LOGIN_REQUIRED).toBe('Informe o usuário.');
      expect(AUTH.LOGIN.VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH(8)).toBe(
        'A senha deve ter pelo menos 8 caracteres.',
      );
    });

    it('exposes the invalid credentials notification trio', () => {
      expect(AUTH.NOTIFICATIONS.ERROR.KEYS.INVALID_CREDENTIALS).toBe('auth-invalid-credentials');
      expect(AUTH.NOTIFICATIONS.ERROR.TITLES.INVALID_CREDENTIALS).toBe('Credenciais inválidas');
      expect(AUTH.NOTIFICATIONS.ERROR.MESSAGES.INVALID_CREDENTIALS).toBe(
        'Usuário ou senha incorretos.',
      );
    });
  });

  describe('MACHINES', () => {
    it('groups list, status, cycles, stops and pauses dictionaries', () => {
      expect(MACHINES.KEY).toBe('machines');
      expect(MACHINES.LIST.KEYS.CODE).toBe('code');
      expect(MACHINES.STATUS.KEYS.STATE).toBe('state');
      expect(MACHINES.CYCLES.KEYS.PULSE_TIMESTAMP).toBe('pulseTimestamp');
      expect(MACHINES.STOPS.EDIT_MODAL.VALIDATION_MESSAGES.MESSAGE_MAX_LENGTH(140)).toBe(
        'Maximo de 140 caracteres.',
      );
      expect(MACHINES.PAUSES.REGISTER_MODAL.VALIDATION_MESSAGES.REASON_MAX_LENGTH(80)).toBe(
        'Maximo de 80 caracteres.',
      );
    });

    it('exposes the SUCCESS notification trio for pause classification', () => {
      expect(MACHINES.NOTIFICATIONS.SUCCESS.KEYS.PAUSE_CLASSIFIED).toBe(
        'machines-pause-classified',
      );
      expect(MACHINES.NOTIFICATIONS.SUCCESS.TITLES.PAUSE_CLASSIFIED).toBe('Pausa classificada');
      expect(MACHINES.NOTIFICATIONS.SUCCESS.MESSAGES.PAUSE_CLASSIFIED).toBe(
        'Motivo registrado na pausa atual.',
      );
    });

    it('exposes ERROR notifications for every machine-bound failure path', () => {
      expect(MACHINES.NOTIFICATIONS.ERROR.KEYS.LIST_FAILED).toBe('machines-list-failed');
      expect(MACHINES.NOTIFICATIONS.ERROR.KEYS.STATUS_FAILED).toBe('machines-status-failed');
      expect(MACHINES.NOTIFICATIONS.ERROR.KEYS.PAUSE_CLASSIFY_FAILED).toBe(
        'machines-pause-classify-failed',
      );
      expect(MACHINES.NOTIFICATIONS.ERROR.KEYS.STOP_EDIT_FAILED).toBe('machines-stop-edit-failed');
    });
  });

  describe('OEE', () => {
    it('exposes the OEE labels and notification keys', () => {
      expect(OEE.KEY).toBe('oee');
      expect(OEE.LABELS.AVAILABILITY).toBe('Disponibilidade');
      expect(OEE.LABELS.PERFORMANCE).toBe('Performance');
      expect(OEE.LABELS.QUALITY).toBe('Qualidade');
      expect(OEE.NOTIFICATIONS.WARNING.KEYS.PARTIAL_RESULT).toBe('oee-partial');
      expect(OEE.NOTIFICATIONS.ERROR.KEYS.CALCULATION_FAILED).toBe('oee-calculation-failed');
    });
  });

  describe('REPORTS', () => {
    it('exposes the shift report dictionaries', () => {
      expect(REPORTS.KEY).toBe('reports');
      expect(REPORTS.SHIFT.KEYS.PERIOD_START).toBe('periodStart');
      expect(REPORTS.SHIFT.KEYS.CONFIRMED_CYCLES).toBe('confirmedCycles');
      expect(REPORTS.NOTIFICATIONS.ERROR.KEYS.LOAD_FAILED).toBe('reports-load-failed');
    });
  });
});
