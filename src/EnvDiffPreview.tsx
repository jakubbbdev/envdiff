import { Paper, Group, Text, ThemeIcon, Tooltip, CopyButton, Stack } from '@mantine/core';
import { Plus, Minus, Edit, Check, Copy } from 'tabler-icons-react';
import { useTranslation } from 'react-i18next';

export type DiffEntry = {
  key: string;
  status: 'equal' | 'different' | 'missing_in_a' | 'missing_in_b';
  valueA: string;
  valueB: string;
};

export function EnvDiffPreview({ diff }: { diff: DiffEntry[] }) {
  const { t } = useTranslation();

  if (!diff.length) {
    return (
      <Paper p="xl" radius="lg" withBorder>
        <Text ta="center" color="dimmed">{t('status.noDifferences')}</Text>
      </Paper>
    );
  }
  return (
    <Paper id="envdiff-preview" p="xl" radius="xl" withBorder style={{ 
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
      minHeight: 200, 
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
    }}>
      <Stack gap="md">
        {diff.map((d) => {
          let color = '#64748b';
          let icon = <Check size={18} />;
          let label = t('diff.equal');
          let bg = 'rgba(255,255,255,0.02)';
          if (d.status === 'missing_in_a') {
            color = '#10b981';
            icon = <Plus size={18} />;
            label = t('diff.onlyInB');
            bg = 'rgba(16, 185, 129, 0.1)';
          } else if (d.status === 'missing_in_b') {
            color = '#ef4444';
            icon = <Minus size={18} />;
            label = t('diff.onlyInA');
            bg = 'rgba(239, 68, 68, 0.1)';
          } else if (d.status === 'different') {
            color = '#f59e0b';
            icon = <Edit size={18} />;
            label = t('diff.different');
            bg = 'rgba(245, 158, 11, 0.1)';
          }
          return (
            <Group key={d.key} align="center" gap="md" style={{ 
              background: bg, 
              borderRadius: 16, 
              padding: '16px 24px', 
              fontFamily: 'JetBrains Mono, Fira Code, monospace', 
              minHeight: 56,
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <ThemeIcon color={color} variant="light" size="md" radius="lg">{icon}</ThemeIcon>
              <Tooltip label={label} withArrow>
                <Text size="lg" fw={700} style={{ minWidth: 160, color: '#f1f5f9', letterSpacing: '-0.5px' }}>{d.key}</Text>
              </Tooltip>
              <Text size="lg" style={{ 
                flex: 1, 
                color: d.status === 'missing_in_b' ? '#ef4444' : d.status === 'missing_in_a' ? '#10b981' : d.status === 'different' ? '#f59e0b' : '#94a3b8', 
                textDecoration: d.status === 'equal' ? 'line-through' : undefined, 
                opacity: d.status === 'equal' ? 0.5 : 1,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                fontWeight: 500
              }}>
                {d.status === 'missing_in_a' ? '' : d.valueA}
              </Text>
              <Text size="lg" style={{ 
                flex: 1, 
                color: d.status === 'missing_in_a' ? '#10b981' : d.status === 'missing_in_b' ? '#ef4444' : d.status === 'different' ? '#f59e0b' : '#94a3b8', 
                textDecoration: d.status === 'equal' ? 'line-through' : undefined, 
                opacity: d.status === 'equal' ? 0.5 : 1, 
                textAlign: 'right',
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                fontWeight: 500
              }}>
                {d.status === 'missing_in_b' ? '' : d.valueB}
              </Text>
              <CopyButton value={d.status === 'missing_in_a' ? d.valueB : d.valueA} timeout={1500}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? t('diff.copied') : t('diff.copyValue')} withArrow>
                    <ThemeIcon 
                      color={copied ? '#10b981' : '#64748b'} 
                      variant="light" 
                      size="sm" 
                      radius="lg"
                      onClick={copy} 
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      <Copy size={14} />
                    </ThemeIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          );
        })}
      </Stack>
    </Paper>
  );
} 