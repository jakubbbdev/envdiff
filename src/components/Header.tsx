import { Group, ThemeIcon, Title, Text, Box } from '@mantine/core';
import { Files } from 'tabler-icons-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

export function Header({ right }: { right?: ReactNode }) {
  const { t } = useTranslation();

  return (
    <Box style={{
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(51,65,85,0.95) 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(99,102,241,0.1)',
      padding: '1rem 2rem',
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      marginBottom: 40,
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(20px)',
      overflow: 'hidden'
    }}>
      {/* Animated background gradient */}
      <Box style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, transparent 30%, rgba(99,102,241,0.1) 50%, transparent 70%)',
        animation: 'shimmer 3s ease-in-out infinite',
        zIndex: -1
      }} />
      
      <Group justify="space-between" align="center" gap="md">
        <Group gap="lg">
          <ThemeIcon 
            size="48" 
            radius="xl" 
            variant="gradient" 
            gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}
            style={{
              boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          >
            <Files size={28} />
          </ThemeIcon>
          <Box>
            <Title 
              order={2} 
              size="h1" 
              fw={900} 
              style={{ 
                letterSpacing: -2, 
                color: '#fff', 
                textShadow: '0 4px 16px rgba(0,0,0,0.3)', 
                lineHeight: 1,
                background: 'linear-gradient(135deg, #fff 0%, #e2e8f0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {t('app.title')}
            </Title>
            <Text 
              c="#cbd5e1" 
              size="md" 
              style={{ 
                fontWeight: 500, 
                opacity: 0.9, 
                marginTop: 4,
                textShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              {t('app.subtitle')}
            </Text>
          </Box>
        </Group>
        <Group gap="md">
          {right}
          <LanguageSelector />
        </Group>
      </Group>
    </Box>
  );
} 