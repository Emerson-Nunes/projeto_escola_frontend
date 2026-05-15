import React from 'react';
import { Badge } from './Badge';
import { getStatusLabel } from '../../utils/grade';

interface StatusBadgeProps {
  status: 'APROVADO' | 'RECUPERACAO' | 'REPROVADO';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variantMap = {
    APROVADO: 'success' as const,
    RECUPERACAO: 'warning' as const,
    REPROVADO: 'destructive' as const,
  };

  return (
    <Badge variant={variantMap[status]}>
      {getStatusLabel(status)}
    </Badge>
  );
}
