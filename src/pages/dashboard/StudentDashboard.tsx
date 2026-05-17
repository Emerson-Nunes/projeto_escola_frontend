import React from 'react';
import { BookOpen, Award, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../stores/auth.store';
import { studentsService } from '../../services/students.service';
import { gradesService } from '../../services/grades.service';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const currentYear = new Date().getFullYear();

  const { data: studentProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ['students', 'me'],
    queryFn: () => studentsService.findMe(),
  });

  const { data: reportCard, isLoading: loadingGrades } = useQuery({
    queryKey: ['grades', 'reportcard', studentProfile?.id, currentYear],
    queryFn: () => gradesService.getReportCard(studentProfile!.id, currentYear),
    enabled: !!studentProfile?.id,
  });

  const isLoading = loadingProfile || loadingGrades;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const subjects = (reportCard as any)?.subjects ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Olá, {user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-muted-foreground">
          Turma: {(studentProfile as any)?.classRoom?.name ?? '—'} &nbsp;|&nbsp; Matrícula: {(studentProfile as any)?.enrollmentNumber ?? '—'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Minhas Notas — {currentYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma disciplina cadastrada no sistema.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((s: any) => (
                <div key={s.subject?.id ?? s.subjectId} className="rounded-lg border border-border p-4 bg-card">
                  <p className="font-semibold text-foreground">{s.subject?.name ?? s.subjectName}</p>
                  {s.subject?.code && (
                    <p className="text-xs text-muted-foreground">{s.subject.code}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">
                      {s.mediaFinal != null ? Number(s.mediaFinal).toFixed(1) : '—'}
                    </span>
                    {s.status && <StatusBadge status={s.status} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Resumo do Boletim
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Sem disciplinas cadastradas.</p>
          ) : (
            <ul className="space-y-2">
              {subjects.map((s: any) => (
                <li key={s.subject?.id ?? s.subjectId} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{s.subject?.name ?? s.subjectName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
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
    </div>
  );
}
