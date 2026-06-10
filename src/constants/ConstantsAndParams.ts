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
    AUTO_STOPPED: 'Parada automática',
    OFFLINE: 'Offline',
    UNKNOWN: 'Sem estado',
  },
  PAGE: {
    TITLE: 'Máquinas',
    SUBTITLE: 'Cadastro de injetoras monitoradas pelo NJPlastic.',
    BUTTONS: {
      CREATE: 'Nova máquina',
      REFRESH: 'Atualizar',
    },
    EMPTY_TITLE: 'Nenhuma máquina cadastrada',
    EMPTY_DESCRIPTION_MANAGER:
      'Use o botão "Nova máquina" para cadastrar a primeira injetora.',
    EMPTY_DESCRIPTION_LEADER: 'Solicite ao gestor o cadastro de uma máquina.',
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
        MACHINE_CREATE_FAILED: 'machines-create-failed',
        MACHINE_UPDATE_FAILED: 'machines-update-failed',
        MACHINE_DEACTIVATE_FAILED: 'machines-deactivate-failed',
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
        MACHINE_CREATE_FAILED: 'Falha ao cadastrar máquina',
        MACHINE_UPDATE_FAILED: 'Falha ao atualizar máquina',
        MACHINE_DEACTIVATE_FAILED: 'Falha ao desativar máquina',
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
        MACHINE_CREATE_FAILED:
          'Verifique o código informado e tente novamente. O código deve ser único.',
        MACHINE_UPDATE_FAILED:
          'Não foi possível atualizar a máquina. Tente novamente em instantes.',
        MACHINE_DEACTIVATE_FAILED:
          'Não foi possível desativar a máquina. Tente novamente em instantes.',
      },
    },
    SUCCESS: {
      KEYS: {
        PAUSE_CLASSIFIED: 'machines-pause-classified',
        STOP_MESSAGE_UPDATED: 'machines-stop-message-updated',
        QUALITY_REGISTERED: 'machines-quality-registered',
        MACHINE_CREATED: 'machines-created',
        MACHINE_UPDATED: 'machines-updated',
        MACHINE_DEACTIVATED: 'machines-deactivated',
      },
      TITLES: {
        PAUSE_CLASSIFIED: 'Pausa classificada',
        STOP_MESSAGE_UPDATED: 'Mensagem atualizada',
        QUALITY_REGISTERED: 'Qualidade registrada',
        MACHINE_CREATED: 'Máquina cadastrada',
        MACHINE_UPDATED: 'Máquina atualizada',
        MACHINE_DEACTIVATED: 'Máquina desativada',
      },
      MESSAGES: {
        PAUSE_CLASSIFIED: 'Motivo registrado na pausa atual.',
        STOP_MESSAGE_UPDATED: 'A mensagem da parada foi atualizada.',
        QUALITY_REGISTERED: 'Os apontamentos de qualidade foram salvos.',
        MACHINE_CREATED: 'A nova máquina já aparece na lista.',
        MACHINE_UPDATED: 'Os parâmetros da máquina foram atualizados.',
        MACHINE_DEACTIVATED: 'A máquina foi desativada e não receberá mais pulsos.',
      },
    },
  },
} as const;

