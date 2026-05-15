export type GradeStatus = 'APROVADO' | 'RECUPERACAO' | 'REPROVADO';

export function calculateStatus(
  mediaFinal: number,
  approvalAverage = 7,
  recoveryAverage = 4
): GradeStatus {
  if (mediaFinal >= approvalAverage) return 'APROVADO';
  if (mediaFinal >= recoveryAverage) return 'RECUPERACAO';
  return 'REPROVADO';
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    APROVADO: 'text-green-600 bg-green-50',
    RECUPERACAO: 'text-yellow-600 bg-yellow-50',
    REPROVADO: 'text-red-600 bg-red-50',
  };
  return map[status] || 'text-gray-600 bg-gray-50';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    APROVADO: 'Aprovado',
    RECUPERACAO: 'Recuperação',
    REPROVADO: 'Reprovado',
  };
  return map[status] || status;
}
