import React from 'react';

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: number | string;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  fill?: boolean;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size, 
  weight = 400, 
  fill = false,
  className = '',
  style,
  ...props 
}) => {
  const customStyle: React.CSSProperties = {
    ...style,
    fontSize: size ? (typeof size === 'number' ? `${size}px` : size) : undefined,
    fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
  };

  return (
    <span 
      className={`material-symbols-outlined ${className}`}
      style={customStyle}
      {...props}
    >
      {name}
    </span>
  );
};
