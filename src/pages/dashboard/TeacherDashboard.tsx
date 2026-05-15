import React from 'react';
import { BookOpen, BookMarked, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../stores/auth.store';
import { teachersService } from '../../services/teachers.service';

export default function TeacherDashboard() {
  const { user } = useAuthStore();

  const { data: teacher, isLoading } = useQuery({
    queryKey: ['teachers', 'me'],
    queryFn: () => teachersService.findMe(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const subjects = (teacher as any)?.subjects ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Olá, {user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-muted-foreground">Aqui está um resumo das suas atividades</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" />
            Minhas Disciplinas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              Nenhuma disciplina atribuída. Peça ao administrador para vincular disciplinas ao seu cadastro.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subjects.map((s: any) => (
                <Badge key={s.id} variant="secondary" className="px-3 py-1 text-sm">
                  {s.name} {s.code ? <span className="ml-1 text-muted-foreground">({s.code})</span> : ''}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Acesso Rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a href="/grades" className="block rounded-lg border border-border p-4 hover:bg-secondary transition-colors">
              <p className="font-semibold text-foreground">Lançamento de Notas</p>
              <p className="text-sm text-muted-foreground mt-1">Selecione turma e disciplina para lançar notas</p>
            </a>
            <a href="/attendance" className="block rounded-lg border border-border p-4 hover:bg-secondary transition-colors">
              <p className="font-semibold text-foreground">Registro de Frequência</p>
              <p className="text-sm text-muted-foreground mt-1">Faça a chamada para uma turma</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
