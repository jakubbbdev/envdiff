import { useState, useRef, useMemo, useCallback } from "react";
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
import { demoEnvA, demoEnvB } from './demoData';

export default function App() {
  const [envA, setEnvA] = useState<Record<string, string> | null>(null);
  const [envB, setEnvB] = useState<Record<string, string> | null>(null);
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [notif, setNotif] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Memoized diff calculation
  const diff: DiffEntry[] = useMemo(() => {
    return envA && envB ? diffEnv(envA, envB) as DiffEntry[] : [];
  }, [envA, envB]);

  // Memoized filtered diff
  const filteredDiff = useMemo(() => {
    return showOnlyDiff ? diff.filter(d => d.status !== 'equal') : diff;
  }, [diff, showOnlyDiff]);

  // Demo-Daten laden
  const loadDemoData = useCallback(() => {
    setEnvA(demoEnvA);
    setEnvB(demoEnvB);
    setFileA(null);
    setFileB(null);
    setDemoMode(true);
    setNotif({ type: 'success', message: t('status.demoLoaded') });
  }, [t]);

  // Optimized file handler
  const handleFile = useCallback(async (which: 'A' | 'B', file: File) => {
    setDemoMode(false);
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
  }, [t]);

  // Optimized drag & drop handlers
  const onDrop = useCallback(async (e: React.DragEvent) => {
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
  }, [fileA, fileB, handleFile, t]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  // Optimized remove handlers
  const removeFileA = useCallback(() => {
    setFileA(null);
    setEnvA(null);
  }, []);

  const removeFileB = useCallback(() => {
    setFileB(null);
    setEnvB(null);
  }, []);

  const closeNotification = useCallback(() => {
    setNotif(null);
  }, []);

  // Memoized theme configuration
  const theme = useMemo(() => ({
    primaryColor: 'indigo',
    fontFamily: 'Inter, system-ui, sans-serif',
    defaultRadius: 'xl',
    headings: { fontWeight: '800' },
    components: {
      Button: { defaultProps: { radius: 'xl', size: 'lg' } },
      Card: { defaultProps: { radius: 'xl', shadow: 'xl' } },
      Paper: { defaultProps: { radius: 'lg', shadow: 'md' } },
    },
  }), []);

  return (
    <MantineProvider
      withCssVariables
      theme={theme}
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
        <Group justify="center" align="flex-start" gap={64}>
          <FileUploadButton 
            label={t('upload.fileA')} 
            file={fileA} 
            onFile={(f) => handleFile('A', f)} 
            onRemove={removeFileA} 
          />
          <FileUploadButton 
            label={t('upload.fileB')} 
            file={fileB} 
            onFile={(f) => handleFile('B', f)} 
            onRemove={removeFileB} 
          />
        </Group>
        <Center mt="md">
          <button onClick={loadDemoData} style={{
            background: '#6366f1', color: 'white', border: 'none', borderRadius: 12, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.15)'}}>
            {t('status.loadDemo')}
          </button>
        </Center>
        {demoMode && (
          <Center mt="md">
            <div style={{background: '#f59e0b', color: '#1e293b', borderRadius: 12, padding: '8px 24px', fontWeight: 600, fontSize: 16, marginTop: 12}}>
              {t('status.demoActive')}
            </div>
          </Center>
        )}
        {/* Notifications */}
        <NotificationBar notif={notif} onClose={closeNotification} />
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
