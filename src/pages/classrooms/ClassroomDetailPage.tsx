import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Users, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { useClassroom, useClassroomStudents } from '../../hooks/useClassrooms';
import { useDebounce } from '../../hooks/useDebounce';
import { formatShift } from '../../utils/format';
import { useAuthStore } from '../../stores/auth.store';

export default function ClassroomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [studentSearch, setStudentSearch] = useState('');
  const debouncedSearch = useDebounce(studentSearch, 300);

  const { data: classroom, isLoading } = useClassroom(id || '');
  const { data: students, isLoading: studentsLoading } = useClassroomStudents(id || '', debouncedSearch || undefined);

  const handleSearch = useCallback((value: string) => {
    setStudentSearch(value);
  }, []);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!classroom) return <p className="text-muted-foreground">Turma não encontrada</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/classrooms')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{classroom.name}</h2>
            <p className="text-muted-foreground">{classroom.grade}º Ano — {formatShift(classroom.shift)} — {classroom.year}</p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate(`/classrooms/${id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Info card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Série</p>
              <p className="text-sm font-medium">{classroom.grade}º Ano</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Turno</p>
              <p className="text-sm font-medium">{formatShift(classroom.shift)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ano Letivo</p>
              <p className="text-sm font-medium">{classroom.year}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total de Alunos</p>
              <p className="text-sm font-medium">{students?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={classroom.isActive ? 'success' : 'secondary'}>
                {classroom.isActive ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Students list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Alunos da Turma
              </CardTitle>
            </div>
            <SearchInput placeholder="Buscar aluno por nome..." onSearch={handleSearch} />
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : students && students.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.enrollmentNumber}</TableCell>
                      <TableCell>
                        <Badge variant={s.isActive ? 'success' : 'secondary'}>
                          {s.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/students/${s.id}`)}>
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-6">
                {debouncedSearch ? 'Nenhum aluno encontrado com esse nome' : 'Nenhum aluno nesta turma'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
