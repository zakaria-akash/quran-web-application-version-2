"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import SettingsContent from "./settings-content";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// This modal hosts reader settings so users can update preferences without route changes.
export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    // Escape closes the dialog and overflow lock avoids background scrolling.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="settings-modal-backdrop" onMouseDown={onClose}>
      <section
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Reader settings"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="settings-modal-header">
          <div>
            <h2 className="settings-title">Reader Settings</h2>
            <p className="settings-subtitle">
              Customize Arabic and translation typography. Preferences are saved in your browser.
            </p>
          </div>
        </header>

        <div className="settings-modal-content">
          <SettingsContent />
        </div>

        <footer className="settings-modal-footer">
          <button
            type="button"
            className="settings-modal-close"
            onClick={onClose}
            aria-label="Close reader settings"
          >
            Close
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
}