export const EVENTS = {
  KEY: 'events',
  TYPES: {
    TRAINING: 'TRAINING',
    CLEANING: 'CLEANING',
    MEETING: 'MEETING',
    OTHER: 'OTHER',
  },
  TYPE_LABELS: {
    TRAINING: 'Treinamento',
    CLEANING: 'Limpeza',
    MEETING: 'Reuniao',
    OTHER: 'Outro',
  },
  RECENT: {
    LABELS: {
      EMPTY: 'Sem eventos no periodo.',
      LOAD_ERROR: 'Falha ao carregar os eventos recentes.',
      RELATIVE_FALLBACK: 'agora',
    },
    TYPE_LABELS: {
      MANUAL_EVENT: 'Evento manual',
      MANUAL_PAUSE: 'Pausa registrada',
      AUTO_STOP: 'Parada automatica',
      STOP_MESSAGE_EDIT: 'Edicao de mensagem',
    },
  },
  REGISTER_MODAL: {
    TITLE: 'Registrar evento manual',
    SUBTITLE: 'Treinamento, limpeza, reuniao ou outro tipo de evento operacional.',
    LABELS: {
      MACHINE: 'Maquina',
      TYPE: 'Tipo de evento',
      DESCRIPTION: 'Descricao',
      STARTED_AT: 'Inicio',
      ENDED_AT: 'Termino (opcional)',
    },
    PLACEHOLDERS: {
      MACHINE: 'Selecione a maquina',
      TYPE: 'Selecione o tipo',
      DESCRIPTION: 'Descreva brevemente o que ocorreu (ate 500 caracteres)',
    },
    BUTTONS: {
      SAVE: 'Registrar evento',
      CANCEL: 'Cancelar',
    },
    VALIDATION_MESSAGES: {
      MACHINE_REQUIRED: 'Selecione a maquina.',
      TYPE_REQUIRED: 'Selecione o tipo do evento.',
      DESCRIPTION_MAX_LENGTH: (max: number) => `Maximo de ${max} caracteres.`,
      STARTED_REQUIRED: 'Informe o inicio.',
      ENDED_BEFORE_STARTED: 'O termino deve ser posterior ao inicio.',
    },
  },
  NOTIFICATIONS: {
    WARNING: { KEYS: {}, TITLES: {}, MESSAGES: {} },
    ERROR: {
      KEYS: {
        REGISTER_FAILED: 'events-register-failed',
        RECENT_FAILED: 'events-recent-failed',
        LIST_FAILED: 'events-list-failed',
      },
      TITLES: {
        REGISTER_FAILED: 'Falha ao registrar o evento',
        RECENT_FAILED: 'Falha ao carregar os eventos recentes',
        LIST_FAILED: 'Falha ao listar eventos',
      },
      MESSAGES: {
        REGISTER_FAILED: 'Nao foi possivel registrar o evento. Revise os dados e tente novamente.',
        RECENT_FAILED:
          'Nao foi possivel atualizar o painel de eventos recentes. Tente novamente em instantes.',
        LIST_FAILED: 'Nao foi possivel carregar a lista de eventos.',
      },
    },
    SUCCESS: {
      KEYS: { REGISTERED: 'events-registered' },
      TITLES: { REGISTERED: 'Evento registrado' },
      MESSAGES: { REGISTERED: 'O evento foi gravado e aparece no painel "Eventos recentes".' },
    },
  },
} as const;

export const ORDERS = {
  KEY: 'orders',
  LABELS: {
    TITLE: 'Ordens de Producao',
    KPI_IN_PROD: 'Em producao',
    KPI_QUEUED: 'Na fila',
    KPI_OVERDUE: 'Em atraso',
    KPI_COMPLETED: 'Completadas',
    COL_ERP_ORDER_ID: 'OP',
    COL_PRODUCT: 'Produto',
    COL_MACHINE: 'Maquina',
    COL_TARGET: 'Qtde alvo',
    COL_DUE_DATE: 'Prazo',
    COL_STATUS: 'Status',
    COL_SYNC: 'Sync ERP',
    EMPTY: 'Nenhuma ordem de producao no escopo.',
    NEW_ORDER_TOOLTIP: 'Em breve - disponivel em versao futura',
    LAST_UPDATE: (at: string) => `Atualizado as ${at}`,
    NO_MACHINE: '-',
  },
  BUTTONS: {
    NEW_ORDER: 'Nova ordem',
    CLEAR_FILTERS: 'Limpar filtros',
  },
  FILTER_LABELS: {
    STATUS: 'Status',
    MACHINE: 'Maquina',
    PERIOD: 'Periodo do prazo',
  },
  SYNC_STATUS_LABELS: {
    SYNCED: 'Sincronizada',
    PENDING: 'Pendente',
    ERROR_RETRY: 'Erro / retry',
    UNKNOWN: 'Desconhecido',
  },
  NOTIFICATIONS: {
    WARNING: { KEYS: {}, TITLES: {}, MESSAGES: {} },
    ERROR: {
      KEYS: {
        LIST_FAILED: 'orders-list-failed',
        SUMMARY_FAILED: 'orders-summary-failed',
      },
      TITLES: {
        LIST_FAILED: 'Falha ao listar ordens',
        SUMMARY_FAILED: 'Falha ao carregar o resumo',
      },
      MESSAGES: {
        LIST_FAILED: 'Nao foi possivel carregar as ordens. Tente novamente em instantes.',
        SUMMARY_FAILED: 'Nao foi possivel carregar os KPIs.',
      },
    },
    SUCCESS: { KEYS: {}, TITLES: {}, MESSAGES: {} },
  },
} as const;

