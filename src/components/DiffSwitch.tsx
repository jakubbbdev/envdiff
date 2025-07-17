import { Switch } from '@mantine/core';

export function DiffSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <Switch
      checked={checked}
      onChange={event => onChange(event.currentTarget.checked)}
      label="Show only differences"
      color="teal"
      size="md"
    />
  );
} 