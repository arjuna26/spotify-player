import { useRef, useState, useEffect } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
} from 'motion/react';

const wrap = (min: number, max: number, value: number): number => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

interface SimpleMarqueeProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
  baseVelocity?: number;
  slowdownOnHover?: boolean;
  slowDownFactor?: number;
  repeat?: number;
}

const SimpleMarquee = ({
  children,
  className = '',
  direction = 'right',
  baseVelocity = 5,
  slowdownOnHover = false,
  slowDownFactor = 0.3,
  repeat = 4,
}: SimpleMarqueeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const baseX = useMotionValue(0);
  const baseY = useMotionValue(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0,
      rootMargin: '50px'
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hoverFactorValue = useMotionValue(1);
  const isHovered = useRef(false);
  const directionFactor = useRef(1);
  const isHorizontal = direction === 'left' || direction === 'right';
  const actualBaseVelocity = direction === 'left' || direction === 'up' ? -baseVelocity : baseVelocity;
  
  const x = useTransform(baseX, v => {
    const wrappedValue = wrap(0, -100, v);
    return `${wrappedValue}%`;
  });
  const y = useTransform(baseY, v => {
    const wrappedValue = wrap(0, -100, v);
    return `${wrappedValue}%`;
  });

  useAnimationFrame((_t, delta) => {
    if (!isVisible) return;

    if (isHovered.current) {
      hoverFactorValue.set(slowdownOnHover ? slowDownFactor : 1);
    } else {
      hoverFactorValue.set(1);
    }

    let moveBy = directionFactor.current * actualBaseVelocity * (delta / 1000) * hoverFactorValue.get();

    if (isHorizontal) {
      baseX.set(baseX.get() + moveBy);
    } else {
      baseY.set(baseY.get() + moveBy);
    }
  });

  const baseClasses = `flex ${isHorizontal ? 'flex-row' : 'flex-col'} ${className}`;

  return (
    <motion.div
      ref={containerRef}
      className={baseClasses}
      onHoverStart={() => (isHovered.current = true)}
      onHoverEnd={() => (isHovered.current = false)}
    >
      {Array.from({ length: repeat }, (_, i) => i).map(i => (
        <motion.div
          key={i}
          className={`shrink-0 ${isHorizontal ? 'flex' : ''}`}
          style={isHorizontal ? { x } : { y }}
          aria-hidden={i > 0}
        >
          {children}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SimpleMarquee;