export const HISTORY = {
  KEY: 'history',
  LABELS: {
    TITLE: 'Historico de Ciclos e Pausas',
    TAB_CYCLES: 'Ciclos',
    TAB_PAUSES: 'Pausas',
    TAB_AUTO_STOPS: 'Paradas automaticas',
    TAB_EVENTS: 'Eventos',
    FILTER_MACHINE: 'Maquina',
    FILTER_PERIOD: 'Periodo',
    FILTER_MACHINE_PLACEHOLDER: 'Selecione uma maquina',
    EMPTY: 'Sem registros para o filtro atual.',
    COL_PULSE: 'Pulso',
    COL_RECEIVED: 'Recebido em',
    COL_SEQUENCE: 'Sequencia',
    COL_INTERVAL_MS: 'Intervalo (ms)',
    COL_STATE: 'Estado',
    COL_REASON: 'Motivo',
    COL_MESSAGE: 'Mensagem',
    COL_START: 'Inicio',
    COL_END: 'Fim',
    COL_TYPE: 'Tipo',
    COL_DESCRIPTION: 'Descricao',
    COL_AUTHOR: 'Autor',
    DEFAULT_LOOKBACK_HOURS: 24,
  },
  NOTIFICATIONS: {
    WARNING: { KEYS: {}, TITLES: {}, MESSAGES: {} },
    ERROR: {
      KEYS: { LOAD_FAILED: 'history-load-failed' },
      TITLES: { LOAD_FAILED: 'Falha ao carregar o historico' },
      MESSAGES: { LOAD_FAILED: 'Nao foi possivel carregar o historico. Tente novamente.' },
    },
    SUCCESS: { KEYS: {}, TITLES: {}, MESSAGES: {} },
  },
} as const;

export const REPORTS_SCREEN = {
  KEY: 'reports-screen',
  LABELS: {
    TITLE: 'Relatório de Turno',
    FILTER_PERIOD: 'Período',
    FILTER_SECTOR: 'Setor',
    FILTER_SHIFT: 'Turno',
    GENERATE: 'Gerar relatório',
    EXPORT_TOOLTIP: 'Disponível em EP-FE-07 (RF16)',
    EXPORT_BUTTON: 'Exportar',
    INITIAL_EMPTY_TITLE: 'Defina o período e clique em "Gerar relatório"',
    INITIAL_EMPTY_DESCRIPTION:
      'Selecione o intervalo, setor e turno desejados para consultar o relatório consolidado.',
    EMPTY_TITLE: 'Sem dados no período',
    EMPTY_DESCRIPTION:
      'Ajuste o período ou o setor selecionado para gerar o relatório.',
    MACHINE_SECTION_TITLE: (code: string) => `Máquina ${code}`,
    MANUAL_PAUSES_TITLE: 'Pausas manuais',
    AUTO_STOPS_TITLE: 'Paradas automáticas',
    CYCLES_LABEL: 'Ciclos confirmados',
    OEE_LABEL: 'OEE no período',
  },
  FILTER_PLACEHOLDERS: {
    SECTOR: 'Ex: INJEÇÃO',
    SHIFT: 'A / B / C',
  },
  TABLE_LABELS: {
    START: 'Início',
    END: 'Fim',
    REASON: 'Motivo',
    MESSAGE: 'Mensagem',
    NO_REASON_TAG: 'Sem motivo',
    EMPTY_PAUSES: 'Sem pausas no período.',
    EMPTY_STOPS: 'Sem paradas no período.',
  },
  NOTIFICATIONS: {
    WARNING: { KEYS: {}, TITLES: {}, MESSAGES: {} },
    ERROR: {
      KEYS: { LOAD_FAILED: 'reports-screen-load-failed' },
      TITLES: { LOAD_FAILED: 'Falha ao gerar o relatório' },
      MESSAGES: { LOAD_FAILED: 'Não foi possível gerar o relatório do turno.' },
    },
    SUCCESS: {
      KEYS: { REPORT_GENERATED: 'reports-screen-report-generated' },
      TITLES: { REPORT_GENERATED: 'Relatório gerado' },
      MESSAGES: {
        REPORT_GENERATED: (count: number) =>
          count === 0
            ? 'A busca retornou sem máquinas no período.'
            : `${count} máquina${count === 1 ? '' : 's'} no resultado.`,
      },
    },
  },
} as const;

