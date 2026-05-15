import React from 'react';
import { User, BookOpen, Calendar, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../stores/auth.store';
import { guardiansService } from '../../services/guardians.service';
import { gradesService } from '../../services/grades.service';

export default function GuardianDashboard() {
  const { user } = useAuthStore();
  const currentYear = new Date().getFullYear();

  const { data: guardianProfile, isLoading: loadingGuardian } = useQuery({
    queryKey: ['guardians', 'me'],
    queryFn: () => guardiansService.findMe(),
  });

  const student = guardianProfile?.students?.[0];

  const { data: reportCard, isLoading: loadingGrades } = useQuery({
    queryKey: ['grades', 'reportcard', student?.id, currentYear],
    queryFn: () => gradesService.getReportCard(student!.id, currentYear),
    enabled: !!student?.id,
  });

  const isLoading = loadingGuardian || loadingGrades;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Olá, {user?.name?.split(' ')[0]}!</h2>
          <p className="text-muted-foreground">Acompanhe o desempenho do seu filho(a)</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum aluno vinculado ao seu cadastro. Entre em contato com a escola.
          </CardContent>
        </Card>
      </div>
    );
  }

  const subjects = (reportCard as any)?.subjects ?? [];
  const attendanceTotal = 0;
  const attendancePresent = 0;
  const attendancePct = 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Olá, {user?.name?.split(' ')[0]}!</h2>
        <p className="text-muted-foreground">Acompanhe o desempenho do seu filho(a)</p>
      </div>

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
              <p className="font-semibold text-foreground">{student.classRoom?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Turno</p>
              <Badge variant="secondary">{student.classRoom?.shift === 'MANHA' ? 'Manhã' : student.classRoom?.shift === 'TARDE' ? 'Tarde' : student.classRoom?.shift ?? '—'}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Notas e Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">Sem notas lançadas para {currentYear}.</p>
            ) : (
              <ul className="space-y-3">
                {subjects.map((s: any) => (
                  <li key={s.subject?.id ?? s.subjectId} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                    <span className="text-sm text-foreground">{s.subject?.name ?? s.subjectName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-foreground">
                        {s.mediaFinal != null ? Number(s.mediaFinal).toFixed(1) : '—'}
                      </span>
                      {s.status && <StatusBadge status={s.status} />}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Frequência
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceTotal === 0 ? (
              <p className="text-center text-muted-foreground py-6">Nenhuma chamada registrada ainda.</p>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-32 w-32">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10" className="text-secondary" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke={attendancePct >= 75 ? '#22c55e' : '#ef4444'}
                      strokeWidth="10"
                      strokeDasharray={`${(attendancePct / 100) * 251.2} 251.2`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">{attendancePct}%</span>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-green-600">{attendancePresent}</p>
                    <p className="text-muted-foreground">Presenças</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-red-600">{attendanceTotal - attendancePresent}</p>
                    <p className="text-muted-foreground">Faltas</p>
                  </div>
                </div>
                {attendancePct < 75 && (
                  <div className="w-full rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    Atenção: frequência abaixo do mínimo de 75%!
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
