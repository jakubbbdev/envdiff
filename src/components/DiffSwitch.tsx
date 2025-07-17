import { Switch } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export function DiffSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  const { t } = useTranslation();

  return (
    <Switch
      checked={checked}
      onChange={event => onChange(event.currentTarget.checked)}
      label={t('diff.showOnly')}
      color="teal"
      size="md"
    />
  );
} 