export const LEADER_DASHBOARD = {
  KEY: 'leader-dashboard',
  LABELS: {
    GREETING: (name: string) => `Olá, ${name}`,
    SCOPE_BADGE: 'Visão do turno (RN03)',
    LAST_UPDATE: (at: string) => `Atualizado às ${at}`,
    KPI_OEE_AVERAGE: 'OEE médio do turno',
    KPI_RUNNING: 'Em produção',
    KPI_PAUSED: 'Em pausa',
    KPI_AUTO_STOPPED: 'Em parada automática',
    KPI_OFFLINE: 'Offline',
    KPI_OPEN_STOPS: 'Paradas em aberto',
    KPI_CYCLES_SHIFT: 'Ciclos confirmados no turno',
    MACHINES_TITLE: 'Máquinas do setor',
    RECENT_EVENTS_TITLE: 'Eventos recentes',
    EMPTY_TITLE: 'Sem máquinas no escopo',
    EMPTY_DESCRIPTION:
      'Você não possui máquinas atribuídas ao seu turno/setor. Consulte o gestor.',
    OEE_UNAVAILABLE: 'OEE indisponível',
  },
  BUTTONS: {
    REGISTER_EVENT: 'Registrar evento',
  },
  NOTIFICATIONS: {
    WARNING: { KEYS: {}, TITLES: {}, MESSAGES: {} },
    ERROR: {
      KEYS: {
        SNAPSHOT_FAILED: 'leader-dashboard-snapshot-failed',
      },
      TITLES: {
        SNAPSHOT_FAILED: 'Falha ao carregar o dashboard do turno',
      },
      MESSAGES: {
        SNAPSHOT_FAILED:
          'Não foi possível atualizar a visão consolidada. Tente novamente em instantes.',
      },
    },
    SUCCESS: { KEYS: {}, TITLES: {}, MESSAGES: {} },
  },
} as const;

export const DASHBOARD_SHARED = {
  KEY: 'dashboard-shared',
  STATE_FILTER: {
    LABELS: {
      ALL: 'Todas',
      RUNNING: 'Produzindo',
      PAUSED: 'Em pausa',
      AUTO_STOPPED: 'Em parada',
      OFFLINE: 'Offline',
    },
    VALUES: {
      ALL: 'ALL',
      RUNNING: 'RUNNING',
      PAUSED: 'PAUSED',
      AUTO_STOPPED: 'AUTO_STOPPED',
      OFFLINE: 'OFFLINE',
    },
  },
  OEE_CARD: {
    TITLE: 'OEE médio',
    PARTIAL_TAG: 'parcial',
    UNAVAILABLE: 'OEE indisponível',
  },
} as const;

export const MANAGER_DASHBOARD = {
  KEY: 'manager-dashboard',
  LABELS: {
    GREETING: (name: string) => `Olá, ${name}`,
    SCOPE_BADGE: 'Visão completa (RN04)',
    LAST_UPDATE: (at: string) => `Atualizado às ${at}`,
    KPI_OEE_AVERAGE: 'OEE médio geral',
    KPI_RUNNING: 'Em produção',
    KPI_PAUSED: 'Em pausa',
    KPI_AUTO_STOPPED: 'Em parada automática',
    KPI_OFFLINE: 'Offline',
    KPI_TOTAL_MACHINES: 'Máquinas no escopo',
    SECTOR_FILTER: 'Setor',
    SHIFT_FILTER: 'Turno',
    SECTOR_ALL: 'Todos os setores',
    SHIFT_ALL: 'Todos os turnos',
    OEE_BY_SECTOR_TITLE: 'OEE médio por setor',
    OEE_BY_SECTOR_EMPTY: 'Sem dados de OEE no escopo selecionado.',
    MACHINES_TITLE: 'Máquinas',
    RECENT_EVENTS_TITLE: 'Eventos recentes',
    EMPTY_TITLE: 'Sem máquinas no escopo',
    EMPTY_DESCRIPTION: 'Ajuste os filtros de setor/turno ou cadastre uma nova máquina.',
    OEE_UNAVAILABLE: 'OEE indisponível',
  },
  BUTTONS: {
    REGISTER_EVENT: 'Registrar evento',
  },
  NOTIFICATIONS: {
    WARNING: { KEYS: {}, TITLES: {}, MESSAGES: {} },
    ERROR: {
      KEYS: {
        SNAPSHOT_FAILED: 'manager-dashboard-snapshot-failed',
      },
      TITLES: {
        SNAPSHOT_FAILED: 'Falha ao carregar o dashboard gerencial',
      },
      MESSAGES: {
        SNAPSHOT_FAILED:
          'Não foi possível atualizar a visão consolidada. Tente novamente em instantes.',
      },
    },
    SUCCESS: { KEYS: {}, TITLES: {}, MESSAGES: {} },
  },
} as const;

