export type LoginFormValues = {
  login: string;
  password: string;
  remember?: boolean;
};

export type RequestFormValues = {
  login: string;
};

export type ConfirmFormValues = {
  newPassword: string;
  confirmPassword: string;
};
