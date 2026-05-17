import React from 'react';
import { Users, GraduationCap, BookOpen, BookMarked, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useStudents } from '../../hooks/useStudents';
import { useTeachers } from '../../hooks/useTeachers';
import { useClassrooms } from '../../hooks/useClassrooms';
import { subjectsService } from '../../services/subjects.service';

export default function AdminDashboard() {
  const { data: studentsData } = useStudents({ limit: 1 });
  const { data: teachersData } = useTeachers({ limit: 1 });
  const { data: classroomsData } = useClassrooms({ limit: 100 });
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', { limit: 1 }],
    queryFn: () => subjectsService.findAll({ limit: 1 }),
  });

  const totalStudents = studentsData?.total ?? 0;
  const totalTeachers = teachersData?.total ?? 0;
  const totalClassrooms = classroomsData?.total ?? 0;
  const totalSubjects = subjectsData?.total ?? 0;

  const barData = classroomsData?.data?.map((c) => ({
    name: c.name,
    alunos: (c as any).studentCount || 0,
  })) ?? [];

  const summaryCards = [
    {
      title: 'Total de Alunos',
      value: totalStudents,
      icon: <Users className="h-8 w-8 text-blue-500" />,
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Total de Professores',
      value: totalTeachers,
      icon: <GraduationCap className="h-8 w-8 text-green-500" />,
      bg: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Total de Turmas',
      value: totalClassrooms,
      icon: <BookOpen className="h-8 w-8 text-purple-500" />,
      bg: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Disciplinas',
      value: totalSubjects,
      icon: <BookMarked className="h-8 w-8 text-orange-500" />,
      bg: 'bg-orange-50 dark:bg-orange-950',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard Administrativo</h2>
        <p className="text-muted-foreground">Visão geral do sistema escolar</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-full p-3 ${card.bg}`}>{card.icon}</div>
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-3xl font-bold text-foreground">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Alunos por Turma
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 && barData.some((d) => d.alunos > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="alunos" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
              Nenhuma atividade registrada.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
