import { Switch, Group, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { AdjustmentsHorizontal } from 'tabler-icons-react';

export function DiffSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  const { t } = useTranslation();

  return (
    <Group gap={12} align="center">
      <Tooltip label={t('diff.showOnly')} withArrow>
        <Switch
          checked={checked}
          onChange={event => onChange(event.currentTarget.checked)}
          color="teal"
          size="lg"
          thumbIcon={<AdjustmentsHorizontal size={20} />}
          style={{ boxShadow: '0 2px 8px rgba(16,185,129,0.13)', borderRadius: 16 }}
        />
      </Tooltip>
      <span style={{ fontWeight: 700, fontSize: 18, color: '#14b8a6', letterSpacing: -0.5 }}>{t('diff.showOnly')}</span>
    </Group>
  );
} 