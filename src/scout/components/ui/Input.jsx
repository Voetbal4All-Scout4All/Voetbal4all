import React, { forwardRef, useState } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={`${styles.field} ${error ? styles['field--error'] : ''} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.wrapper}>
        {Icon && <span className={styles.iconLeft}><Icon size={16} /></span>}
        <input
          ref={ref}
          type={inputType}
          className={`${styles.input} ${Icon ? styles['input--with-icon'] : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
