'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ValidationResult } from '@/lib/validation';

interface ValidationModalProps {
  open: boolean;
  title: string;
  messages: string[];
  onOpenChange: (open: boolean) => void;
}

export function ValidationModal({ open, title, messages, onOpenChange }: ValidationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Corrige estos datos antes de continuar.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          {messages.map((message) => (
            <li key={message} className="flex gap-2">
              <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
              <span>{message}</span>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button className="bg-blue-900 hover:bg-blue-800" onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useValidationModal() {
  const [validation, setValidation] = useState({
    open: false,
    title: '',
    messages: [] as string[],
  });

  const showValidation = (result: ValidationResult) => {
    if (result.valid) return false;
    setValidation({
      open: true,
      title: result.title,
      messages: result.messages,
    });
    return true;
  };

  const validationModal = (
    <ValidationModal
      open={validation.open}
      title={validation.title}
      messages={validation.messages}
      onOpenChange={(open) => setValidation((current) => ({ ...current, open }))}
    />
  );

  return { showValidation, validationModal };
}
