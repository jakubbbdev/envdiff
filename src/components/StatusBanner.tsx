import { Alert } from '@mantine/core';
import { Check, FileDiff } from 'tabler-icons-react';

export function StatusBanner({ diff, envA, envB }: { diff: any[]; envA: any; envB: any }) {
  if (!envA || !envB) return null;
  if (diff.every(d => d.status === 'equal')) {
    return (
      <Alert color="teal" icon={<Check size={18} />} radius="md" mb="md" style={{ fontWeight: 600, fontSize: 16, justifyContent: 'center', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        The files are identical.
      </Alert>
    );
  }
  return (
    <Alert color="yellow" icon={<FileDiff size={18} />} radius="md" mb="md" style={{ fontWeight: 600, fontSize: 16, justifyContent: 'center', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
      Differences found!
    </Alert>
  );
} 