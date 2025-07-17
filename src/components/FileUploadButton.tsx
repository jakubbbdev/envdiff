import { Group, Button, ActionIcon, Tooltip } from '@mantine/core';
import { File, X } from 'tabler-icons-react';
import { useRef } from 'react';

export function FileUploadButton({ label, file, onFile, onRemove }: { label: string, file: File | null, onFile: (file: File) => void, onRemove: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <Group align="center" gap="md" style={{ minWidth: 280 }}>
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
        gradient={file ? undefined : { from: 'indigo', to: 'cyan' }}
        color={file ? 'teal' : undefined}
        leftSection={<File size={24} />}
        onClick={handleClick}
        style={{
          flex: 1,
          fontWeight: 600,
          fontSize: 20,
          justifyContent: 'flex-start',
          minHeight: 64,
          borderRadius: 20,
          boxShadow: file ? '0 4px 12px rgba(0,0,0,0.1)' : '0 8px 24px rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease'
        }}
      >
        {file ? file.name : label}
      </Button>
      {file && (
        <Tooltip label="Remove">
          <ActionIcon
            color="red"
            variant="light"
            onClick={onRemove}
            size="xl"
            radius="xl"
            style={{ minWidth: 48, minHeight: 48 }}
          >
            <X size={24} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
} 