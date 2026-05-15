import React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

// Radix Select.Item rejects empty string values — use this sentinel internally
const EMPTY_SENTINEL = '__EMPTY__';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onValueChange,
  placeholder = 'Selecione...',
  label,
  error,
  disabled,
  className,
}: SelectProps) {
  const toInternal = (v: string | undefined) => (v === '' || v === undefined ? EMPTY_SENTINEL : v);
  const toExternal = (v: string) => (v === EMPTY_SENTINEL ? '' : v);

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <RadixSelect.Root
        value={toInternal(value)}
        onValueChange={(v) => onValueChange?.(toExternal(v))}
        disabled={disabled}
      >
        <RadixSelect.Trigger
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive',
            className
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card shadow-md animate-in fade-in-80">
            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value === '' ? EMPTY_SENTINEL : option.value}
                  value={option.value === '' ? EMPTY_SENTINEL : option.value}
                  className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[highlighted]:bg-secondary data-[highlighted]:text-foreground"
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <RadixSelect.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </RadixSelect.ItemIndicator>
                  </span>
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
