'use client';

import { Button, Col, Row, Select, Space, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';
import type { Schemas } from '@/api/types';
import { UserFormDrawer } from '@/components/manager/UserFormDrawer';
import { UsersTable } from '@/components/manager/UsersTable';
import { USERS } from '@/constants/ConstantsAndParams';
import type { UserListFilters } from '@/models/interfaces/services/IUserService';
import { createPageParams } from '@/models/types/PageParams';
import UserService from '@/services/UserService';
import { NotificationUtils } from '@/utils/NotificationUtils';

const { Title, Text } = Typography;

const DEFAULT_PAGE_SIZE = 20;
const ALL_VALUE = '__ALL__';

const ROLE_FILTER_OPTIONS = [
  { value: ALL_VALUE, label: USERS.LIST.FILTERS.ACTIVE_ALL },
  { value: USERS.ROLES.OPERATOR, label: USERS.ROLE_LABELS.OPERATOR },
  { value: USERS.ROLES.LEADER, label: USERS.ROLE_LABELS.LEADER },
  { value: USERS.ROLES.MANAGER, label: USERS.ROLE_LABELS.MANAGER },
];

const ACTIVE_FILTER_OPTIONS = [
  { value: ALL_VALUE, label: USERS.LIST.FILTERS.ACTIVE_ALL },
  { value: 'true', label: USERS.LIST.FILTERS.ACTIVE_TRUE },
  { value: 'false', label: USERS.LIST.FILTERS.ACTIVE_FALSE },
];

export default function UsersPage() {
  const [users, setUsers] = useState<Schemas['UserResponseDTO'][]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [roleInput, setRoleInput] = useState<string>(ALL_VALUE);
  const [activeInput, setActiveInput] = useState<string>(ALL_VALUE);
  const [appliedFilters, setAppliedFilters] = useState<UserListFilters>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<Schemas['UserResponseDTO'] | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await UserService.list(
        createPageParams(page, pageSize),
        appliedFilters,
        true,
      );
      setUsers(result.content);
      setTotalElements(result.totalElements);
    } catch {
      NotificationUtils({
        key: USERS.NOTIFICATIONS.ERROR.KEYS.LIST_FAILED,
        type: 'error',
        message: USERS.NOTIFICATIONS.ERROR.TITLES.LIST_FAILED,
        description: USERS.NOTIFICATIONS.ERROR.MESSAGES.LIST_FAILED,
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, appliedFilters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditingUser(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEdit = (user: Schemas['UserResponseDTO']) => {
    setEditingUser(user);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleDeactivate = async (user: Schemas['UserResponseDTO']) => {
    await UserService.softDelete(user.id);
    await fetchUsers();
  };

  const handlePageChange = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  const handleApply = () => {
    const next: UserListFilters = {};
    if (roleInput !== ALL_VALUE) {
      next.role = roleInput as Schemas['UserResponseDTO']['role'];
    }
    if (activeInput !== ALL_VALUE) {
      next.active = activeInput === 'true';
    }
    setAppliedFilters(next);
    setPage(0);
  };

  const handleClear = () => {
    setRoleInput(ALL_VALUE);
    setActiveInput(ALL_VALUE);
    setAppliedFilters({});
    setPage(0);
  };

  return (
    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      <header>
        <Row justify="space-between" align="middle" gutter={[16, 16]} wrap>
          <Col flex="auto">
            <Title level={3} style={{ marginBottom: 4 }}>
              {USERS.LIST.TITLE}
            </Title>
            <Text type="secondary">{USERS.LIST.SUBTITLE}</Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
                {USERS.LIST.BUTTONS.REFRESH}
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                {USERS.LIST.BUTTONS.CREATE}
              </Button>
            </Space>
          </Col>
        </Row>
      </header>

      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <Text strong>{USERS.LIST.FILTERS.ROLE}</Text>
          <Select
            value={roleInput}
            onChange={setRoleInput}
            options={ROLE_FILTER_OPTIONS}
            style={{ width: '100%' }}
            placeholder={USERS.LIST.FILTERS.ROLE_PLACEHOLDER}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Text strong>{USERS.LIST.FILTERS.ACTIVE}</Text>
          <Select
            value={activeInput}
            onChange={setActiveInput}
            options={ACTIVE_FILTER_OPTIONS}
            style={{ width: '100%' }}
            placeholder={USERS.LIST.FILTERS.ACTIVE_PLACEHOLDER}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Space style={{ marginTop: 22 }}>
            <Button type="primary" onClick={handleApply}>
              {USERS.LIST.BUTTONS.APPLY}
            </Button>
            <Button onClick={handleClear}>{USERS.LIST.FILTERS.CLEAR}</Button>
          </Space>
        </Col>
      </Row>

      <UsersTable
        users={users}
        loading={loading}
        totalElements={totalElements}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onEdit={openEdit}
        onDeactivate={handleDeactivate}
      />

      <UserFormDrawer
        open={drawerOpen}
        mode={drawerMode}
        user={editingUser}
        onClose={() => setDrawerOpen(false)}
        onSaved={fetchUsers}
      />
    </Space>
  );
}
