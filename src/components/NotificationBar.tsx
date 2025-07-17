import { Notification, Transition } from '@mantine/core';
import { Check, AlertCircle } from 'tabler-icons-react';

export function NotificationBar({ notif, onClose }: { notif: { type: 'success' | 'error', message: string } | null, onClose: () => void }) {
  return (
    <Transition mounted={!!notif} transition="slide-up" duration={400} timingFunction="ease">
      {(styles) => notif ? (
        <Notification
          style={{ ...styles, maxWidth: 600, margin: '0 auto 24px auto' }}
          color={notif.type === 'success' ? 'teal' : 'red'}
          icon={notif.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          onClose={onClose}
          withCloseButton
          mt="xs"
          radius="xl"
        >
          {notif.message}
        </Notification>
      ) : <></>}
    </Transition>
  );
} 