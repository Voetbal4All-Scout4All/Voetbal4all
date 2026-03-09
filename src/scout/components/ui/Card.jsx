import React from 'react';
import styles from './Card.module.css';

const Card = ({
    hoverable = false,
    glowColor = 'blue',
    noPadding = false,
    children,
    className = '',
    ...props
}) => {
    const classNames = [
          styles.card,
          hoverable ? styles['card--hoverable'] : '',
          styles[`card--glow-${glowColor}`],
          noPadding ? styles['card--no-padding'] : '',
          className,
        ].filter(Boolean).join(' ');

    return (
          <div className={classNames} {...props}>
            {hoverable && <div className={styles.glowLine} />}
            {children}
          </div>div>
        );
};

export default Card;</div>
