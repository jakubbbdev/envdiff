import { Table, Tooltip, ActionIcon, Text } from '@mantine/core';
import { Plus, Minus, Edit, Check, Copy } from 'tabler-icons-react';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';

export type DiffEntry = {
  key: string;
  status: 'equal' | 'different' | 'missing_in_a' | 'missing_in_b';
  valueA: string;
  valueB: string;
};

const statusMeta = (t: any, status: string) => {
  if (status === 'missing_in_a') return { icon: <Plus size={16} color="#06b6d4" />, label: t('diff.onlyInB') };
  if (status === 'missing_in_b') return { icon: <Minus size={16} color="#ef4444" />, label: t('diff.onlyInA') };
  if (status === 'different') return { icon: <Edit size={16} color="#f59e0b" />, label: t('diff.different') };
  return { icon: <Check size={16} color="#22c55e" />, label: t('diff.equal') };
};

export const EnvDiffPreview = memo(({ diff }: { diff: DiffEntry[] }) => {
  const { t } = useTranslation();

  if (!diff.length) {
    return (
      <Text ta="center" color="#888" style={{ margin: '32px 0' }}>{t('status.noDifferences')}</Text>
    );
  }

  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="xs" horizontalSpacing="md" style={{ background: '#18181b', borderRadius: 8, marginTop: 12, fontSize: 15 }}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th style={{ width: 36 }}></Table.Th>
          <Table.Th style={{ color: '#fff', fontWeight: 700 }}>{t('Key')}</Table.Th>
          <Table.Th style={{ color: '#fff', fontWeight: 700 }}>{t('Value A')}</Table.Th>
          <Table.Th style={{ color: '#fff', fontWeight: 700 }}>{t('Value B')}</Table.Th>
          <Table.Th style={{ width: 36 }}></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {diff.map((d) => {
          const meta = statusMeta(t, d.status);
          return (
            <Table.Tr key={d.key} style={{ background: d.status === 'equal' ? '#232329' : undefined }}>
              <Table.Td>
                <Tooltip label={meta.label} withArrow>
                  <span>{meta.icon}</span>
                </Tooltip>
              </Table.Td>
              <Table.Td style={{ color: '#fff', fontWeight: 600 }}>{d.key}</Table.Td>
              <Table.Td style={{ color: d.status === 'missing_in_b' ? '#ef4444' : d.status === 'missing_in_a' ? '#06b6d4' : d.status === 'different' ? '#f59e0b' : '#aaa', textDecoration: d.status === 'equal' ? 'line-through' : undefined, opacity: d.status === 'equal' ? 0.5 : 1 }}>{d.status === 'missing_in_a' ? '' : d.valueA}</Table.Td>
              <Table.Td style={{ color: d.status === 'missing_in_a' ? '#06b6d4' : d.status === 'missing_in_b' ? '#ef4444' : d.status === 'different' ? '#f59e0b' : '#aaa', textDecoration: d.status === 'equal' ? 'line-through' : undefined, opacity: d.status === 'equal' ? 0.5 : 1 }}>{d.status === 'missing_in_b' ? '' : d.valueB}</Table.Td>
              <Table.Td>
                <Tooltip label={t('diff.copyValue')} withArrow>
                  <ActionIcon variant="subtle" color="gray" size={24} radius={6} onClick={() => navigator.clipboard.writeText(d.status === 'missing_in_a' ? d.valueB : d.valueA)}>
                    <Copy size={14} />
                  </ActionIcon>
                </Tooltip>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
});

EnvDiffPreview.displayName = 'EnvDiffPreview'; 