import { ActionIcon, Menu, Divider } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Language } from 'tabler-icons-react';

export function LanguageSelector() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Menu shadow="xl" width={220} position="bottom-end" offset={8}>
      <Menu.Target>
        <ActionIcon
          size={48}
          variant="gradient"
          gradient={{ from: 'cyan', to: 'blue', deg: 135 }}
          color="blue"
          aria-label="Change language"
          style={{ boxShadow: '0 4px 16px rgba(59,130,246,0.13)', borderRadius: 16 }}
        >
          <Language size={28} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown style={{ borderRadius: 16, padding: 8 }}>
        <Menu.Label style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{t('language.selector')}</Menu.Label>
        <Divider my={4} />
        <Menu.Item
          onClick={() => changeLanguage('en')}
          style={{ 
            fontWeight: i18n.language === 'en' ? 'bold' : 'normal',
            backgroundColor: i18n.language === 'en' ? 'var(--mantine-color-blue-1)' : 'transparent',
            fontSize: 18,
            borderRadius: 12,
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <span style={{ fontSize: 22, marginRight: 8 }}>🇺🇸</span> {t('language.en')}
        </Menu.Item>
        <Menu.Item
          onClick={() => changeLanguage('de')}
          style={{ 
            fontWeight: i18n.language === 'de' ? 'bold' : 'normal',
            backgroundColor: i18n.language === 'de' ? 'var(--mantine-color-blue-1)' : 'transparent',
            fontSize: 18,
            borderRadius: 12,
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <span style={{ fontSize: 22, marginRight: 8 }}>🇩🇪</span> {t('language.de')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
} 