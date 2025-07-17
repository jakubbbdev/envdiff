import { useState, useRef } from "react";
import {
  MantineProvider,
  Text,
  Group,
  ThemeIcon,
  Center,
  Box,
  Stack,
  ScrollArea,
} from '@mantine/core';
import { FileDiff } from 'tabler-icons-react';
import { useTranslation } from 'react-i18next';
import { EnvDiffPreview } from './EnvDiffPreview';
import type { DiffEntry } from './EnvDiffPreview';
import { parseEnv, diffEnv } from './utils/envUtils';
import { Header } from './components/Header';
import { FileUploadButton } from './components/FileUploadButton';
import { DiffSwitch } from './components/DiffSwitch';
import { ExportButtons } from './components/ExportButtons';
import { StatusBanner } from './components/StatusBanner';
import { NotificationBar } from './components/NotificationBar';
import './i18n';
import './styles/animations.css';

export default function App() {
  const [envA, setEnvA] = useState<Record<string, string> | null>(null);
  const [envB, setEnvB] = useState<Record<string, string> | null>(null);
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [notif, setNotif] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Datei aus Dropzone laden
  const handleFile = async (which: 'A' | 'B', file: File) => {
    const name = file.name.toLowerCase();
    if (!name.endsWith('.env') && !name.endsWith('.txt')) {
      setNotif({ type: 'error', message: t('upload.error') });
      return;
    }
    try {
      const text = await file.text();
      if (which === 'A') {
        setEnvA(parseEnv(text));
        setFileA(file);
      } else {
        setEnvB(parseEnv(text));
        setFileB(file);
      }
      setNotif({ type: 'success', message: t('upload.success', { name: file.name }) });
    } catch (e) {
      setNotif({ type: 'error', message: t('upload.readError') });
    }
  };

  // Drag & Drop Handler
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.env') || f.name.endsWith('.txt'));
    if (files.length === 0) {
      setNotif({ type: 'error', message: t('upload.error') });
      return;
    }
    if (!fileA) {
      handleFile('A', files[0]);
    } else if (!fileB) {
      handleFile('B', files[0]);
    } else {
      setNotif({ type: 'error', message: t('upload.bothSlotsFull') });
    }
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const diff: DiffEntry[] = envA && envB ? diffEnv(envA, envB) as DiffEntry[] : [];
  const filteredDiff = showOnlyDiff
    ? diff.filter(d => d.status !== 'equal')
    : diff;

  return (
    <MantineProvider
      withCssVariables
      theme={{
        primaryColor: 'indigo',
        fontFamily: 'Inter, system-ui, sans-serif',
        defaultRadius: 'xl',
        headings: { fontWeight: '800' },
        components: {
          Button: { defaultProps: { radius: 'xl', size: 'lg' } },
          Card: { defaultProps: { radius: 'xl', shadow: 'xl' } },
          Paper: { defaultProps: { radius: 'lg', shadow: 'md' } },
        },
      }}
      defaultColorScheme="dark"
    >
      <Box 
        ref={appRef} 
        className="animate-gradientShift"
        style={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #0f1419 100%)',
          backgroundSize: '400% 400%',
          paddingBottom: 80, 
          position: 'relative' 
        }}
        onDrop={onDrop} 
        onDragOver={onDragOver} 
        onDragLeave={onDragLeave}
      >
        {/* Drag Overlay */}
        {dragActive && (
          <Box style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(99, 102, 241, 0.15)', 
            backdropFilter: 'blur(8px)', 
            zIndex: 100, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            pointerEvents: 'none' 
          }}>
            <Box style={{ 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)', 
              padding: '4rem 5rem', 
              borderRadius: 40, 
              boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 8px 24px rgba(99,102,241,0.3)', 
              border: '2px dashed #6366f1',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              <Text size="xl" fw={700} c="indigo" ta="center" style={{ fontSize: 28 }}>
                {t('upload.dragDrop')}
              </Text>
            </Box>
          </Box>
        )}
        <Header />
        {/* Datei-Uploads */}
        <Box className="animate-fadeIn" style={{ margin: '0 auto', maxWidth: 1200, marginBottom: 50 }}>
          <Group justify="center" align="flex-start" gap={64}>
            <FileUploadButton label={t('upload.fileA')} file={fileA} onFile={f => handleFile('A', f)} onRemove={() => { setFileA(null); setEnvA(null); }} />
            <FileUploadButton label={t('upload.fileB')} file={fileB} onFile={f => handleFile('B', f)} onRemove={() => { setFileB(null); setEnvB(null); }} />
          </Group>
        </Box>
        {/* Notifications */}
        <NotificationBar notif={notif} onClose={() => setNotif(null)} />
        {/* Status */}
        <StatusBanner diff={filteredDiff} envA={envA} envB={envB} />
        {/* Diff-Ansicht */}
        <Box style={{ maxWidth: 1200, margin: '0 auto', marginTop: 32 }}>
          {envA && envB ? (
            <Box className="animate-fadeIn">
              <Group justify="end" mb="lg">
                <DiffSwitch checked={showOnlyDiff} onChange={setShowOnlyDiff} />
              </Group>
              <ScrollArea h={520} type="auto" offsetScrollbars>
                <EnvDiffPreview diff={filteredDiff} />
              </ScrollArea>
              <ExportButtons diff={filteredDiff} envA={envA} envB={envB} />
            </Box>
          ) : (
            <Center h={320}>
              <Stack align="center" gap="xl" className="animate-fadeIn">
                <ThemeIcon 
                  size={80} 
                  radius="xl" 
                  variant="light" 
                  color="gray" 
                  style={{ 
                    opacity: 0.7,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <FileDiff size={48} />
                </ThemeIcon>
                <Text 
                  c="dimmed" 
                  size="xl" 
                  fw={500} 
                  ta="center" 
                  style={{ 
                    maxWidth: 500, 
                    lineHeight: 1.6,
                    background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {t('status.selectFiles')}
                </Text>
              </Stack>
            </Center>
          )}
        </Box>
      </Box>
    </MantineProvider>
  );
}
