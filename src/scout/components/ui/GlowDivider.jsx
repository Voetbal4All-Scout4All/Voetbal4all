import React from 'react';

const colors = {
  blue: 'var(--s4a-blue)',
  orange: 'var(--s4a-orange)',
  purple: 'var(--s4a-purple)',
  primary: 'var(--s4a-blue)',
};

const GlowDivider = ({ color = 'blue', className = '' }) => {
  const c = colors[color] || colors.blue;
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '1px',
        background: `linear-gradient(90deg, transparent, ${c}, transparent)`,
        margin: 'var(--s4a-space-4) 0',
        opacity: 0.6,
      }}
    />
  );
};

export default GlowDivider;
