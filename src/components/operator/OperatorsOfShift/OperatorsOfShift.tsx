'use client';

import { Card, Empty, List, Tag, Typography } from 'antd';
import { MACHINES } from '@/constants/ConstantsAndParams';
import type { OperatorsOfShiftProps } from '@/models/interfaces/components/MachineProps';

export type { OperatorOfShift } from '@/models/types/OperatorsOfShift';
export type { OperatorsOfShiftProps } from '@/models/interfaces/components/MachineProps';

const { Text } = Typography;

/**
 * Lists the operators currently associated with this machine in the
 * active shift. Data is fetched by the caller and supplied via props; an
 * empty state is shown when the list is unknown or contains no entries.
 */
export function OperatorsOfShift({ operators }: OperatorsOfShiftProps): React.ReactNode {
  return (
    <Card title={MACHINES.DETAIL.LABELS.OPERATORS_TITLE}>
      {operators.length === 0 ? (
        <Empty description={MACHINES.DETAIL.LABELS.OPERATORS_EMPTY} />
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
