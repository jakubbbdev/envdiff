import { useState, useRef } from "react";
import {
  MantineProvider,
  Title,
  Text,
  Button,
  Group,
  useMantineColorScheme,
  ActionIcon,
  useComputedColorScheme,
  ThemeIcon,
  Notification,
  Center,
  Box,
  Stack,
  Transition,
  Alert,
  ScrollArea,
  Tooltip,
} from '@mantine/core';
import { Moon, Sun, File, Download, Files, AlertCircle, X, Check, FileDiff, Photo, FileText, Code } from 'tabler-icons-react';
import { EnvDiffPreview } from './EnvDiffPreview';
import type { DiffEntry } from './EnvDiffPreview';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function parseEnv(content: string): Record<string, string> {
  const lines = content.split(/\r?\n/);
  const env: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    env[key] = value;
  }
  return env;
}

function diffEnv(a: Record<string, string>, b: Record<string, string>) {
  const allKeys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
  return allKeys.map(key => {
    if (!(key in a)) return { key, status: 'missing_in_a', valueA: '', valueB: b[key] };
    if (!(key in b)) return { key, status: 'missing_in_b', valueA: a[key], valueB: '' };
    if (a[key] !== b[key]) return { key, status: 'different', valueA: a[key], valueB: b[key] };
    return { key, status: 'equal', valueA: a[key], valueB: b[key] };
  });
}

