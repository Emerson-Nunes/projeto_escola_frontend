import React from 'react';
import { BookOpen, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../stores/auth.store';

export default function TeacherDashboard() {
  const { user } = useAuthStore();

  const myClasses = [
    { name: '9º A', subject: 'Matemática', students: 32, shift: 'Manhã' },
    { name: '8º B', subject: 'Matemática', students: 28, shift: 'Tarde' },
    { name: '7º A', subject: 'Álgebra', students: 30, shift: 'Manhã' },
  ];

  const nextAttendances = [
    { date: 'Hoje', time: '07:30', class: '9º A', subject: 'Matemática' },
    { date: 'Hoje', time: '13:30', class: '8º B', subject: 'Matemática' },
    { date: 'Amanhã', time: '07:30', class: '7º A', subject: 'Álgebra' },
  ];

  const studentsInRecovery = [
    { name: 'Ana Paula Lima', class: '9º A', subject: 'Matemática', grade: 5.5 },
    { name: 'Carlos Souza', class: '8º B', subject: 'Matemática', grade: 4.8 },
    { name: 'Beatriz Costa', class: '9º A', subject: 'Matemática', grade: 6.2 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Olá, {user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-muted-foreground">Aqui está um resumo das suas atividades</p>
      </div>

      {/* My Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Minhas Turmas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myClasses.map((c) => (
              <div
                key={`${c.name}-${c.subject}`}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.subject}</p>
                  </div>
                  <Badge variant="secondary">{c.shift}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{c.students} alunos</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Next attendances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximas Chamadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {nextAttendances.map((a, idx) => (
                <li key={idx} className="flex items-center justify-between rounded-md bg-secondary p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {a.class} — {a.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                  <Badge variant={a.date === 'Hoje' ? 'default' : 'secondary'}>
                    {a.date}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Students in recovery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Alunos em Recuperação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {studentsInRecovery.map((s, idx) => (
                <li key={idx} className="flex items-center justify-between rounded-md border border-yellow-100 bg-yellow-50 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.class} — {s.subject}</p>
                  </div>
                  <Badge variant="warning">Média: {s.grade}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
