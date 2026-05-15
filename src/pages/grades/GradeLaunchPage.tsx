import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { useClassrooms } from '../../hooks/useClassrooms';
import { useClassroomGrades, useBulkCreateGrades } from '../../hooks/useGrades';
import { useToast } from '../../components/ui/Toast';
import { classroomsService } from '../../services/classrooms.service';
import { subjectsService } from '../../services/subjects.service';
import { Student } from '../../types/student';

interface GradeEntry {
  studentId: string;
  value: number | '';
  recoveryValue: number | '';
}

export default function GradeLaunchPage() {
  const { success, error } = useToast();
  const currentYear = new Date().getFullYear();

  const [classRoomId, setClassRoomId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [bimester, setBimester] = useState<1 | 2 | 3 | 4>(1);
  const [grades, setGrades] = useState<GradeEntry[]>([]);

  const { data: classroomsData } = useClassrooms({ limit: 100 });

  const { data: subjects } = useQuery({
    queryKey: ['subjects', { limit: 100 }],
    queryFn: () => subjectsService.findAll({ limit: 100 }),
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['classrooms', classRoomId, 'students'],
    queryFn: () => classroomsService.findStudents(classRoomId),
    enabled: !!classRoomId,
  });

  const { data: existingGrades } = useClassroomGrades(classRoomId, subjectId, bimester, currentYear);
  const bulkCreate = useBulkCreateGrades();

  // Initialize grades when students load
  useEffect(() => {
    if (students) {
      setGrades(
        students.map((s: Student) => {
          const existing = existingGrades?.find((g) => g.studentId === s.id);
          return {
            studentId: s.id,
            value: existing ? existing.value : '',
            recoveryValue: existing?.recoveryValue ?? '',
          };
        })
      );
    }
  }, [students, existingGrades]);

  const classroomOptions = classroomsData?.data?.map((c) => ({ value: c.id, label: c.name })) || [];
  const subjectOptions = subjects?.data?.map((s) => ({ value: s.id, label: s.name })) || [];
  const bimesterOptions = [1, 2, 3, 4].map((b) => ({ value: String(b), label: `${b}º Bimestre` }));

  const updateGrade = (studentId: string, field: 'value' | 'recoveryValue', val: string) => {
    setGrades((prev) =>
      prev.map((g) =>
        g.studentId === studentId
          ? { ...g, [field]: val === '' ? '' : Number(val) }
          : g
      )
    );
  };

  const handleSave = async () => {
    if (!classRoomId || !subjectId) {
      error('Selecione turma e disciplina');
      return;
    }
    try {
      await bulkCreate.mutateAsync({
        classRoomId,
        subjectId,
        schoolYear: currentYear,
        bimester,
        grades: grades
          .filter((g) => g.value !== '')
          .map((g) => ({
            studentId: g.studentId,
            value: Number(g.value),
            recoveryValue: g.recoveryValue !== '' ? Number(g.recoveryValue) : undefined,
          })),
      });
      success('Notas salvas com sucesso');
    } catch {
      error('Erro ao salvar notas');
    }
  };

  const studentsMap = students?.reduce((acc: Record<string, Student>, s: Student) => {
    acc[s.id] = s;
    return acc;
  }, {}) || {};

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Lançamento de Notas</h2>
        <p className="text-muted-foreground">Selecione turma, disciplina e bimestre para lançar as notas</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="Turma *"
              options={classroomOptions}
              value={classRoomId}
              onValueChange={setClassRoomId}
              placeholder="Selecione a turma"
            />
            <Select
              label="Disciplina *"
              options={subjectOptions}
              value={subjectId}
              onValueChange={setSubjectId}
              placeholder="Selecione a disciplina"
            />
            <Select
              label="Bimestre *"
              options={bimesterOptions}
              value={String(bimester)}
              onValueChange={(v) => setBimester(Number(v) as 1 | 2 | 3 | 4)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Grades table */}
      {classRoomId && subjectId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notas — {bimester}º Bimestre {currentYear}</CardTitle>
              <Button onClick={handleSave} loading={bulkCreate.isPending}>
                <Save className="mr-2 h-4 w-4" />
                Salvar Notas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : grades.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">Nenhum aluno nesta turma</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead className="w-36">Nota (0–10)</TableHead>
                    <TableHead className="w-36">Recuperação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((g) => (
                    <TableRow key={g.studentId}>
                      <TableCell className="font-medium">
                        {studentsMap[g.studentId]?.name || '—'}
                      </TableCell>
                      <TableCell>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          step={0.1}
                          value={g.value}
                          onChange={(e) => updateGrade(g.studentId, 'value', e.target.value)}
                          className="h-9 w-28 rounded-md border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          step={0.1}
                          value={g.recoveryValue}
                          onChange={(e) => updateGrade(g.studentId, 'recoveryValue', e.target.value)}
                          className="h-9 w-28 rounded-md border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="—"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
