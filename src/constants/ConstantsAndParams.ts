/**
 * Central catalogue of UI labels, placeholders, validation messages and
 * notification texts for the NJPlastic frontend. Mirrors the IEMS
 * ConstantsAndParams.ts convention: every domain block carries a KEY (used
 * by NotificationUtils.destroy to deduplicate stacked notifications) and a
 * NOTIFICATIONS sub-tree split into WARNING/ERROR/SUCCESS, each with
 * KEYS/TITLES/MESSAGES. MESSAGES may be a literal string or a function
 * when the text depends on runtime values.
 */

export const UTILS = {
  DATE_FORMATS: {
    DISPLAY: 'DD/MM/YYYY HH:mm',
    ISO: 'YYYY-MM-DDTHH:mm:ssZ',
    ISO_DATE: 'YYYY-MM-DD',
    ISO_TIME: 'HH:mm:ss',
    FILENAME: 'YYYYMMDD-HHmmss',
    RANGE_PICKER: 'DD/MM/YYYY HH:mm',
  },
  DEFAULT_TIMEZONE: 'America/Sao_Paulo',
} as const;

export const GENERIC_NOTIFICATIONS = {
  CONFIGS: {
    PLACEMENT: 'topRight' as const,
    DURATION: 4.5,
  },
  KEYS: {
    SESSION_EXPIRED: 'generic-session-expired',
    UNAUTHORIZED: 'generic-unauthorized',
    INTERNAL_SERVER_ERROR: 'generic-internal-server-error',
    GENERIC_ERROR: 'generic-error',
  },
  TITLES: {
    SESSION_EXPIRED: 'Sessao expirada',
    UNAUTHORIZED: 'Acesso negado',
    INTERNAL_SERVER_ERROR: 'Erro interno',
    GENERIC_ERROR: 'Erro inesperado',
  },
  MESSAGES: {
    SESSION_EXPIRED: 'Faca login novamente para continuar.',
    UNAUTHORIZED: 'Voce nao tem permissao para esta operacao.',
    INTERNAL_SERVER_ERROR: 'O servidor encontrou um erro. Tente novamente em instantes.',
    GENERIC_ERROR: 'Nao foi possivel concluir a operacao.',
  },
} as const;

export const AUTH = {
  KEY: 'auth',
  LOGIN: {
    LABELS: {
      LOGIN: 'Usuario',
      PASSWORD: 'Senha',
      SUBMIT: 'Entrar',
    },
    PLACEHOLDERS: {
      LOGIN: 'Digite seu usuario',
      PASSWORD: 'Digite sua senha',
    },
    BUTTONS: {
      SUBMIT: 'Entrar',
    },
    VALIDATION_MESSAGES: {
      LOGIN_REQUIRED: 'Informe o usuario.',
      PASSWORD_REQUIRED: 'Informe a senha.',
      PASSWORD_MIN_LENGTH: (min: number) => `A senha deve ter pelo menos ${min} caracteres.`,
    },
  },
  NOTIFICATIONS: {
    WARNING: { KEYS: {}, TITLES: {}, MESSAGES: {} },
    ERROR: {
      KEYS: { INVALID_CREDENTIALS: 'auth-invalid-credentials' },
      TITLES: { INVALID_CREDENTIALS: 'Credenciais invalidas' },
      MESSAGES: { INVALID_CREDENTIALS: 'Usuario ou senha incorretos.' },
    },
    SUCCESS: {
      KEYS: { LOGIN: 'auth-login-success' },
      TITLES: { LOGIN: 'Sessao iniciada' },
      MESSAGES: { LOGIN: 'Bem-vindo de volta.' },
    },
  },
} as const;

