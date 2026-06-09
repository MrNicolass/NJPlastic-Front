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
    SESSION_EXPIRED: 'Sessão expirada',
    UNAUTHORIZED: 'Acesso negado',
    INTERNAL_SERVER_ERROR: 'Erro interno',
    GENERIC_ERROR: 'Erro inesperado',
  },
  MESSAGES: {
    SESSION_EXPIRED: 'Faça login novamente para continuar.',
    UNAUTHORIZED: 'Você não tem permissão para esta operação.',
    INTERNAL_SERVER_ERROR: 'O servidor encontrou um erro. Tente novamente em instantes.',
    GENERIC_ERROR: 'Não foi possível concluir a operação.',
  },
} as const;

export const AUTH = {
  KEY: 'auth',
  LOGIN: {
    LABELS: {
      LOGIN: 'Usuário',
      PASSWORD: 'Senha',
      SUBMIT: 'Entrar',
      REMEMBER: 'Manter sessão neste dispositivo',
      FORGOT_PASSWORD: 'Esqueci minha senha',
      SSO: 'SSO corporativo',
      SSO_TOOLTIP: 'Em breve',
    },
    PLACEHOLDERS: {
      LOGIN: 'Digite seu usuário',
      PASSWORD: 'Digite sua senha',
    },
    BUTTONS: {
      SUBMIT: 'Entrar',
    },
    VALIDATION_MESSAGES: {
      LOGIN_REQUIRED: 'Informe o usuário.',
      PASSWORD_REQUIRED: 'Informe a senha.',
      PASSWORD_MIN_LENGTH: (min: number) => `A senha deve ter pelo menos ${min} caracteres.`,
    },
  },
  PASSWORD_RESET: {
    REQUEST: {
      TITLE: 'Esqueci minha senha',
      DESCRIPTION:
        'Informe seu usuário e enviaremos um link para redefinir a senha caso a conta exista.',
      LABELS: { LOGIN: 'Usuário' },
      PLACEHOLDERS: { LOGIN: 'Digite seu usuário' },
      BUTTONS: { SUBMIT: 'Enviar link', BACK: 'Voltar ao login' },
      VALIDATION_MESSAGES: { LOGIN_REQUIRED: 'Informe o usuário.' },
    },
    CONFIRM: {
      TITLE: 'Redefinir senha',
      DESCRIPTION:
        'Defina uma nova senha. Use ao menos 12 caracteres com letras, números e símbolos.',
      LABELS: { NEW_PASSWORD: 'Nova senha', CONFIRM_PASSWORD: 'Confirmar senha' },
      PLACEHOLDERS: {
        NEW_PASSWORD: 'Digite a nova senha',
        CONFIRM_PASSWORD: 'Confirme a nova senha',
      },
      BUTTONS: { SUBMIT: 'Salvar nova senha', BACK: 'Voltar ao login' },
      VALIDATION_MESSAGES: {
        NEW_PASSWORD_REQUIRED: 'Informe a nova senha.',
        CONFIRM_REQUIRED: 'Confirme a nova senha.',
        MISMATCH: 'As senhas não coincidem.',
        MIN_LENGTH: (min: number) => `A senha deve ter pelo menos ${min} caracteres.`,
        MISSING_TOKEN: 'Link inválido. Solicite uma nova recuperação de senha.',
      },
    },
  },
  ERROR_PAGES: {
    UNAUTHORIZED: {
      TITLE: 'Sessão expirada',
      MESSAGE: 'Sua sessão expirou. Faça login novamente para continuar.',
      BUTTON: 'Voltar ao login',
    },
    FORBIDDEN: {
      TITLE: 'Acesso negado',
      MESSAGE: 'Você não tem permissão para acessar esta página.',
      BUTTON: 'Voltar ao dashboard',
    },
  },
  NOTIFICATIONS: {
    WARNING: { KEYS: {}, TITLES: {}, MESSAGES: {} },
    ERROR: {
      KEYS: {
        INVALID_CREDENTIALS: 'auth-invalid-credentials',
        RESET_TOKEN_INVALID: 'auth-reset-token-invalid',
        LOGOUT_FAILED: 'auth-logout-failed',
      },
      TITLES: {
        INVALID_CREDENTIALS: 'Credenciais inválidas',
        RESET_TOKEN_INVALID: 'Link inválido ou expirado',
        LOGOUT_FAILED: 'Falha ao encerrar sessão',
      },
      MESSAGES: {
        INVALID_CREDENTIALS: 'Usuário ou senha incorretos.',
        RESET_TOKEN_INVALID:
          'Solicite uma nova recuperação de senha para gerar um novo link.',
        LOGOUT_FAILED: 'Não foi possível encerrar a sessão no servidor.',
      },
    },
    SUCCESS: {
      KEYS: {
        LOGIN: 'auth-login-success',
        LOGOUT: 'auth-logout-success',
        PASSWORD_RESET_REQUESTED: 'auth-password-reset-requested',
        PASSWORD_RESET_CONFIRMED: 'auth-password-reset-confirmed',
      },
      TITLES: {
        LOGIN: 'Sessão iniciada',
        LOGOUT: 'Sessão encerrada',
        PASSWORD_RESET_REQUESTED: 'Solicitação recebida',
        PASSWORD_RESET_CONFIRMED: 'Senha redefinida',
      },
      MESSAGES: {
        LOGIN: 'Bem-vindo de volta.',
        LOGOUT: 'Você saiu da plataforma.',
        PASSWORD_RESET_REQUESTED:
          'Se a conta existir, você receberá um email com o link de redefinição.',
        PASSWORD_RESET_CONFIRMED: 'Senha atualizada. Faça login com a nova senha.',
      },
    },
  },
} as const;

