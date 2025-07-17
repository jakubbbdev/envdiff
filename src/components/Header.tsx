import { Group, ThemeIcon, Title, Text, Box } from '@mantine/core';
import { Files } from 'tabler-icons-react';
import { ReactNode } from 'react';

export function Header({ right }: { right?: ReactNode }) {
  return (
    <Box style={{
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'rgba(30,41,59,0.95)',
      boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
      padding: '0.5rem 2rem 0.5rem 2rem',
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      marginBottom: 32,
      border: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(8px)'
    }}>
      <Group justify="space-between" align="center" gap="md">
        <Group gap="sm">
          <ThemeIcon size="36" radius="xl" variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
            <Files size={22} />
          </ThemeIcon>
          <Box>
            <Title order={2} size="h2" fw={900} style={{ letterSpacing: -1, color: '#fff', textShadow: '0 2px 8px #0002', lineHeight: 1.1 }}>EnvDiff</Title>
            <Text c="#cbd5e1" size="sm" style={{ fontWeight: 400, opacity: 0.8, marginTop: 2 }}>Compare and sync your <b style={{ color: '#fff' }}>.env</b> files</Text>
          </Box>
        </Group>
        {right}
      </Group>
    </Box>
  );
} 