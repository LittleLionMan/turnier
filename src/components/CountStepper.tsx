"use client";

import styles from "./CountStepper.module.css";

type CountStepperProps = {
  name: string;
  label: string;
  hint?: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
};

export function CountStepper({ name, label, hint, value, max, onChange }: CountStepperProps) {
  const clamp = (next: number) => Math.min(max, Math.max(0, next));

  return (
    <div className={styles.stepper}>
      <div className={styles.text}>
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
        {hint && <span className="feld-hilfe">{hint}</span>}
      </div>
      <div className={styles.steuerung}>
        <button type="button" onClick={() => onChange(clamp(value - 1))} disabled={value === 0} aria-label={`${label}: eins weniger`}>
          −
        </button>
        <input
          id={name}
          name={name}
          type="number"
          inputMode="numeric"
          min={0}
          max={max}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value);
            onChange(Number.isInteger(next) ? clamp(next) : 0);
          }}
        />
        <button type="button" onClick={() => onChange(clamp(value + 1))} disabled={value === max} aria-label={`${label}: eins mehr`}>
          +
        </button>
      </div>
    </div>
  );
}
