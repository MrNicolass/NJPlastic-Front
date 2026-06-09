'use client';

import { Card, Empty, List, Tag, Typography } from 'antd';
import { MACHINES } from '@/constants/ConstantsAndParams';

const { Text } = Typography;

export type OperatorOfShift = {
  id: string;
  name: string;
  shift?: string;
};

export type OperatorsOfShiftProps = {
  operators: OperatorOfShift[];
};

/**
 * Lists the operators currently associated with this machine in the
 * active shift. The data source for this view is not exposed by the
 * MVP backend (no dedicated endpoint yet); the component renders the
 * data the caller supplies and gracefully shows an empty state when
 * the list is unknown.
 */
export function OperatorsOfShift({ operators }: OperatorsOfShiftProps): React.ReactNode {
  return (
    <Card title={MACHINES.DETAIL.LABELS.OPERATORS_TITLE}>
      {operators.length === 0 ? (
        <Empty description="Sem operadores registrados no turno" />
      ) : (
        <List
          dataSource={operators}
          renderItem={(operator) => (
            <List.Item>
              <List.Item.Meta
                title={<Text>{operator.name}</Text>}
                description={operator.shift ? <Tag>{operator.shift}</Tag> : null}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
