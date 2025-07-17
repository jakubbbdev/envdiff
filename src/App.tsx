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
import { EnvDiffPreview } from './EnvDiffPreview';
import type { DiffEntry } from './EnvDiffPreview';
import { parseEnv, diffEnv } from './utils/envUtils';
import { Header } from './components/Header';
import { FileUploadButton } from './components/FileUploadButton';
import { DiffSwitch } from './components/DiffSwitch';
import { ExportButtons } from './components/ExportButtons';
import { StatusBanner } from './components/StatusBanner';
import { NotificationBar } from './components/NotificationBar';

export default function App() {
  const [envA, setEnvA] = useState<Record<string, string> | null>(null);
  const [envB, setEnvB] = useState<Record<string, string> | null>(null);
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [notif, setNotif] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);

  // Datei aus Dropzone laden
  const handleFile = async (which: 'A' | 'B', file: File) => {
    const name = file.name.toLowerCase();
    if (!name.endsWith('.env') && !name.endsWith('.txt')) {
      setNotif({ type: 'error', message: 'Nur .env oder .txt-Dateien erlaubt!' });
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
      setNotif({ type: 'success', message: `Datei ${file.name} geladen!` });
    } catch (e) {
      setNotif({ type: 'error', message: 'Datei konnte nicht gelesen werden.' });
    }
  };

  // Drag & Drop Handler
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.env') || f.name.endsWith('.txt'));
    if (files.length === 0) {
      setNotif({ type: 'error', message: 'Nur .env oder .txt-Dateien erlaubt!' });
      return;
    }
    if (!fileA) {
      handleFile('A', files[0]);
    } else if (!fileB) {
      handleFile('B', files[0]);
    } else {
      setNotif({ type: 'error', message: 'Beide Slots sind belegt. Entferne zuerst eine Datei.' });
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
      <Box ref={appRef} style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)', paddingBottom: 80, position: 'relative' }}
        onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>
        {/* Drag Overlay */}
        {dragActive && (
          <Box style={{ position: 'fixed', inset: 0, background: 'rgba(99, 102, 241, 0.1)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <Box style={{ background: 'rgba(255,255,255,0.95)', padding: '3rem 4rem', borderRadius: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '2px dashed #6366f1' }}>
              <Text size="xl" fw={700} c="indigo" ta="center">Datei hier ablegen…</Text>
            </Box>
          </Box>
        )}
        <Header />
        {/* Datei-Uploads */}
        <Group justify="center" align="flex-start" gap={48} style={{ margin: '0 auto', maxWidth: 1000, marginBottom: 40 }}>
          <FileUploadButton label="Datei A wählen" file={fileA} onFile={f => handleFile('A', f)} onRemove={() => { setFileA(null); setEnvA(null); }} />
          <FileUploadButton label="Datei B wählen" file={fileB} onFile={f => handleFile('B', f)} onRemove={() => { setFileB(null); setEnvB(null); }} />
        </Group>
        {/* Notifications */}
        <NotificationBar notif={notif} onClose={() => setNotif(null)} />
        {/* Status */}
        <StatusBanner diff={filteredDiff} envA={envA} envB={envB} />
        {/* Diff-Ansicht */}
        <Box style={{ maxWidth: 1000, margin: '0 auto', marginTop: 24 }}>
          {envA && envB ? (
            <>
              <Group justify="end" mb="sm">
                <DiffSwitch checked={showOnlyDiff} onChange={setShowOnlyDiff} />
              </Group>
              <ScrollArea h={480} type="auto" offsetScrollbars>
                <EnvDiffPreview diff={filteredDiff} />
              </ScrollArea>
              <ExportButtons diff={filteredDiff} envA={envA} envB={envB} />
            </>
          ) : (
            <Center h={240}>
              <Stack align="center" gap="lg">
                <ThemeIcon size={64} radius="xl" variant="light" color="gray" style={{ opacity: 0.6 }}>
                  <FileDiff size={40} />
                </ThemeIcon>
                <Text c="dimmed" size="xl" fw={500} ta="center" style={{ maxWidth: 400, lineHeight: 1.6 }}>
                  Please select two .env or .txt files to show the differences.
                </Text>
              </Stack>
            </Center>
          )}
        </Box>
      </Box>
    </MantineProvider>
  );
}