export const MACHINES = {
  KEY: 'machines',
  LIST: {
    LABELS: {
      CODE: 'Código',
      DESCRIPTION: 'Descrição',
      SECTOR: 'Setor',
      STANDARD_CYCLE_MS: 'Ciclo padrão (ms)',
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
      START_TIME: 'Início',
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
      SEQUENCE: 'Sequência',
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
      PLACEHOLDERS: { MESSAGE: 'Descreva a parada automática' },
      BUTTONS: { SAVE: 'Salvar', CANCEL: 'Cancelar' },
      VALIDATION_MESSAGES: {
        MESSAGE_REQUIRED: 'Informe a mensagem.',
        MESSAGE_MAX_LENGTH: (max: number) => `Máximo de ${max} caracteres.`,
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
        REASON_MAX_LENGTH: (max: number) => `Máximo de ${max} caracteres.`,
      },
    },
  },
  NOTIFICATIONS: {
    WARNING: {
      KEYS: { NO_MACHINES_IN_SCOPE: 'machines-empty-scope' },
      TITLES: { NO_MACHINES_IN_SCOPE: 'Nenhuma máquina visível' },
      MESSAGES: {
        NO_MACHINES_IN_SCOPE:
          'Você não possui máquinas no seu setor. Consulte o gestor.',
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
        LIST_FAILED: 'Falha ao listar máquinas',
        STATUS_FAILED: 'Falha ao carregar o estado da máquina',
        PAUSE_CLASSIFY_FAILED: 'Falha ao classificar a pausa',
        STOP_EDIT_FAILED: 'Falha ao editar mensagem da parada',
      },
      MESSAGES: {
        LIST_FAILED: 'Não foi possível carregar as máquinas.',
        STATUS_FAILED: 'Não foi possível carregar o estado atual.',
        PAUSE_CLASSIFY_FAILED:
          'Verifique se existe uma pausa pendente de classificação.',
        STOP_EDIT_FAILED:
          'A mensagem só pode ser editada em registros AUTO_STOPPED.',
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
    PERIOD: 'Período',
  },
  NOTIFICATIONS: {
    WARNING: {
      KEYS: { PARTIAL_RESULT: 'oee-partial' },
      TITLES: { PARTIAL_RESULT: 'OEE parcial' },
      MESSAGES: {
        PARTIAL_RESULT:
          'Sem registros de qualidade no período. O fator Qualidade não foi calculado.',
      },
    },
    ERROR: {
      KEYS: { CALCULATION_FAILED: 'oee-calculation-failed' },
      TITLES: { CALCULATION_FAILED: 'Falha ao calcular OEE' },
      MESSAGES: { CALCULATION_FAILED: 'Não foi possível calcular o OEE.' },
    },
    SUCCESS: { KEYS: {}, TITLES: {}, MESSAGES: {} },
  },
} as const;

export const REPORTS = {
  KEY: 'reports',
  SHIFT: {
    LABELS: {
      PERIOD_START: 'Início',
      PERIOD_END: 'Fim',
      SECTOR: 'Setor',
      SHIFT: 'Turno',
      CONFIRMED_CYCLES: 'Ciclos confirmados',
      MANUAL_PAUSES: 'Pausas manuais',
      AUTO_STOPS: 'Paradas automáticas',
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
      TITLES: { LOAD_FAILED: 'Falha ao gerar o relatório' },
      MESSAGES: { LOAD_FAILED: 'Não foi possível gerar o relatório do turno.' },
    },
    SUCCESS: { KEYS: {}, TITLES: {}, MESSAGES: {} },
  },
} as const;

export const LAYOUT = {
  KEY: 'layout',
  HEADER: {
    LABELS: {
      LOGO_TITLE: 'NJPlastic',
      LOGO_SUBTITLE: 'Meplas - Monitoramento de injetoras',
      LOGOUT_BUTTON: 'Sair',
      ROLE_OPERATOR: 'Operador',
      ROLE_LEADER: 'Líder de turno',
      ROLE_MANAGER: 'Gestor',
      ROLE_ADMIN: 'Administrador',
    },
  },
  SIDER: {
    LABELS: {
      DASHBOARD: 'Chão de fábrica',
      MACHINES: 'Máquinas',
      ORDERS: 'Ordens de produção',
      HISTORY: 'Histórico',
      REPORTS: 'Relatórios',
      ACCOUNT: 'Minha conta',
      ADMIN_GROUP: 'Administração',
      USERS: 'Usuários',
      ERP: 'Integração ERP',
      AUDIT: 'Auditoria',
      COLLAPSE: 'Recolher menu',
      EXPAND: 'Expandir menu',
    },
  },
  NOTIFICATIONS: {
    WARNING: { KEYS: {}, TITLES: {}, MESSAGES: {} },
    ERROR: { KEYS: {}, TITLES: {}, MESSAGES: {} },
    SUCCESS: { KEYS: {}, TITLES: {}, MESSAGES: {} },
  },
} as const;
