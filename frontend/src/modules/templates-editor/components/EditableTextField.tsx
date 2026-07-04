"use client";

import { useEffect, useId, useRef, useState } from "react";

type EditableTextFieldProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label: string;
  multiline?: boolean;
  maxLength?: number;
};

export function EditableTextField({
  value,
  onChange,
  className = "",
  label,
  multiline = false,
  maxLength = 4000
}: EditableTextFieldProps) {
  const fieldId = useId();
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!isEditing) {
      setDraft(value);
    }
  }, [isEditing, value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function commit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(value);
      setIsEditing(false);
      return;
    }
    onChange(trimmed.slice(0, maxLength));
    setIsEditing(false);
  }

  function cancel() {
    setDraft(value);
    setIsEditing(false);
  }

  if (isEditing) {
    const sharedProps = {
      id: fieldId,
      ref: inputRef as never,
      value: draft,
      maxLength,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(event.target.value),
      onBlur: commit,
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          cancel();
        }
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          commit();
        }
      },
      className:
        "w-full resize-none border border-[#181715] bg-[#fbf8f2] px-3 py-2 text-inherit outline-none ring-2 ring-[#181715]/10"
    };

    return (
      <div className="relative">
        <label htmlFor={fieldId} className="sr-only">
          {label}
        </label>
        {multiline ? <textarea rows={4} {...sharedProps} /> : <input type="text" {...sharedProps} />}
        <p className="mt-2 text-xs text-[#8e877c]">Press Esc to cancel. Layout and styling stay locked.</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={`group w-full text-left transition ${className}`}
      aria-label={`Edit ${label}`}
    >
      <span className="block rounded-sm border border-transparent px-1 py-0.5 group-hover:border-[#d8d0c4] group-hover:bg-[#fbf8f2]/80 group-focus-visible:border-[#181715] group-focus-visible:outline-none">
        {value}
      </span>
      <span className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-[#8e877c] opacity-0 transition group-hover:opacity-100">
        Click to edit
      </span>
    </button>
  );
}
