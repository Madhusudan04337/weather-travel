import { useState } from "react";
import { Button } from "../ui/Button";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => void;
  isLoading?: boolean;
}

export function RejectModal({ isOpen, onClose, onConfirm, isLoading }: RejectModalProps) {
  const [remarks, setRemarks] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(remarks.trim());
  };

  const handleClose = () => {
    setRemarks("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Panel */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-surface rounded-[24px] shadow-xl border border-border p-6 flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center flex-shrink-0">
            <span aria-hidden="true" className="text-xl">⚠️</span>
          </div>
          <div>
            <h2 id="reject-modal-title" className="text-body-l font-semibold text-text-primary">
              Reject Request
            </h2>
            <p className="text-body-sm text-text-secondary mt-0.5">
              Optionally provide a reason for rejection.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="reject-remarks" className="text-body-sm font-medium text-text-secondary">
            Remarks <span className="text-text-muted">(optional)</span>
          </label>
          <textarea
            id="reject-remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Budget exceeds quarterly limit..."
            rows={3}
            className="w-full resize-none rounded-[12px] border border-border bg-white px-3 py-2.5 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-error focus:border-error transition-all duration-200"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Reject Request
          </Button>
        </div>
      </div>
    </div>
  );
}
