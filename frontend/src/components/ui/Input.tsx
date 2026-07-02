import { forwardRef, type InputHTMLAttributes } from "react";
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
      <div className="w-full flex flex-col">
        <div className="inputGroup">
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-error focus:ring-error focus:border-error",
              className
            )}
            {...props}
          />
          {label && (
            <label
              htmlFor={inputId}
              className={cn(disabled && "opacity-50")}
            >
              {label}
            </label>
          )}
        </div>
        {error && <span className="text-caption text-error mt-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
