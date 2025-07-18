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
import './i18n';
import './styles/animations.css';
import { demoEnvA, demoEnvB } from './demoData';

export default function App() {
  const [envA, setEnvA] = useState<Record<string, string> | null>(null);
  const [envB, setEnvB] = useState<Record<string, string> | null>(null);
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
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
  }, [t]);

  // Optimized file handler
  const handleFile = useCallback(async (which: 'A' | 'B', file: File) => {
    setDemoMode(false);
    const name = file.name.toLowerCase();
    if (!name.endsWith('.env') && !name.endsWith('.txt')) {
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
    } catch (e) {
    }
  }, [t]);

  // Optimized drag & drop handlers
  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.env') || f.name.endsWith('.txt'));
    if (files.length === 0) {
      return;
    }
    if (!fileA) {
      handleFile('A', files[0]);
    } else if (!fileB) {
      handleFile('B', files[0]);
    } else {
      // setNotif({ type: 'error', message: t('upload.bothSlotsFull') }); // entfernt
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

  // Memoized theme configuration
  const theme = useMemo(() => ({
    primaryColor: 'cyan',
    fontFamily: 'Inter, Fira Sans, system-ui, sans-serif',
    fontSizes: { xs: '14px', sm: '15px', md: '16px', lg: '18px', xl: '22px' },
    defaultRadius: 12,
    spacing: { xs: '6px', sm: '10px', md: '16px', lg: '24px', xl: '32px' },
    headings: { fontWeight: '900', fontFamily: 'inherit' },
    components: {
      Button: { defaultProps: { radius: 10, size: 'md', fw: 600, style: { padding: '8px 20px', fontSize: 16, letterSpacing: -0.2, background: '#232329', color: '#fff', border: '1px solid #232329', boxShadow: 'none' } } },
      Card: { defaultProps: { radius: 12, shadow: 'sm', p: 20, style: { background: '#232329', border: '1px solid #232329', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' } } },
      Paper: { defaultProps: { radius: 12, shadow: 'sm', p: 20, style: { background: '#232329', border: '1px solid #232329', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' } } },
      Group: { defaultProps: { gap: 16 } },
      Stack: { defaultProps: { gap: 16 } },
      Text: { defaultProps: { size: 'md', fw: 500, style: { letterSpacing: -0.1 } } }
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
        style={{ 
          minHeight: '100vh', 
          background: '#18181b',
          padding: '24px 0 48px 0',
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
          {!demoMode ? (
            <button onClick={loadDemoData} style={{
              background: 'transparent',
              color: '#fff',
              border: '1.5px solid #333',
              borderRadius: 6,
              padding: '6px 16px',
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: 0,
              cursor: 'pointer',
              transition: 'border 0.15s, color 0.15s',
              outline: 'none',
              marginRight: 8,
              boxShadow: 'none',
              lineHeight: 1.2
            }}
            onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.border = '1.5px solid #06b6d4'; (e.currentTarget as HTMLButtonElement).style.color = '#06b6d4'; }}
            onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.border = '1.5px solid #333'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            >
              {t('status.loadDemo')}
            </button>
          ) : (
            <button onClick={() => { setEnvA(null); setEnvB(null); setDemoMode(false); }} style={{
              background: 'transparent',
              color: '#aaa',
              border: '1.5px solid #333',
              borderRadius: 6,
              padding: '6px 16px',
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: 0,
              cursor: 'pointer',
              transition: 'border 0.15s, color 0.15s',
              outline: 'none',
              marginRight: 8,
              boxShadow: 'none',
              lineHeight: 1.2
            }}
            onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.border = '1.5px solid #ef4444'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
            onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.border = '1.5px solid #333'; (e.currentTarget as HTMLButtonElement).style.color = '#aaa'; }}
            >
              {t('status.removeDemo')}
            </button>
          )}
          {demoMode && (
            <span style={{
              display: 'inline-block',
              background: '#232329',
              color: '#06b6d4',
              borderRadius: 6,
              padding: '2px 10px',
              fontWeight: 500,
              fontSize: 12,
              marginLeft: 8,
              border: '1px solid #06b6d4',
              verticalAlign: 'middle',
              lineHeight: 1.2
            }}>{t('status.demoActive')}</span>
          )}
        </Center>
        {/* Notifications */}
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