export const USERS = {
  KEY: 'users',
  ROLES: {
    OPERATOR: 'OPERATOR',
    LEADER: 'LEADER',
    MANAGER: 'MANAGER',
    ADMIN: 'ADMIN',
  },
  ROLE_LABELS: {
    OPERATOR: 'Operador',
    LEADER: 'Líder de turno',
    MANAGER: 'Gestor',
    ADMIN: 'Administrador',
  },
  LIST: {
    TITLE: 'Usuários',
    SUBTITLE: 'Cadastro de pessoas com acesso ao sistema',
    BUTTONS: {
      CREATE: 'Novo usuário',
      EDIT: 'Editar',
      DEACTIVATE: 'Desativar',
      REFRESH: 'Atualizar',
      APPLY: 'Aplicar',
    },
    FILTERS: {
      ROLE: 'Perfil',
      ROLE_PLACEHOLDER: 'Filtrar por perfil',
      SECTOR: 'Setor',
      SHIFT: 'Turno',
      ACTIVE: 'Situação',
      ACTIVE_PLACEHOLDER: 'Filtrar por situação',
      ACTIVE_TRUE: 'Ativos',
      ACTIVE_FALSE: 'Inativos',
      ACTIVE_ALL: 'Todos',
      CLEAR: 'Limpar filtros',
    },
    LABELS: {
      NAME: 'Nome',
      LOGIN: 'Login',
      EMAIL: 'E-mail',
      ROLE: 'Perfil',
      SECTOR: 'Setor',
      SHIFT: 'Turno',
      ACTIVE: 'Ativo',
      ACTIONS: 'Ações',
    },
    KEYS: {
      NAME: 'name',
      LOGIN: 'login',
      EMAIL: 'email',
      ROLE: 'role',
      SECTOR: 'sector',
      SHIFT: 'shift',
      ACTIVE: 'active',
      ACTIONS: 'actions',
    },
    EMPTY_TITLE: 'Nenhum usuário cadastrado',
    EMPTY_DESCRIPTION: 'Use o botão "Novo usuário" para cadastrar o primeiro acesso.',
  },
  FORM_DRAWER: {
    TITLE_CREATE: 'Cadastrar usuário',
    TITLE_EDIT: 'Editar usuário',
    LABELS: {
      NAME: 'Nome',
      LOGIN: 'Login (imutável após cadastro)',
      EMAIL: 'E-mail',
      PASSWORD: 'Senha (mínimo 12 caracteres)',
      ROLE: 'Perfil',
      SECTOR: 'Setor',
      SHIFT: 'Turno',
      ACTIVE: 'Ativo',
    },
    PLACEHOLDERS: {
      NAME: 'Ex: Maria Silva',
      LOGIN: 'Ex: maria.silva',
      EMAIL: 'Ex: maria@empresa.com',
      PASSWORD: 'Defina uma senha forte (>= 12 caracteres)',
      ROLE: 'Selecione o perfil',
      SECTOR: 'Ex: INJEÇÃO',
      SHIFT: 'Ex: A',
    },
    BUTTONS: {
      SAVE: 'Salvar',
      CANCEL: 'Cancelar',
    },
    VALIDATION_MESSAGES: {
      NAME_REQUIRED: 'Informe o nome.',
      LOGIN_REQUIRED: 'Informe o login.',
      EMAIL_REQUIRED: 'Informe o e-mail.',
      EMAIL_INVALID: 'E-mail inválido.',
      PASSWORD_REQUIRED: 'Informe a senha.',
      PASSWORD_MIN_LENGTH: (min: number) => `A senha deve ter pelo menos ${min} caracteres.`,
      ROLE_REQUIRED: 'Selecione o perfil.',
    },
  },
  DEACTIVATE_CONFIRM: {
    TITLE: 'Desativar usuário?',
    DESCRIPTION:
      'O usuário perde acesso ao sistema mas o histórico de auditoria é preservado. Você pode reativá-lo editando o cadastro.',
    OK_TEXT: 'Desativar',
    CANCEL_TEXT: 'Cancelar',
  },
  NOTIFICATIONS: {
    WARNING: { KEYS: {}, TITLES: {}, MESSAGES: {} },
    ERROR: {
      KEYS: {
        LIST_FAILED: 'users-list-failed',
        CREATE_FAILED: 'users-create-failed',
        UPDATE_FAILED: 'users-update-failed',
        DEACTIVATE_FAILED: 'users-deactivate-failed',
        ALREADY_EXISTS: 'users-already-exists',
      },
      TITLES: {
        LIST_FAILED: 'Falha ao listar usuários',
        CREATE_FAILED: 'Falha ao cadastrar usuário',
        UPDATE_FAILED: 'Falha ao atualizar usuário',
        DEACTIVATE_FAILED: 'Falha ao desativar usuário',
        ALREADY_EXISTS: 'Login ou e-mail já em uso',
      },
      MESSAGES: {
        LIST_FAILED: 'Não foi possível carregar os usuários.',
        CREATE_FAILED: 'Verifique os campos e tente novamente.',
        UPDATE_FAILED: 'Não foi possível atualizar o usuário.',
        DEACTIVATE_FAILED: 'Não foi possível desativar o usuário.',
        ALREADY_EXISTS: 'Escolha outro login ou e-mail e tente novamente.',
      },
    },
    SUCCESS: {
      KEYS: {
        CREATED: 'users-created',
        UPDATED: 'users-updated',
        DEACTIVATED: 'users-deactivated',
      },
      TITLES: {
        CREATED: 'Usuário cadastrado',
        UPDATED: 'Usuário atualizado',
        DEACTIVATED: 'Usuário desativado',
      },
      MESSAGES: {
        CREATED: 'O novo acesso já foi liberado.',
        UPDATED: 'Os dados do usuário foram salvos.',
        DEACTIVATED: 'O usuário perdeu acesso ao sistema.',
      },
    },
  },
} as const;

