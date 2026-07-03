import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, disabled, required, ...props }, ref) => {
    // Generate a unique ID if none provided, useful for linking label to input
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-body-sm font-medium text-text-secondary flex items-center gap-0.5",
              disabled && "opacity-50"
            )}
          >
            <span>{label}</span>
            {required && <span className="text-error font-bold ml-0.5">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          required={required}
          className={cn(
            "flex w-full rounded-input border border-border bg-surface px-4 py-2.5 text-body text-text-primary placeholder:text-text-muted shadow-sm transition-all duration-200",
            "hover:border-text-muted",
            "focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background disabled:hover:border-border",
            error && "border-error hover:border-error focus:ring-error/10 focus:border-error",
            className
          )}
          {...props}
        />
        {error && <span className="text-caption text-error mt-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
