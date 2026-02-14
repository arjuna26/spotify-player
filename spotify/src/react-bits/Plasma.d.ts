import type { FC } from 'react';

interface PlasmaProps {
  color?: string;
  speed?: number;
  direction?: 'forward' | 'backward';
  scale?: number;
  opacity?: number;
  mouseInteractive?: boolean;
}

declare const Plasma: FC<PlasmaProps>;
export default Plasma;