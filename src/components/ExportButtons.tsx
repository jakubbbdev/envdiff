import { Group, Button } from '@mantine/core';
import { Download, FileText, Code, Photo } from 'tabler-icons-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function ExportButtons({ diff, envA, envB }: { diff: any[]; envA: any; envB: any }) {
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