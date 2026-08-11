'use client';

import styles from './RecordingControls.module.scss';

import { useEffect, useState } from 'react';

import { button, custom, useControls } from '../../baseDebugPanel';

export type UseRecordingControlsProps = {
  recordingFormat: string;
  defaultRecordingFormat: string;
  recordingFormatOptions: Record<string, string>;
  isRecording: boolean;
  onChangeFormat: (value: string) => void;
  onToggleRecording: () => void;
};

function formatRecordingDuration(ms: number): string {
  const totalCentiseconds = Math.floor(ms / 10);
  const hours = Math.floor(totalCentiseconds / 360000);
  const minutes = Math.floor((totalCentiseconds % 360000) / 6000);
  const seconds = Math.floor((totalCentiseconds % 6000) / 100);
  const centiseconds = totalCentiseconds % 100;
  return [hours, minutes, seconds, centiseconds].map((unit) => String(unit).padStart(2, '0')).join(':');
}

function RecordingStatus() {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = performance.now();
    const updateElapsed = () => {
      setElapsedMs(performance.now() - startedAt);
    };

    updateElapsed();
    const intervalId = window.setInterval(updateElapsed, 100);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className={styles.recordingStatus}>
      <span className={styles.recordingDot} />
      <span className={styles.recordingTime}>{formatRecordingDuration(elapsedMs)}</span>
    </div>
  );
}

export function useRecordingControls({
  recordingFormat,
  defaultRecordingFormat,
  recordingFormatOptions,
  isRecording,
  onChangeFormat,
  onToggleRecording,
}: UseRecordingControlsProps) {
  useControls('Recording', () => ({
    format: {
      type: 'select',
      label: 'Format',
      layout: 'stacked',
      rowClassName: styles.recordingFormatRow,
      triggerClassName: styles.recordingFormatTrigger,
      value: recordingFormat || defaultRecordingFormat,
      options: recordingFormatOptions,
      onChange: (value: unknown) => { onChangeFormat(String(value)); },
    },
    record: button(onToggleRecording, {
      label: isRecording ? 'Stop Recording' : 'Record',
      variant: isRecording ? 'primary' : 'secondary',
    }),
    recordingStatus: custom(<RecordingStatus />, { render: () => isRecording }),
  }), [recordingFormat, defaultRecordingFormat, recordingFormatOptions, isRecording, onChangeFormat, onToggleRecording]);
}

