declare module 'react-qr-scanner' {
  import React from 'react';

  interface QrScannerProps {
    delay?: number;
    style?: React.CSSProperties;
    onError?: (err: any) => void;
    onScan?: (data: any) => void;
    constraints?: MediaTrackConstraints | { video: MediaTrackConstraints };
    facingMode?: string;
    resolution?: number;
    chooseDeviceId?: () => string;
    [key: string]: any;
  }

  const QrScanner: React.ComponentType<QrScannerProps>;
  
  export default QrScanner;
}
