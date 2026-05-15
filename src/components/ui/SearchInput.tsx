import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from './Input';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  placeholder = 'Buscar...',
  onSearch,
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [value, setValue] = useState('');
  const debounced = useDebounce(value, debounceMs);

  useEffect(() => {
    onSearch(debounced);
  }, [debounced, onSearch]);

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      icon={<Search className="h-4 w-4" />}
      className={className}
    />
  );
}
