'use client';

import { useState } from 'react';

type Props = {
  name: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  hint?: string;
};

export function PasswordField({
  name,
  label,
  disabled,
  required,
  minLength,
  autoComplete,
  hint,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      <div className="password-input-wrap">
        <input
          id={name}
          className="form-control"
          type={visible ? 'text' : 'password'}
          name={name}
          disabled={disabled}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <i className={`bi ${visible ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden />
        </button>
      </div>
      {hint && <div className="form-text">{hint}</div>}
    </div>
  );
}
