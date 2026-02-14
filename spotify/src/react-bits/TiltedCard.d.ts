import type { CSSProperties, FC, ReactNode } from 'react';

interface TiltedCardProps {
  imageSrc: string;
  altText?: string;
  captionText?: string;
  containerHeight?: CSSProperties['height'];
  containerWidth?: CSSProperties['width'];
  imageHeight?: CSSProperties['height'];
  imageWidth?: CSSProperties['width'];
  scaleOnHover?: number;
  rotateAmplitude?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  overlayContent?: ReactNode;
  displayOverlayContent?: boolean;
}

declare const TiltedCard: FC<TiltedCardProps>;
export default TiltedCard;