export const MACHINES = {
  KEY: 'machines',
  LIST: {
    LABELS: {
      CODE: 'Codigo',
      DESCRIPTION: 'Descricao',
      SECTOR: 'Setor',
      STANDARD_CYCLE_MS: 'Ciclo padrao (ms)',
      CONSECUTIVE_PAUSES_TO_STOP: 'Pausas para parada',
      CURRENT_STATE: 'Estado atual',
      ACTIVE: 'Ativa',
    },
    KEYS: {
      CODE: 'code',
      DESCRIPTION: 'description',
      SECTOR: 'sector',
      STANDARD_CYCLE_MS: 'standardCycleMs',
      CONSECUTIVE_PAUSES_TO_STOP: 'consecutivePausesToStop',
      CURRENT_STATE: 'currentState',
      ACTIVE: 'active',
    },
  },
  STATUS: {
    LABELS: {
      CURRENT: 'Estado atual',
      START_TIME: 'Inicio',
      END_TIME: 'Fim',
      REASON: 'Motivo',
      MESSAGE: 'Mensagem',
      AUTHOR: 'Autor',
    },
    KEYS: {
      STATE: 'state',
      START_TIME: 'startTime',
      END_TIME: 'endTime',
      REASON: 'reason',
      MESSAGE: 'message',
      REASON_AUTHOR_ID: 'reasonAuthorId',
    },
  },
  CYCLES: {
    LABELS: {
      PULSE_TIMESTAMP: 'Pulso',
      RECEIVED_AT: 'Recebido em',
      SEQUENCE: 'Sequencia',
      INTERVAL_MS: 'Intervalo (ms)',
      STATE: 'Estado',
    },
    KEYS: {
      PULSE_TIMESTAMP: 'pulseTimestamp',
      RECEIVED_AT: 'receivedAt',
      SEQUENCE: 'sequence',
      INTERVAL_MS: 'intervalMs',
      STATE: 'state',
    },
  },
  STOPS: {
    LABELS: { MESSAGE: 'Mensagem da parada' },
    KEYS: { MESSAGE: 'message' },
    EDIT_MODAL: {
      LABELS: { MESSAGE: 'Nova mensagem' },
      PLACEHOLDERS: { MESSAGE: 'Descreva a parada automatica' },
      BUTTONS: { SAVE: 'Salvar', CANCEL: 'Cancelar' },
      VALIDATION_MESSAGES: {
        MESSAGE_REQUIRED: 'Informe a mensagem.',
        MESSAGE_MAX_LENGTH: (max: number) => `Maximo de ${max} caracteres.`,
      },
    },
  },
  PAUSES: {
    LABELS: { REASON: 'Motivo da pausa' },
    KEYS: { REASON: 'reason' },
    REGISTER_MODAL: {
      LABELS: { REASON: 'Motivo' },
      PLACEHOLDERS: { REASON: 'Selecione ou descreva o motivo' },
      BUTTONS: { SAVE: 'Registrar', CANCEL: 'Cancelar' },
      VALIDATION_MESSAGES: {
        REASON_REQUIRED: 'Informe o motivo.',
        REASON_MAX_LENGTH: (max: number) => `Maximo de ${max} caracteres.`,
      },
    },
  },
  NOTIFICATIONS: {
    WARNING: {
      KEYS: { NO_MACHINES_IN_SCOPE: 'machines-empty-scope' },
      TITLES: { NO_MACHINES_IN_SCOPE: 'Nenhuma maquina visivel' },
      MESSAGES: {
        NO_MACHINES_IN_SCOPE:
          'Voce nao possui maquinas no seu setor. Consulte o gestor.',
      },
    },
    ERROR: {
      KEYS: {
        LIST_FAILED: 'machines-list-failed',
        STATUS_FAILED: 'machines-status-failed',
        PAUSE_CLASSIFY_FAILED: 'machines-pause-classify-failed',
        STOP_EDIT_FAILED: 'machines-stop-edit-failed',
      },
      TITLES: {
        LIST_FAILED: 'Falha ao listar maquinas',
        STATUS_FAILED: 'Falha ao carregar o estado da maquina',
        PAUSE_CLASSIFY_FAILED: 'Falha ao classificar a pausa',
        STOP_EDIT_FAILED: 'Falha ao editar mensagem da parada',
      },
      MESSAGES: {
        LIST_FAILED: 'Nao foi possivel carregar as maquinas.',
        STATUS_FAILED: 'Nao foi possivel carregar o estado atual.',
        PAUSE_CLASSIFY_FAILED:
          'Verifique se existe uma pausa pendente de classificacao.',
        STOP_EDIT_FAILED:
          'A mensagem so pode ser editada em registros AUTO_STOPPED.',
      },
    },
    SUCCESS: {
      KEYS: {
        PAUSE_CLASSIFIED: 'machines-pause-classified',
        STOP_MESSAGE_UPDATED: 'machines-stop-message-updated',
        QUALITY_REGISTERED: 'machines-quality-registered',
      },
      TITLES: {
        PAUSE_CLASSIFIED: 'Pausa classificada',
        STOP_MESSAGE_UPDATED: 'Mensagem atualizada',
        QUALITY_REGISTERED: 'Qualidade registrada',
      },
      MESSAGES: {
        PAUSE_CLASSIFIED: 'Motivo registrado na pausa atual.',
        STOP_MESSAGE_UPDATED: 'A mensagem da parada foi atualizada.',
        QUALITY_REGISTERED: 'Os apontamentos de qualidade foram salvos.',
      },
    },
  },
} as const;

