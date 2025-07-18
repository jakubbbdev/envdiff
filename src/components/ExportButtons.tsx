import { Group, Tooltip, ActionIcon } from '@mantine/core';
import { Download, FileText, Code, Photo, Table } from 'tabler-icons-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { memo, useCallback } from 'react';

export const ExportButtons = memo(({ diff, envA, envB }: { diff: any[]; envA: any; envB: any }) => {
  const { t } = useTranslation();

  // Memoized export functions
  const getExport = useCallback((type: 'csv' | 'md' | 'txt' | 'json' | 'xml' | 'yaml') => {
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
  }, [diff, envA, envB]);

  const download = useCallback((content: string, filename: string, type: string) => {
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
  }, []);

  const downloadAsExcel = useCallback(() => {
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
  }, [diff, envA, envB]);

  const downloadAsPNG = useCallback(async () => {
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
  }, []);

  const downloadAsPDF = useCallback(async () => {
    const diffNode = document.getElementById('envdiff-preview');
    if (!diffNode) return;
    const canvas = await html2canvas(diffNode, { backgroundColor: null, scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('envdiff.pdf');
  }, []);

  return (
    <Group gap={8} mt={16} justify="center" wrap="wrap">
      <Tooltip label={t('export.excel')} withArrow>
        <ActionIcon 
          variant="filled"
          color="dark"
          size={36}
          radius={8}
          onClick={downloadAsExcel}
          style={{ background: '#232329', color: '#fff', border: '1px solid #232329', margin: 2 }}
        >
          <Table size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={t('export.csv')} withArrow>
        <ActionIcon 
          variant="filled"
          color="dark"
          size={36}
          radius={8}
          onClick={() => download(getExport('csv'), 'envdiff.csv', 'text/csv')}
          style={{ background: '#232329', color: '#fff', border: '1px solid #232329', margin: 2 }}
        >
          <Download size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={t('export.markdown')} withArrow>
        <ActionIcon 
          variant="filled"
          color="dark"
          size={36}
          radius={8}
          onClick={() => download(getExport('md'), 'envdiff.md', 'text/markdown')}
          style={{ background: '#232329', color: '#fff', border: '1px solid #232329', margin: 2 }}
        >
          <FileText size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={t('export.json')} withArrow>
        <ActionIcon 
          variant="filled"
          color="dark"
          size={36}
          radius={8}
          onClick={() => download(getExport('json'), 'envdiff.json', 'application/json')}
          style={{ background: '#232329', color: '#fff', border: '1px solid #232329', margin: 2 }}
        >
          <Code size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={t('export.text')} withArrow>
        <ActionIcon 
          variant="filled"
          color="dark"
          size={36}
          radius={8}
          onClick={() => download(getExport('txt'), 'envdiff.txt', 'text/plain')}
          style={{ background: '#232329', color: '#fff', border: '1px solid #232329', margin: 2 }}
        >
          <FileText size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={t('export.xml')} withArrow>
        <ActionIcon 
          variant="filled"
          color="dark"
          size={36}
          radius={8}
          onClick={() => download(getExport('xml'), 'envdiff.xml', 'application/xml')}
          style={{ background: '#232329', color: '#fff', border: '1px solid #232329', margin: 2 }}
        >
          <Code size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={t('export.yaml')} withArrow>
        <ActionIcon 
          variant="filled"
          color="dark"
          size={36}
          radius={8}
          onClick={() => download(getExport('yaml'), 'envdiff.yaml', 'text/yaml')}
          style={{ background: '#232329', color: '#fff', border: '1px solid #232329', margin: 2 }}
        >
          <Code size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={t('export.png')} withArrow>
        <ActionIcon 
          variant="filled"
          color="dark"
          size={36}
          radius={8}
          onClick={downloadAsPNG}
          style={{ background: '#232329', color: '#fff', border: '1px solid #232329', margin: 2 }}
        >
          <Photo size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={t('export.pdf')} withArrow>
        <ActionIcon 
          variant="filled"
          color="dark"
          size={36}
          radius={8}
          onClick={downloadAsPDF}
          style={{ background: '#232329', color: '#fff', border: '1px solid #232329', margin: 2 }}
        >
          <FileText size={18} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
});

ExportButtons.displayName = 'ExportButtons'; 