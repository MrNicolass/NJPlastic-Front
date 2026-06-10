import type { Schemas } from '@/api/types';

export type UsersTableProps = {
  users: Schemas['UserResponseDTO'][];
  loading: boolean;
  totalElements: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (user: Schemas['UserResponseDTO']) => void;
  onDeactivate: (user: Schemas['UserResponseDTO']) => void;
};
