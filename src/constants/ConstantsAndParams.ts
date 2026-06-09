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
  STATES: {
    RUNNING: 'RUNNING',
    PAUSED: 'PAUSED',
    AUTO_STOPPED: 'AUTO_STOPPED',
    OFFLINE: 'OFFLINE',
  },
  STATE_LABELS: {
    RUNNING: 'Produzindo',
    PAUSED: 'Em pausa',
    AUTO_STOPPED: 'Parada automatica',
    OFFLINE: 'Offline',
    UNKNOWN: 'Sem estado',
  },
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
  DASHBOARD: {
    LABELS: {
      GREETING: (name: string) => `Ola, ${name}`,
      SHIFT_COUNTERS_TITLE: 'Resumo do turno',
      COUNTER_RUNNING: 'Em producao',
      COUNTER_PAUSED: 'Em pausa',
      COUNTER_AUTO_STOPPED: 'Em parada automatica',
      EMPTY_TITLE: 'Nenhuma maquina visivel',
      EMPTY_DESCRIPTION: 'Voce nao possui maquinas atribuidas ao seu turno.',
      CARD_ORDER_FALLBACK: 'Sem OS em execucao',
      LAST_UPDATE: (at: string) => `Atualizado as ${at}`,
    },
    BUTTONS: {
      REGISTER_PAUSE: 'Registrar pausa',
      EDIT_STOP_MESSAGE: 'Editar mensagem da parada',
      VIEW_DETAIL: 'Ver detalhe',
    },
  },
  DETAIL: {
    LABELS: {
      HEADER_BADGE_PREFIX: 'Estado atual:',
      KPI_OEE: 'OEE',
      KPI_CYCLES: 'Ciclos',
      KPI_AVG_CYCLE_TIME: 'Tempo de ciclo medio',
      KPI_MTBF: 'MTBF',
      KPI_SCRAP: 'Refugo',
      KPI_AVAILABILITY: 'Disponibilidade',
      KPI_PERFORMANCE: 'Performance',
      KPI_QUALITY: 'Qualidade',
      CHART_TITLE: 'Tempo de ciclo (janela 30s) x banda de tolerancia',
      CHART_X_AXIS: 'Horario',
      CHART_Y_AXIS: 'Tempo (ms)',
      CHART_RANGE_4H: 'Ultimas 4h',
      CHART_RANGE_SHIFT: 'Turno',
      CHART_RANGE_24H: 'Ultimas 24h',
      CHART_RANGE_7D: 'Ultimos 7d',
      TIMELINE_TITLE: 'Linha do tempo do turno',
      STOPS_TABLE_TITLE: 'Pausas e paradas do turno',
      STOPS_COL_STATE: 'Estado',
      STOPS_COL_REASON: 'Motivo',
      STOPS_COL_MESSAGE: 'Mensagem',
      STOPS_COL_AUTHOR: 'Ultima edicao',
      STOPS_COL_START: 'Inicio',
      STOPS_COL_END: 'Fim',
      MOLD_TITLE: 'Ficha do molde',
      MOLD_CAVITIES: 'Cavidades ativas',
      MOLD_STANDARD_CYCLE: 'Ciclo padrao',
      MOLD_TOLERANCE: 'Fator de tolerancia',
      MOLD_CONSECUTIVE_PAUSES: 'Pausas consecutivas para parada',
      OPERATORS_TITLE: 'Operadores no turno',
      EXPORT_BUTTON: 'Exportar dados',
      BACK_BUTTON: 'Voltar ao dashboard',
    },
    BUTTONS: {
      REGISTER_QUALITY: 'Registrar qualidade',
      EDIT_STOP_MESSAGE: 'Editar mensagem da parada',
      REGISTER_PAUSE: 'Registrar pausa',
    },
  },
  STOPS: {
    LABELS: { MESSAGE: 'Mensagem da parada' },
    KEYS: { MESSAGE: 'message' },
    CATEGORIES: {
      OPERATOR: [
        { value: 'REFUGO_QUALIDADE', label: 'Refugo / qualidade' },
        { value: 'SETUP_TROCA_DE_MOLDE', label: 'Setup / troca de molde' },
        { value: 'MANUTENCAO_CORRETIVA', label: 'Manutencao corretiva' },
        { value: 'FALTA_DE_MATERIA_PRIMA', label: 'Falta de materia-prima' },
        { value: 'OUTROS', label: 'Outros' },
      ],
      LEADER_MANAGER: [
        { value: 'REFUGO_QUALIDADE', label: 'Refugo / qualidade' },
        { value: 'SETUP_TROCA_DE_MOLDE', label: 'Setup / troca de molde' },
        { value: 'MANUTENCAO_CORRETIVA', label: 'Manutencao corretiva' },
        { value: 'FALTA_DE_MATERIA_PRIMA', label: 'Falta de materia-prima' },
        { value: 'FALTA_DE_OPERADOR', label: 'Falta de operador' },
        { value: 'OUTROS', label: 'Outros' },
      ],
    },
    EDIT_MODAL: {
      TITLE: 'Editar mensagem da parada automatica',
      SCOPE_OPERATOR: 'Escopo: suas maquinas (RN02)',
      SCOPE_LEADER: (sector: string, shift: string) => `Setor ${sector} · Turno ${shift} (RN03)`,
      SCOPE_MANAGER: 'Visao completa (RN04)',
      READ_ONLY_TITLE: 'Detalhes da parada',
      READ_ONLY_MACHINE: 'Maquina',
      READ_ONLY_DETECTED: 'Detectada em',
      READ_ONLY_DURATION: 'Duracao corrente',
      READ_ONLY_CURRENT_MESSAGE: 'Mensagem atual',
      READ_ONLY_AUTHOR: (name: string, editedAt: string) =>
        `Editada por ${name} em ${editedAt}`,
      READ_ONLY_NEVER_EDITED: 'Nao editada anteriormente · mensagem padrao do sistema',
      CATEGORY_LABEL: 'Categoria do motivo real',
      CATEGORY_PLACEHOLDER: 'Selecione a categoria',
      MESSAGE_LABEL: 'Nova mensagem',
      MESSAGE_PLACEHOLDER: 'Descreva a causa real da parada (8 a 500 caracteres)',
      MESSAGE_COUNTER: (current: number, max: number) => `${current} / ${max}`,
      AUDIT_CALLOUT_TITLE: 'Esta edicao entra no log imutavel de auditoria (RN12 · RF20)',
      AUDIT_CALLOUT_DESCRIPTION:
        'Seu nome, o horario e o conteudo anterior ficam registrados permanentemente.',
      HISTORY_TITLE: 'Historico de edicoes · auditavel (RN12)',
      HISTORY_EMPTY: 'Sem edicoes anteriores registradas.',
      HISTORY_ERROR:
        'Nao foi possivel carregar o historico de edicoes. Tente novamente em instantes.',
      HISTORY_ITEM: (author: string, editedAt: string) => `${author} · ${editedAt}`,
      BUTTONS: {
        SAVE: 'Salvar e registrar em auditoria',
        CANCEL: 'Cancelar',
      },
      VALIDATION_MESSAGES: {
        MESSAGE_REQUIRED: 'Informe a mensagem.',
        MESSAGE_MIN_LENGTH: (min: number) => `Minimo de ${min} caracteres.`,
        MESSAGE_MAX_LENGTH: (max: number) => `Maximo de ${max} caracteres.`,
        CATEGORY_REQUIRED: 'Selecione a categoria do motivo real.',
      },
    },
  },
  PAUSES: {
    LABELS: { REASON: 'Motivo da pausa' },
    KEYS: { REASON: 'reason' },
    CATEGORIES: [
      { value: 'REFUGO', label: 'Refugo' },
      { value: 'SETUP', label: 'Setup' },
      { value: 'MANUTENCAO', label: 'Manutencao' },
      { value: 'OUTRO', label: 'Outro' },
    ],
    REGISTER_MODAL: {
      TITLE: 'Registrar pausa manual',
      READ_ONLY_TITLE: 'Detalhes da pausa',
      READ_ONLY_MACHINE: 'Maquina',
      READ_ONLY_ORDER: 'Ordem em execucao',
      READ_ONLY_ORDER_FALLBACK: 'Sem OS em execucao',
      READ_ONLY_STARTED_AT: 'Inicio da pausa',
      SCOPE_LABEL: 'Pausa registrada como tipo PAUSA (RN07) · escopo RN02',
      LABELS: {
        REASON: 'Motivo',
        OBSERVATION: 'Observacao (opcional)',
      },
      PLACEHOLDERS: {
        REASON: 'Selecione o motivo',
        OBSERVATION: 'Detalhe complementar para a lider',
      },
      BUTTONS: { SAVE: 'Confirmar', CANCEL: 'Cancelar' },
      VALIDATION_MESSAGES: {
        REASON_REQUIRED: 'Selecione o motivo.',
        REASON_MAX_LENGTH: (max: number) => `Maximo de ${max} caracteres.`,
        OTHER_REQUIRED: 'Descreva o motivo quando "Outro" for selecionado.',
        OBSERVATION_MAX_LENGTH: (max: number) =>
          `A observacao deve ter no maximo ${max} caracteres.`,
      },
    },
  },
  QUALITY: {
    REGISTER_MODAL: {
      TITLE: 'Registrar qualidade',
      SUBTITLE: 'Apontamento manual do fator Qualidade (RF10)',
      LABELS: {
        GOOD_COUNT: 'Pecas boas',
        TOTAL_COUNT: 'Total de pecas',
        FROM: 'Inicio do periodo',
        TO: 'Fim do periodo',
        MACHINE: 'Maquina',
      },
      PLACEHOLDERS: {
        GOOD_COUNT: 'Quantidade aprovada',
        TOTAL_COUNT: 'Quantidade produzida',
      },
      HELPER: 'Periodo padrao: janela da OS ativa ou ultimas 8 horas.',
      BUTTONS: { SAVE: 'Registrar', CANCEL: 'Cancelar' },
      VALIDATION_MESSAGES: {
        GOOD_REQUIRED: 'Informe as pecas boas.',
        TOTAL_REQUIRED: 'Informe o total de pecas.',
        GOOD_NEGATIVE: 'A contagem de pecas boas deve ser positiva.',
        TOTAL_NEGATIVE: 'A contagem total deve ser positiva.',
        TOTAL_BELOW_GOOD: 'O total nao pode ser menor que pecas boas.',
        PERIOD_REQUIRED: 'Selecione o periodo.',
        PERIOD_INVERTED: 'O inicio deve ser anterior ao fim do periodo.',
      },
    },
  },
  BANNER: {
    ATTENTION: {
      TITLE: 'ATENCAO · ACAO NECESSARIA',
      MESSAGE: (count: number) =>
        count === 1
          ? '1 maquina em parada automatica aguarda classificacao.'
          : `${count} maquinas em parada automatica aguardam classificacao.`,
      EDIT_LINK: (code: string) => `Editar mensagem · ${code}`,
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
  NOTIFICATIONS: {
    WARNING: {
      KEYS: {
        NO_MACHINES_IN_SCOPE: 'machines-empty-scope',
        PAUSE_ALREADY_CLASSIFIED: 'machines-pause-already-classified',
      },
      TITLES: {
        NO_MACHINES_IN_SCOPE: 'Nenhuma máquina visível',
        PAUSE_ALREADY_CLASSIFIED: 'Sem pausa pendente',
      },
      MESSAGES: {
        NO_MACHINES_IN_SCOPE:
          'Você não possui máquinas no seu setor. Consulte o gestor.',
        PAUSE_ALREADY_CLASSIFIED:
          'Não há pausa pendente de classificação para esta máquina no momento.',
      },
    },
    ERROR: {
      KEYS: {
        LIST_FAILED: 'machines-list-failed',
        STATUS_FAILED: 'machines-status-failed',
        DETAIL_FAILED: 'machines-detail-failed',
        CYCLES_FAILED: 'machines-cycles-failed',
        PAUSE_CLASSIFY_FAILED: 'machines-pause-classify-failed',
        STOP_EDIT_FAILED: 'machines-stop-edit-failed',
        QUALITY_FAILED: 'machines-quality-failed',
        EDIT_HISTORY_FAILED: 'machines-edit-history-failed',
      },
      TITLES: {
        LIST_FAILED: 'Falha ao listar máquinas',
        STATUS_FAILED: 'Falha ao carregar o estado da máquina',
        DETAIL_FAILED: 'Falha ao carregar o detalhe da máquina',
        CYCLES_FAILED: 'Falha ao carregar os ciclos',
        PAUSE_CLASSIFY_FAILED: 'Falha ao classificar a pausa',
        STOP_EDIT_FAILED: 'Falha ao editar mensagem da parada',
        QUALITY_FAILED: 'Falha ao registrar qualidade',
        EDIT_HISTORY_FAILED: 'Falha ao carregar histórico de edições',
      },
      MESSAGES: {
        LIST_FAILED: 'Não foi possível carregar as máquinas.',
        STATUS_FAILED: 'Não foi possível carregar o estado atual.',
        DETAIL_FAILED: 'Não foi possível carregar a máquina.',
        CYCLES_FAILED: 'Não foi possível carregar a série de ciclos.',
        PAUSE_CLASSIFY_FAILED:
          'Verifique se existe uma pausa pendente de classificação.',
        STOP_EDIT_FAILED:
          'A mensagem só pode ser editada em registros AUTO_STOPPED.',
        QUALITY_FAILED:
          'Verifique os apontamentos informados e tente novamente.',
        EDIT_HISTORY_FAILED:
          'Tente novamente em instantes ou consulte o gestor.',
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
