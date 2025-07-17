import { Group, Button, ActionIcon, Tooltip } from '@mantine/core';
import { File, X } from 'tabler-icons-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export function FileUploadButton({ label, file, onFile, onRemove }: { label: string, file: File | null, onFile: (file: File) => void, onRemove: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      onFile(selectedFile);
      event.target.value = '';
    }
  };

  return (
    <Group align="center" gap="md" style={{ minWidth: 320 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".env,.txt"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Button
        size="xl"
        variant={file ? 'light' : 'gradient'}
        gradient={file ? undefined : { from: 'indigo', to: 'cyan', deg: 135 }}
        color={file ? 'teal' : undefined}
        leftSection={<File size={28} />}
        onClick={handleClick}
        style={{
          flex: 1,
          fontWeight: 700,
          fontSize: 22,
          justifyContent: 'flex-start',
          minHeight: 72,
          borderRadius: 24,
          boxShadow: file 
            ? '0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(20,184,166,0.2)' 
            : '0 16px 40px rgba(0,0,0,0.3), 0 4px 12px rgba(99,102,241,0.4)',
          transition: 'all 0.3s ease',
          background: file 
            ? 'linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(20,184,166,0.05) 100%)'
            : undefined,
          border: file ? '1px solid rgba(20,184,166,0.2)' : undefined,
          backdropFilter: file ? 'blur(10px)' : undefined
        }}
        className={file ? undefined : 'animate-glow'}
      >
        {file ? file.name : label}
      </Button>
      {file && (
        <Tooltip label={t('upload.removeFile')}>
          <ActionIcon
            color="red"
            variant="light"
            onClick={onRemove}
            size="xl"
            radius="xl"
            style={{ 
              minWidth: 56, 
              minHeight: 56,
              background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)',
              border: '1px solid rgba(239,68,68,0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <X size={28} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
} 