export const MACHINE_REGISTER = {
  KEY: 'machine-register',
  DRAWER: {
    TITLE_CREATE: 'Cadastrar máquina',
    TITLE_EDIT: 'Editar máquina',
    TABS: {
      IDENTIFICATION: 'Identificação',
      CAPTURE: 'Captura IoT · MQTT',
      CYCLE: 'Parâmetros de ciclo',
      ESCALATION: 'Escalonamento de PARADA',
      SECTOR_SHIFT: 'Setor e Turnos',
    },
    LABELS: {
      CODE: 'Código curto',
      DESCRIPTION: 'Descrição',
      SECTOR: 'Setor',
      MQTT_TOPIC: 'Tópico MQTT (gerado automaticamente)',
      STANDARD_CYCLE_MS: 'Ciclo padrão (ms)',
      TOLERANCE_FACTOR: 'Fator de tolerância (> 1.0)',
      CONSECUTIVE_PAUSES_TO_STOP: 'Pausas consecutivas para PARADA',
      OFFLINE_WINDOW_MS: 'Janela offline (ms)',
      ACTIVE: 'Máquina ativa',
      SHIFTS: 'Turnos atendidos',
      PREVIEW_TITLE: 'Pré-visualização',
      PREVIEW_FALLBACK: 'Preencha o código para visualizar.',
    },
    PLACEHOLDERS: {
      CODE: 'Ex: MAQ-01',
      DESCRIPTION: 'Ex: Injetora 80t linha A',
      SECTOR: 'Ex: INJEÇÃO',
      STANDARD_CYCLE_MS: 'Ex: 2000',
      TOLERANCE_FACTOR: 'Ex: 1.5',
      CONSECUTIVE_PAUSES_TO_STOP: 'Ex: 3',
      OFFLINE_WINDOW_MS: 'Ex: 60000',
    },
    BUTTONS: {
      SAVE: 'Salvar',
      CANCEL: 'Cancelar',
    },
    HINTS: {
      CODE_IMMUTABLE: 'O código não pode ser alterado depois de cadastrado.',
      TOPIC_AUTO: 'Tópico derivado do código curto. Configure o microcontrolador para publicar nele.',
    },
    SHIFT_OPTIONS: [
      { value: 'A', label: 'Turno A' },
      { value: 'B', label: 'Turno B' },
      { value: 'C', label: 'Turno C' },
    ],
    VALIDATION_MESSAGES: {
      CODE_REQUIRED: 'Informe o código curto.',
      DESCRIPTION_REQUIRED: 'Informe a descrição.',
      STANDARD_CYCLE_REQUIRED: 'Informe o ciclo padrão em ms.',
      STANDARD_CYCLE_MIN: 'O ciclo padrão deve ser maior que zero.',
      TOLERANCE_REQUIRED: 'Informe o fator de tolerância.',
      TOLERANCE_MIN: 'O fator de tolerância deve ser maior que 1.0.',
      CONSECUTIVE_REQUIRED: 'Informe quantas pausas escalam para PARADA.',
      CONSECUTIVE_MIN: 'Mínimo de 1 pausa consecutiva.',
      OFFLINE_REQUIRED: 'Informe a janela offline em ms.',
      OFFLINE_MIN: 'A janela offline deve ser maior que zero.',
    },
  },
} as const;

