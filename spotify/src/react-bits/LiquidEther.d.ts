import type { FC } from 'react';

interface LiquidEtherProps {
  mouseForce?: number;
  cursorSize?: number;
  isViscous?: boolean;
  viscous?: number;
  colors?: string[];
  autoDemo?: boolean;
  autoSpeed?: number;
  autoIntensity?: number;
  isBounce?: boolean;
  resolution?: number;
}

declare const LiquidEther: FC<LiquidEtherProps>;
export default LiquidEther;
