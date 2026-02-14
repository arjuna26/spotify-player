import type { FC } from 'react';

interface GridScanProps {
  sensitivity?: number;
  lineThickness?: number;
  linesColor?: string;
  scanColor?: string;
  scanOpacity?: number;
  gridScale?: number;
  lineStyle?: string;
  lineJitter?: number;
  scanDirection?: string;
  noiseIntensity?: number;
  scanGlow?: number;
  scanSoftness?: number;
  scanDuration?: number;
  scanDelay?: number;
  scanOnClick?: boolean;
}

declare const GridScan: FC<GridScanProps>;
export default GridScan;