export const OEE = {
  KEY: 'oee',
  LABELS: {
    AVAILABILITY: 'Disponibilidade',
    PERFORMANCE: 'Performance',
    QUALITY: 'Qualidade',
    OEE: 'OEE',
    PARTIAL: 'Resultado parcial',
    PERIOD: 'Periodo',
  },
  NOTIFICATIONS: {
    WARNING: {
      KEYS: { PARTIAL_RESULT: 'oee-partial' },
      TITLES: { PARTIAL_RESULT: 'OEE parcial' },
      MESSAGES: {
        PARTIAL_RESULT:
          'Sem registros de qualidade no periodo. O fator Qualidade nao foi calculado.',
      },
    },
    ERROR: {
      KEYS: { CALCULATION_FAILED: 'oee-calculation-failed' },
      TITLES: { CALCULATION_FAILED: 'Falha ao calcular OEE' },
      MESSAGES: { CALCULATION_FAILED: 'Nao foi possivel calcular o OEE.' },
    },
    SUCCESS: { KEYS: {}, TITLES: {}, MESSAGES: {} },
  },
} as const;

export const REPORTS = {
  KEY: 'reports',
  SHIFT: {
    LABELS: {
      PERIOD_START: 'Inicio',
      PERIOD_END: 'Fim',
      SECTOR: 'Setor',
      SHIFT: 'Turno',
      CONFIRMED_CYCLES: 'Ciclos confirmados',
      MANUAL_PAUSES: 'Pausas manuais',
      AUTO_STOPS: 'Paradas automaticas',
    },
    KEYS: {
      PERIOD_START: 'periodStart',
      PERIOD_END: 'periodEnd',
      SECTOR: 'sector',
      SHIFT: 'shift',
      CONFIRMED_CYCLES: 'confirmedCycles',
      MANUAL_PAUSES: 'manualPauses',
      AUTO_STOPS: 'autoStops',
    },
  },
  NOTIFICATIONS: {
    WARNING: { KEYS: {}, TITLES: {}, MESSAGES: {} },
    ERROR: {
      KEYS: { LOAD_FAILED: 'reports-load-failed' },
      TITLES: { LOAD_FAILED: 'Falha ao gerar o relatorio' },
      MESSAGES: { LOAD_FAILED: 'Nao foi possivel gerar o relatorio do turno.' },
    },
    SUCCESS: { KEYS: {}, TITLES: {}, MESSAGES: {} },
  },
} as const;