function ExportButtons({ diff, envA, envB }: { diff: any[]; envA: any; envB: any }) {
  const getExport = (type: 'csv' | 'md' | 'txt' | 'json') => {
    if (!envA || !envB) return '';
    if (type === 'csv') {
      return 'Key,Status,Value A,Value B\n' + diff.map(d => `${d.key},${d.status},"${d.valueA}","${d.valueB}"`).join('\n');
    } else if (type === 'md') {
      return '| Key | Status | Value A | Value B |\n|---|---|---|---|\n' + diff.map(d => `| ${d.key} | ${d.status} | ${d.valueA} | ${d.valueB} |`).join('\n');
    } else if (type === 'json') {
      return JSON.stringify({ diff, summary: { total: diff.length, equal: diff.filter(d => d.status === 'equal').length, different: diff.filter(d => d.status === 'different').length, missing: diff.filter(d => d.status.includes('missing')).length } }, null, 2);
    } else {
      return diff.map(d => `${d.key}: [${d.status}]\nA: ${d.valueA}\nB: ${d.valueB}\n`).join('\n');
    }
  };

  const download = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const downloadAsPNG = async () => {
    const diffNode = document.getElementById('envdiff-preview');
    if (!diffNode) return;
    const canvas = await html2canvas(diffNode, { backgroundColor: null, scale: 2 });
    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'envdiff.png';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      }
    });
  };

  const downloadAsPDF = async () => {
    const diffNode = document.getElementById('envdiff-preview');
    if (!diffNode) return;
    const canvas = await html2canvas(diffNode, { backgroundColor: null, scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('envdiff.pdf');
  };

  return (
    <Group gap="md" mt="lg" justify="center" wrap="wrap">
      <Button leftSection={<Download size={18} />} variant="light" color="blue" size="md" radius="xl" onClick={() => download(getExport('csv'), 'envdiff.csv', 'text/csv')}>CSV</Button>
      <Button leftSection={<FileText size={18} />} variant="light" color="teal" size="md" radius="xl" onClick={() => download(getExport('md'), 'envdiff.md', 'text/markdown')}>Markdown</Button>
      <Button leftSection={<Code size={18} />} variant="light" color="violet" size="md" radius="xl" onClick={() => download(getExport('json'), 'envdiff.json', 'application/json')}>JSON</Button>
      <Button leftSection={<FileText size={18} />} variant="light" color="gray" size="md" radius="xl" onClick={() => download(getExport('txt'), 'envdiff.txt', 'text/plain')}>Text</Button>
      <Button leftSection={<Photo size={18} />} variant="light" color="orange" size="md" radius="xl" onClick={downloadAsPNG}>PNG</Button>
      <Button leftSection={<FileText size={18} />} variant="light" color="red" size="md" radius="xl" onClick={downloadAsPDF}>PDF</Button>
    </Group>
  );
}

function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('dark');
  return (
    <ActionIcon
      onClick={() => setColorScheme(computed === 'dark' ? 'light' : 'dark')}
      size="lg"
      variant="gradient"
      gradient={{ from: 'indigo', to: 'cyan' }}
      aria-label="Farbschema wechseln"
      style={{ position: 'absolute', top: 18, right: 18, zIndex: 10 }}
    >
      {computed === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
    </ActionIcon>
  );
}

function FileUploadButton({ label, file, onFile, onRemove }: { label: string, file: File | null, onFile: (file: File) => void, onRemove: () => void }) {
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
        <Tooltip label="Entfernen">
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

export default function App() {
  const [envA, setEnvA] = useState<Record<string, string> | null>(null);
  const [envB, setEnvB] = useState<Record<string, string> | null>(null);
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [notif, setNotif] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
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
  const status = !envA || !envB ? null :
    diff.every(d => d.status === 'equal') ? (
      <Alert color="teal" icon={<Check size={18} />} radius="md" mb="md" style={{ fontWeight: 600, fontSize: 16, justifyContent: 'center', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>Die Dateien sind identisch.</Alert>
    ) : (
      <Alert color="yellow" icon={<FileDiff size={18} />} radius="md" mb="md" style={{ fontWeight: 600, fontSize: 16, justifyContent: 'center', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>Unterschiede gefunden!</Alert>
    );

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
        {/* Header */}
        <Box style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'rgba(30,41,59,0.95)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
          padding: '0.5rem 2rem 0.5rem 2rem',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          marginBottom: 32,
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(8px)'
        }}>
          <Group justify="space-between" align="center" gap="md">
            <Group gap="sm">
              <ThemeIcon size="36" radius="xl" variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
                <Files size={22} />
              </ThemeIcon>
              <Box>
                <Title order={2} size="h2" fw={900} style={{ letterSpacing: -1, color: '#fff', textShadow: '0 2px 8px #0002', lineHeight: 1.1 }}>EnvDiff</Title>
                <Text c="#cbd5e1" size="sm" style={{ fontWeight: 400, opacity: 0.8, marginTop: 2 }}>Vergleiche und synchronisiere deine <b style={{ color: '#fff' }}>.env</b>-Dateien</Text>
              </Box>
            </Group>
            <ColorSchemeToggle />
          </Group>
        </Box>
        {/* Datei-Uploads */}
        <Group justify="center" align="flex-start" gap={48} style={{ margin: '0 auto', maxWidth: 1000, marginBottom: 40 }}>
          <FileUploadButton label="Datei A wählen" file={fileA} onFile={f => handleFile('A', f)} onRemove={() => { setFileA(null); setEnvA(null); }} />
          <FileUploadButton label="Datei B wählen" file={fileB} onFile={f => handleFile('B', f)} onRemove={() => { setFileB(null); setEnvB(null); }} />
        </Group>
        {/* Notifications */}
        <Transition mounted={!!notif} transition="slide-up" duration={400} timingFunction="ease">
          {(styles) => notif ? (
            <Notification
              style={{ ...styles, maxWidth: 600, margin: '0 auto 24px auto' }}
              color={notif.type === 'success' ? 'teal' : 'red'}
              icon={notif.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
              onClose={() => setNotif(null)}
              withCloseButton
              mt="xs"
              radius="xl"
            >
              {notif.message}
            </Notification>
          ) : <></>}
        </Transition>
        {/* Status */}
        {status}
        {/* Diff-Ansicht */}
        <Box style={{ maxWidth: 1000, margin: '0 auto', marginTop: 24 }}>
          {envA && envB ? (
            <>
              <ScrollArea h={480} type="auto" offsetScrollbars>
                <EnvDiffPreview diff={diff} />
              </ScrollArea>
              <ExportButtons diff={diff} envA={envA} envB={envB} />
            </>
          ) : (
            <Center h={240}>
              <Stack align="center" gap="lg">
                <ThemeIcon size={64} radius="xl" variant="light" color="gray" style={{ opacity: 0.6 }}>
                  <FileDiff size={40} />
                </ThemeIcon>
                <Text c="dimmed" size="xl" fw={500} ta="center" style={{ maxWidth: 400, lineHeight: 1.6 }}>
                  Bitte wähle zwei .env- oder .txt-Dateien aus, um die Unterschiede anzuzeigen.
                </Text>
              </Stack>
            </Center>
          )}
        </Box>
      </Box>
    </MantineProvider>
  );
}