export const ERP_MAPPING = {
  KEY: 'erp-mapping',
  KPIS: {
    TITLE: 'Indicadores ERP',
    TOTAL_ORDERS: 'OS sincronizadas',
    SYNCED: 'OS sincronizadas (< 1h)',
    PENDING: 'OS pendentes (>= 1h)',
    LAST_SYNC: 'Última sincronização',
    LAST_SYNC_FALLBACK: 'Sem registros',
  },
  PAGE: {
    TITLE: 'Integração ERP',
    SUBTITLE: 'Status da sincronização de ordens de produção e mapeamento de campos.',
    BUTTONS: {
      EDIT_MAPPING: 'Editar mapeamento',
      REFRESH: 'Atualizar',
    },
    TABLE_TITLE: 'Ordens recentes',
  },
  DRAWER: {
    TITLE: 'Mapeamento de campos ERP',
    SUBTITLE: 'Defina como cada campo de Ordem de Produção do NJPlastic é lido do ERP.',
    ENTITY_TYPE: 'PRODUCTION_ORDER',
    LABELS: {
      NJ_FIELD: 'Campo NJPlastic',
      ERP_COLUMN: 'Coluna no ERP',
      DESCRIPTION: 'Descrição',
    },
    KEYS: {
      NJ_FIELD: 'njField',
      ERP_COLUMN: 'erpColumn',
      DESCRIPTION: 'description',
    },
    PLACEHOLDERS: {
      ERP_COLUMN: 'Ex: ord_codigo',
    },
    BUTTONS: {
      SAVE: 'Salvar mapeamento',
      CANCEL: 'Cancelar',
    },
    VALIDATION_MESSAGES: {
      COLUMN_REQUIRED: 'Informe a coluna do ERP.',
    },
  },
  NOTIFICATIONS: {
    WARNING: { KEYS: {}, TITLES: {}, MESSAGES: {} },
    ERROR: {
      KEYS: {
        LOAD_FAILED: 'erp-mapping-load-failed',
        UPDATE_FAILED: 'erp-mapping-update-failed',
        KPIS_FAILED: 'erp-mapping-kpis-failed',
      },
      TITLES: {
        LOAD_FAILED: 'Falha ao carregar mapeamento',
        UPDATE_FAILED: 'Falha ao salvar mapeamento',
        KPIS_FAILED: 'Falha ao carregar indicadores ERP',
      },
      MESSAGES: {
        LOAD_FAILED: 'Não foi possível carregar o mapeamento de campos ERP.',
        UPDATE_FAILED: 'Não foi possível salvar o mapeamento. Tente novamente.',
        KPIS_FAILED: 'Não foi possível carregar os indicadores. Tente novamente.',
      },
    },
    SUCCESS: {
      KEYS: {
        UPDATED: 'erp-mapping-updated',
      },
      TITLES: {
        UPDATED: 'Mapeamento atualizado',
      },
      MESSAGES: {
        UPDATED: 'A alteração foi registrada em auditoria (RF20).',
      },
    },
  },
} as const;

