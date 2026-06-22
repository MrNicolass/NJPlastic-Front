import { notification } from 'antd';
import { GENERIC_NOTIFICATIONS } from '@/constants/ConstantsAndParams';

type NotificationKind = 'success' | 'info' | 'warning' | 'error';

type GenericDefaultType = keyof typeof GENERIC_NOTIFICATIONS.MESSAGES;

type NotificationUtilsArgs = {
  key?: string;
  type?: NotificationKind;
  message?: string;
  description?: string;
  defaultType?: GenericDefaultType;
};

const DEFAULT_TYPE_TO_KIND: Record<GenericDefaultType, NotificationKind> = {
  SESSION_EXPIRED: 'warning',
  UNAUTHORIZED: 'error',
  INTERNAL_SERVER_ERROR: 'error',
  GENERIC_ERROR: 'error',
};

/**
 * Single entry point for every UI notification in the app. Wrapping `antd`
 * `notification` here guarantees a few invariants:
 * - notifications with the same key never stack (the previous one is
 * destroyed before showing the new one);
 * - placement and duration come from {@link GENERIC_NOTIFICATIONS.CONFIGS}
 * so every screen looks the same;
 * - the `defaultType` shortcut prefills `message` and `description` from
 * the shared catalogue, used by the Axios interceptor.
 *
 * No component should import `notification` from `antd` directly.
 */
export function NotificationUtils(args: NotificationUtilsArgs): void {
  if (typeof window === 'undefined') {
    return;
  }

  const fallback = args.defaultType ? GENERIC_NOTIFICATIONS : null;
  const kind: NotificationKind = args.type ?? (args.defaultType ? DEFAULT_TYPE_TO_KIND[args.defaultType] : 'info');
  const key = args.key ?? (args.defaultType ? GENERIC_NOTIFICATIONS.KEYS[args.defaultType] : undefined);
  const title = args.message ?? (args.defaultType && fallback ? fallback.TITLES[args.defaultType] : '');
  const description = args.description ?? (args.defaultType && fallback ? fallback.MESSAGES[args.defaultType] : undefined);

  if (key) {
    notification.destroy(key);
  }

  notification[kind]({
    key,
    title,
    description,
    placement: GENERIC_NOTIFICATIONS.CONFIGS.PLACEMENT,
    duration: GENERIC_NOTIFICATIONS.CONFIGS.DURATION,
  });
}