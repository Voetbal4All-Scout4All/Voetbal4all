import React from 'react';

const badgeStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--s4a-space-1)',
    padding: '0.15rem 0.5rem',
    borderRadius: 'var(--s4a-radius-sm)',
    fontFamily: 'var(--s4a-font-mono)',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
    transition: 'all 250ms ease',
  },
  variants: {
    position: { background: 'rgba(45,142,255,0.15)', color: 'var(--s4a-blue-bright)', border: '1px solid rgba(45,142,255,0.25)' },
    status: { background: 'rgba(0,230,118,0.12)', color: 'var(--s4a-success)', border: '1px solid rgba(0,230,118,0.2)' },
    plan: { background: 'rgba(200,75,255,0.12)', color: 'var(--s4a-purple)', border: '1px solid rgba(200,75,255,0.2)' },
    warning: { background: 'rgba(255,179,0,0.12)', color: 'var(--s4a-warning)', border: '1px solid rgba(255,179,0,0.2)' },
    error: { background: 'rgba(255,61,87,0.12)', color: 'var(--s4a-error)', border: '1px solid rgba(255,61,87,0.2)' },
    orange: { background: 'rgba(255,107,26,0.12)', color: 'var(--s4a-orange-bright)', border: '1px solid rgba(255,107,26,0.2)' },
  },
};

const Badge = ({ variant = 'position', children, dot = false, className = '' }) => {
  const style = { ...badgeStyles.base, ...badgeStyles.variants[variant] };
  return (
    <span style={style} className={className}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />}
      {children}
    </span>
  );
};

export default Badge;
