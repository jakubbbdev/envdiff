import { ActionIcon, Menu } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Language } from 'tabler-icons-react';

export function LanguageSelector() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon
          size="lg"
          variant="light"
          color="gray"
          aria-label="Change language"
        >
          <Language size={20} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('language.selector')}</Menu.Label>
        <Menu.Item
          onClick={() => changeLanguage('en')}
          style={{ 
            fontWeight: i18n.language === 'en' ? 'bold' : 'normal',
            backgroundColor: i18n.language === 'en' ? 'var(--mantine-color-blue-1)' : 'transparent'
          }}
        >
          🇺🇸 {t('language.en')}
        </Menu.Item>
        <Menu.Item
          onClick={() => changeLanguage('de')}
          style={{ 
            fontWeight: i18n.language === 'de' ? 'bold' : 'normal',
            backgroundColor: i18n.language === 'de' ? 'var(--mantine-color-blue-1)' : 'transparent'
          }}
        >
          🇩🇪 {t('language.de')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
} 