import React from 'react';
import { Users, GraduationCap, BookOpen, BookMarked, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useStudents } from '../../hooks/useStudents';
import { useTeachers } from '../../hooks/useTeachers';
import { useClassrooms } from '../../hooks/useClassrooms';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const { data: studentsData } = useStudents({ limit: 1 });
  const { data: teachersData } = useTeachers({ limit: 1 });
  const { data: classroomsData } = useClassrooms({ limit: 100 });

  const totalStudents = studentsData?.total || 0;
  const totalTeachers = teachersData?.total || 0;
  const totalClassrooms = classroomsData?.total || 0;

  // Dados para o gráfico de barras (alunos por turma)
  const barData = classroomsData?.data?.map((c) => ({
    name: c.name,
    alunos: c.studentCount || 0,
  })) || [];

  // Dados para o gráfico de pizza (status dos alunos - simulado)
  const pieData = [
    { name: 'Aprovados', value: Math.round(totalStudents * 0.65) },
    { name: 'Recuperação', value: Math.round(totalStudents * 0.2) },
    { name: 'Reprovados', value: Math.round(totalStudents * 0.15) },
  ];

  const summaryCards = [
    {
      title: 'Total de Alunos',
      value: totalStudents,
      icon: <Users className="h-8 w-8 text-blue-500" />,
      bg: 'bg-blue-50',
    },
    {
      title: 'Total de Professores',
      value: totalTeachers,
      icon: <GraduationCap className="h-8 w-8 text-green-500" />,
      bg: 'bg-green-50',
    },
    {
      title: 'Total de Turmas',
      value: totalClassrooms,
      icon: <BookOpen className="h-8 w-8 text-purple-500" />,
      bg: 'bg-purple-50',
    },
    {
      title: 'Disciplinas',
      value: 12,
      icon: <BookMarked className="h-8 w-8 text-orange-500" />,
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard Administrativo</h2>
        <p className="text-muted-foreground">Visão geral do sistema escolar</p>
      </div>

      {/* Summary cards */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Alunos por Turma
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
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
            <CardTitle>Distribuição de Status</CardTitle>
          </CardHeader>
          <CardContent>
            {totalStudents > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[
              { text: 'Novo aluno matriculado: João Silva', time: '5 min atrás', color: 'bg-blue-500' },
              { text: 'Notas do 2º bimestre lançadas - Turma 9A', time: '1 hora atrás', color: 'bg-green-500' },
              { text: 'Chamada realizada - Matemática 8B', time: '2 horas atrás', color: 'bg-purple-500' },
              { text: 'Professor atualizado: Maria Santos', time: '3 horas atrás', color: 'bg-orange-500' },
            ].map((activity, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${activity.color}`} />
                <span className="flex-1 text-sm text-foreground">{activity.text}</span>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
