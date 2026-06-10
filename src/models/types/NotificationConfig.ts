export type NotificationConfig = {
  key?: string;
  successMessage?: string;
  successDescription?: string;
  errorMessage?: string;
  errorDescription?: string;
  suppressErrorNotification?: boolean;
  suppressSuccessNotification?: boolean;
  retry?: boolean;
  maxRetryAttempts?: number;
};
