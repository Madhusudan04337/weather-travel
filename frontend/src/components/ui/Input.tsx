import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, disabled, ...props }, ref) => {
    // Generate a unique ID if none provided, useful for linking label to input
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-body-sm font-medium text-text-primary",
              disabled && "opacity-50"
            )}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={cn(
            "flex w-full rounded-input border border-border bg-surface px-3 py-2 text-body text-text-primary placeholder:text-text-muted input-focus",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background",
            error && "border-error focus:ring-error focus:border-error",
            className
          )}
          {...props}
        />
        {error && <span className="text-caption text-error">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
