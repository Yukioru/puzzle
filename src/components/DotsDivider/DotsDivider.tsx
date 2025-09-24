import { CSSProperties } from 'react';
import clsx from 'clsx';
import styles from './DotsDivider.module.css';

interface DotsDividerProps {
  className?: string;
  style?: CSSProperties;
  variant?: 'default' | 'light' | 'dark' | 'primary';
  animated?: boolean;
  dotColor?: string;
  dotSpacing?: number;
}

export function DotsDivider({ 
  className = '', 
  style = {},
  variant = 'default',
  animated = false,
  dotColor,
  dotSpacing
}: DotsDividerProps) {
  const customStyle: CSSProperties = {
    ...style,
    ...(dotColor && { '--dot-color': dotColor } as CSSProperties),
    ...(dotSpacing && { '--dot-spacing': `${dotSpacing}px` } as CSSProperties),
  };

  return (
    <div
      className={clsx(
        styles.dotsDivider,
        variant !== 'default' && styles[variant],
        animated && styles.animated,
        className
      )}
      style={customStyle}
    />
  );
}

export default DotsDivider;