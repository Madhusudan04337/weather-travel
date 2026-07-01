import React, { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, disabled, rows = 4, ...props }, ref) => {
    const textareaId = id || (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              "text-body-sm font-medium text-text-primary",
              disabled && "opacity-50"
            )}
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          rows={rows}
          className={cn(
            "flex w-full rounded-input border border-border bg-surface px-3 py-2 text-body text-text-primary placeholder:text-text-muted input-focus resize-y",
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

Textarea.displayName = "Textarea";
