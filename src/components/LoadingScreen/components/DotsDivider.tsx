import { CSSProperties } from 'react';

interface DotsDividerProps {
  className?: string;
  style?: CSSProperties;
  dotColor?: string;
  dotSpacing?: number;
}

export function DotsDivider({ 
  className = '', 
  style = {},
  dotColor = '#666',
  dotSpacing = 8
}: DotsDividerProps) {
  const dotStyle: CSSProperties = {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: dotColor,
    display: 'inline-block',
    marginRight: `${dotSpacing}px`,
  };

  const containerStyle: CSSProperties = {
    width: '100%',
    textAlign: 'center',
    lineHeight: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    ...style,
  };

  // Создаем достаточно точек, чтобы заполнить всю ширину
  const dots = Array.from({ length: 50 }, (_, index) => (
    <span
      key={index}
      style={dotStyle}
    />
  ));

  return (
    <div className={className} style={containerStyle}>
      {dots}
    </div>
  );
}

export default DotsDivider;
