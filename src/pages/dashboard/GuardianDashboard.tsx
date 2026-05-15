import React from 'react';
import { User, BookOpen, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../stores/auth.store';

export default function GuardianDashboard() {
  const { user } = useAuthStore();

  // Dados simulados
  const student = {
    name: 'Pedro Alves',
    enrollmentNumber: '2024001',
    class: '8º A',
    shift: 'Manhã',
  };

  const grades = [
    { subject: 'Matemática', media: 8.5, status: 'APROVADO' as const },
    { subject: 'Português', media: 7.2, status: 'APROVADO' as const },
    { subject: 'História', media: 5.8, status: 'RECUPERACAO' as const },
    { subject: 'Ciências', media: 9.1, status: 'APROVADO' as const },
  ];

  const attendance = { total: 120, present: 108, percentage: 90 };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Olá, {user?.name?.split(' ')[0]}!</h2>
        <p className="text-muted-foreground">Acompanhe o desempenho do seu filho(a)</p>
      </div>

      {/* Student info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Dados do Aluno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Nome</p>
              <p className="font-semibold text-foreground">{student.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Matrícula</p>
              <p className="font-semibold text-foreground">{student.enrollmentNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Turma</p>
              <p className="font-semibold text-foreground">{student.class}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Turno</p>
              <Badge variant="secondary">{student.shift}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Grades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Notas e Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {grades.map((g) => (
                <li key={g.subject} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{g.subject}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-foreground">{g.media.toFixed(1)}</span>
                    <StatusBadge status={g.status} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Frequência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-32 w-32">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={attendance.percentage >= 75 ? '#22c55e' : '#ef4444'}
                    strokeWidth="10"
                    strokeDasharray={`${(attendance.percentage / 100) * 251.2} 251.2`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">{attendance.percentage}%</span>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-green-600">{attendance.present}</p>
                  <p className="text-muted-foreground">Presenças</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-red-600">{attendance.total - attendance.present}</p>
                  <p className="text-muted-foreground">Faltas</p>
                </div>
              </div>
              {attendance.percentage < 75 && (
                <div className="w-full rounded-md bg-red-50 p-3 text-sm text-red-600">
                  Atenção: frequência abaixo do mínimo de 75%!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
