import type { Schemas } from '@/api/types';

export type ErpFieldMappingDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export type MachineRegisterDrawerProps = {
  open: boolean;
  mode: 'create' | 'edit';
  machine?: Schemas['MachineDetailResponseDTO'] | null;
  onClose: () => void;
  onSaved: () => void;
};

export type UserFormDrawerProps = {
  open: boolean;
  mode: 'create' | 'edit';
  user?: Schemas['UserResponseDTO'] | null;
  onClose: () => void;
  onSaved: () => void;
};
