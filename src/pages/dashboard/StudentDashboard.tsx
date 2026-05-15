import React from 'react';
import { BookOpen, Calendar, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../stores/auth.store';

export default function StudentDashboard() {
  const { user } = useAuthStore();

  // Dados simulados - em produção viria da API
  const subjects = [
    { name: 'Matemática', media: 8.5, status: 'APROVADO' as const, color: 'bg-blue-50 border-blue-200' },
    { name: 'Português', media: 7.2, status: 'APROVADO' as const, color: 'bg-green-50 border-green-200' },
    { name: 'História', media: 5.8, status: 'RECUPERACAO' as const, color: 'bg-yellow-50 border-yellow-200' },
    { name: 'Geografia', media: 9.1, status: 'APROVADO' as const, color: 'bg-purple-50 border-purple-200' },
    { name: 'Ciências', media: 6.5, status: 'RECUPERACAO' as const, color: 'bg-orange-50 border-orange-200' },
    { name: 'Inglês', media: 8.0, status: 'APROVADO' as const, color: 'bg-indigo-50 border-indigo-200' },
  ];

  const attendance = { total: 120, present: 108, percentage: 90 };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Olá, {user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-muted-foreground">Acompanhe seu desempenho escolar</p>
      </div>

      {/* Grades overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Minhas Notas por Disciplina
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s) => (
              <div
                key={s.name}
                className={`rounded-lg border p-4 ${s.color}`}
              >
                <p className="font-semibold text-foreground">{s.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">{s.media.toFixed(1)}</span>
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Minha Frequência
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
                <div className="text-center">
                  <p className="font-semibold text-foreground">{attendance.total}</p>
                  <p className="text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Resumo do Boletim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {subjects.map((s) => (
                <li key={s.name} className="flex items-center justify-between py-1">
                  <span className="text-sm text-foreground">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{s.media.toFixed(1)}</span>
                    <StatusBadge status={s.status} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