export const AUDIT = {
  KEY: 'audit',
  PAGE: {
    TITLE: 'Auditoria',
    SUBTITLE: 'Trilha de auditoria do sistema (RF20 / RN12). Payloads já são sanitizados.',
  },
  LIST: {
    LABELS: {
      TIMESTAMP: 'Quando',
      USER: 'Usuário',
      METHOD: 'Método',
      ENDPOINT: 'Endpoint',
      STATUS: 'Status',
      DURATION_MS: 'Duração (ms)',
      SOURCE_IP: 'IP de origem',
      ACTIONS: 'Detalhes',
    },
    KEYS: {
      TIMESTAMP: 'timestamp',
      USER: 'userId',
      METHOD: 'httpMethod',
      ENDPOINT: 'endpoint',
      STATUS: 'httpStatus',
      DURATION_MS: 'durationMs',
      SOURCE_IP: 'sourceIp',
      ACTIONS: 'actions',
    },
    EMPTY_TITLE: 'Sem registros para os filtros aplicados',
    EMPTY_DESCRIPTION: 'Ajuste os filtros para visualizar a trilha de auditoria.',
  },
  FILTERS: {
    USER_ID: 'UUID do usuário',
    USER_ID_PLACEHOLDER: 'Cole o UUID exato do usuário',
    ENDPOINT: 'Endpoint (contém)',
    ENDPOINT_PLACEHOLDER: 'Ex: /users',
    METHOD: 'Método HTTP',
    METHOD_PLACEHOLDER: 'Selecione o método',
    STATUS_CODE: 'Status HTTP',
    STATUS_CODE_PLACEHOLDER: 'Selecione o status',
    PERIOD: 'Período',
    APPLY: 'Aplicar',
    CLEAR: 'Limpar',
    METHOD_OPTIONS: [
      { value: 'GET', label: 'GET' },
      { value: 'POST', label: 'POST' },
      { value: 'PUT', label: 'PUT' },
      { value: 'PATCH', label: 'PATCH' },
      { value: 'DELETE', label: 'DELETE' },
    ],
    STATUS_OPTIONS: [
      { value: 200, label: '200 — OK' },
      { value: 201, label: '201 — Created' },
      { value: 204, label: '204 — No Content' },
      { value: 400, label: '400 — Bad Request' },
      { value: 401, label: '401 — Unauthorized' },
      { value: 403, label: '403 — Forbidden' },
      { value: 404, label: '404 — Not Found' },
      { value: 409, label: '409 — Conflict' },
      { value: 422, label: '422 — Unprocessable Entity' },
      { value: 500, label: '500 — Internal Server Error' },
    ],
  },
  DETAIL_MODAL: {
    TITLE: 'Detalhe da entrada de auditoria',
    LABELS: {
      REQUEST_PAYLOAD: 'Request payload',
      RESPONSE_PAYLOAD: 'Response payload',
      EMPTY: 'Sem corpo registrado.',
    },
    BUTTONS: {
      CLOSE: 'Fechar',
    },
  },
  NOTIFICATIONS: {
    WARNING: {
      KEYS: {
        INVALID_UUID: 'audit-invalid-uuid',
      },
      TITLES: {
        INVALID_UUID: 'UUID inválido',
      },
      MESSAGES: {
        INVALID_UUID:
          'Cole um UUID completo (formato 8-4-4-4-12) ou deixe o campo vazio para buscar todos os usuários.',
      },
    },
    ERROR: {
      KEYS: {
        LIST_FAILED: 'audit-list-failed',
      },
      TITLES: {
        LIST_FAILED: 'Falha ao carregar a auditoria',
      },
      MESSAGES: {
        LIST_FAILED: 'Não foi possível carregar os registros de auditoria.',
      },
    },
    SUCCESS: { KEYS: {}, TITLES: {}, MESSAGES: {} },
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
