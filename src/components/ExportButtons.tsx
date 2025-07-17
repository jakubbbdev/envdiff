import { Group, Button } from '@mantine/core';
import { Download, FileText, Code, Photo, Table } from 'tabler-icons-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';

export function ExportButtons({ diff, envA, envB }: { diff: any[]; envA: any; envB: any }) {
  const { t } = useTranslation();

  const getExport = (type: 'csv' | 'md' | 'txt' | 'json' | 'xml' | 'yaml') => {
    if (!envA || !envB) return '';
    
    if (type === 'csv') {
      return 'Key,Status,Value A,Value B\n' + diff.map(d => `${d.key},${d.status},"${d.valueA}","${d.valueB}"`).join('\n');
    } else if (type === 'md') {
      return '| Key | Status | Value A | Value B |\n|---|---|---|---|\n' + diff.map(d => `| ${d.key} | ${d.status} | ${d.valueA} | ${d.valueB} |`).join('\n');
    } else if (type === 'json') {
      return JSON.stringify({ 
        diff, 
        summary: { 
          total: diff.length, 
          equal: diff.filter(d => d.status === 'equal').length, 
          different: diff.filter(d => d.status === 'different').length, 
          missing: diff.filter(d => d.status.includes('missing')).length 
        } 
      }, null, 2);
    } else if (type === 'xml') {
      return `<?xml version="1.0" encoding="UTF-8"?>
<envdiff>
  <summary>
    <total>${diff.length}</total>
    <equal>${diff.filter(d => d.status === 'equal').length}</equal>
    <different>${diff.filter(d => d.status === 'different').length}</different>
    <missing>${diff.filter(d => d.status.includes('missing')).length}</missing>
  </summary>
  <differences>
${diff.map(d => `    <difference>
      <key>${d.key}</key>
      <status>${d.status}</status>
      <valueA>${d.valueA}</valueA>
      <valueB>${d.valueB}</valueB>
    </difference>`).join('\n')}
  </differences>
</envdiff>`;
    } else if (type === 'yaml') {
      return `summary:
  total: ${diff.length}
  equal: ${diff.filter(d => d.status === 'equal').length}
  different: ${diff.filter(d => d.status === 'different').length}
  missing: ${diff.filter(d => d.status.includes('missing')).length}

differences:
${diff.map(d => `  - key: ${d.key}
    status: ${d.status}
    valueA: ${d.valueA}
    valueB: ${d.valueB}`).join('\n')}`;
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

  const downloadAsExcel = () => {
    if (!envA || !envB) return;

    // Erstelle Arbeitsblätter für verschiedene Ansichten
    const workbook = XLSX.utils.book_new();

    // Hauptarbeitsblatt mit allen Unterschieden
    const mainData = diff.map(d => ({
      Key: d.key,
      Status: d.status,
      'Value A': d.valueA,
      'Value B': d.valueB
    }));
    const mainSheet = XLSX.utils.json_to_sheet(mainData);
    XLSX.utils.book_append_sheet(workbook, mainSheet, 'Differences');

    // Zusammenfassungsarbeitsblatt
    const summaryData = [
      { Metric: 'Total Keys', Count: diff.length },
      { Metric: 'Equal', Count: diff.filter(d => d.status === 'equal').length },
      { Metric: 'Different', Count: diff.filter(d => d.status === 'different').length },
      { Metric: 'Missing in A', Count: diff.filter(d => d.status === 'missing_in_a').length },
      { Metric: 'Missing in B', Count: diff.filter(d => d.status === 'missing_in_b').length }
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Arbeitsblatt nur mit Unterschieden
    const differentData = diff.filter(d => d.status !== 'equal').map(d => ({
      Key: d.key,
      Status: d.status,
      'Value A': d.valueA,
      'Value B': d.valueB
    }));
    if (differentData.length > 0) {
      const differentSheet = XLSX.utils.json_to_sheet(differentData);
      XLSX.utils.book_append_sheet(workbook, differentSheet, 'Only Differences');
    }

    // Excel-Datei herunterladen
    XLSX.writeFile(workbook, 'envdiff.xlsx');
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
    <Group gap="lg" mt="xl" justify="center" wrap="wrap" className="animate-fadeIn">
      <Button 
        leftSection={<Table size={20} />} 
        variant="light" 
        color="green" 
        size="lg" 
        radius="xl" 
        onClick={downloadAsExcel}
        style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.05) 100%)',
          border: '1px solid rgba(34,197,94,0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontWeight: 600
        }}
      >
        {t('export.excel')}
      </Button>
      <Button 
        leftSection={<Download size={20} />} 
        variant="light" 
        color="blue" 
        size="lg" 
        radius="xl" 
        onClick={() => download(getExport('csv'), 'envdiff.csv', 'text/csv')}
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)',
          border: '1px solid rgba(59,130,246,0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontWeight: 600
        }}
      >
        {t('export.csv')}
      </Button>
      <Button 
        leftSection={<FileText size={20} />} 
        variant="light" 
        color="teal" 
        size="lg" 
        radius="xl" 
        onClick={() => download(getExport('md'), 'envdiff.md', 'text/markdown')}
        style={{
          background: 'linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(20,184,166,0.05) 100%)',
          border: '1px solid rgba(20,184,166,0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontWeight: 600
        }}
      >
        {t('export.markdown')}
      </Button>
      <Button 
        leftSection={<Code size={20} />} 
        variant="light" 
        color="violet" 
        size="lg" 
        radius="xl" 
        onClick={() => download(getExport('json'), 'envdiff.json', 'application/json')}
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.05) 100%)',
          border: '1px solid rgba(139,92,246,0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontWeight: 600
        }}
      >
        {t('export.json')}
      </Button>
      <Button 
        leftSection={<FileText size={20} />} 
        variant="light" 
        color="gray" 
        size="lg" 
        radius="xl" 
        onClick={() => download(getExport('txt'), 'envdiff.txt', 'text/plain')}
        style={{
          background: 'linear-gradient(135deg, rgba(107,114,128,0.1) 0%, rgba(107,114,128,0.05) 100%)',
          border: '1px solid rgba(107,114,128,0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontWeight: 600
        }}
      >
        {t('export.text')}
      </Button>
      <Button 
        leftSection={<Code size={20} />} 
        variant="light" 
        color="orange" 
        size="lg" 
        radius="xl" 
        onClick={() => download(getExport('xml'), 'envdiff.xml', 'application/xml')}
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(249,115,22,0.05) 100%)',
          border: '1px solid rgba(249,115,22,0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontWeight: 600
        }}
      >
        {t('export.xml')}
      </Button>
      <Button 
        leftSection={<Code size={20} />} 
        variant="light" 
        color="cyan" 
        size="lg" 
        radius="xl" 
        onClick={() => download(getExport('yaml'), 'envdiff.yaml', 'text/yaml')}
        style={{
          background: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(6,182,212,0.05) 100%)',
          border: '1px solid rgba(6,182,212,0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontWeight: 600
        }}
      >
        {t('export.yaml')}
      </Button>
      <Button 
        leftSection={<Photo size={20} />} 
        variant="light" 
        color="orange" 
        size="lg" 
        radius="xl" 
        onClick={downloadAsPNG}
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(249,115,22,0.05) 100%)',
          border: '1px solid rgba(249,115,22,0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontWeight: 600
        }}
      >
        {t('export.png')}
      </Button>
      <Button 
        leftSection={<FileText size={20} />} 
        variant="light" 
        color="red" 
        size="lg" 
        radius="xl" 
        onClick={downloadAsPDF}
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)',
          border: '1px solid rgba(239,68,68,0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontWeight: 600
        }}
      >
        {t('export.pdf')}
      </Button>
    </Group>
  );
} 