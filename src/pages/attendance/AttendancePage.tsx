import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { Input } from '../../components/ui/Input';
import { useClassrooms } from '../../hooks/useClassrooms';
import { useBulkAttendance } from '../../hooks/useAttendance';
import { useToast } from '../../components/ui/Toast';
import { classroomsService } from '../../services/classrooms.service';
import { subjectsService } from '../../services/subjects.service';
import { Student } from '../../types/student';
import { cn } from '../../utils/cn';

interface AttendanceEntry {
  studentId: string;
  present: boolean;
  justified: boolean;
  justification: string;
}

export default function AttendancePage() {
  const { success, error } = useToast();
  const today = new Date().toISOString().split('T')[0];

  const [classRoomId, setClassRoomId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(today);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);

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

  const bulkAttendance = useBulkAttendance();

  useEffect(() => {
    const list = students?.data ?? [];
    setAttendance(
      list.map((s: Student) => ({
        studentId: s.id,
        present: true,
        justified: false,
        justification: '',
      }))
    );
  }, [students]);

  const classroomOptions = classroomsData?.data?.map((c) => ({ value: c.id, label: c.name })) || [];
  const subjectOptions = subjects?.data?.map((s) => ({ value: s.id, label: s.name })) || [];

  const togglePresent = (studentId: string) => {
    setAttendance((prev) =>
      prev.map((a) =>
        a.studentId === studentId ? { ...a, present: !a.present, justified: false } : a
      )
    );
  };

  const updateJustification = (studentId: string, justification: string) => {
    setAttendance((prev) =>
      prev.map((a) => (a.studentId === studentId ? { ...a, justification } : a))
    );
  };

  const toggleJustified = (studentId: string) => {
    setAttendance((prev) =>
      prev.map((a) => (a.studentId === studentId ? { ...a, justified: !a.justified } : a))
    );
  };

  const handleSave = async () => {
    if (!classRoomId || !subjectId || !date) {
      error('Selecione turma, disciplina e data');
      return;
    }
    try {
      await bulkAttendance.mutateAsync({
        classRoomId,
        subjectId,
        date,
        attendances: attendance,
      });
      success('Chamada salva com sucesso');
    } catch {
      error('Erro ao salvar chamada');
    }
  };

  const studentsMap = (students?.data ?? []).reduce((acc: Record<string, Student>, s: Student) => {
    acc[s.id] = s;
    return acc;
  }, {});

  const presentCount = attendance.filter((a) => a.present).length;
  const absentCount = attendance.filter((a) => !a.present).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Chamada</h2>
        <p className="text-muted-foreground">Registre a frequência dos alunos</p>
      </div>

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
            <Input
              label="Data *"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {classRoomId && subjectId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Chamada — {date}
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex gap-3 text-sm">
                  <span className="text-green-600 font-medium">{presentCount} presentes</span>
                  <span className="text-red-600 font-medium">{absentCount} ausentes</span>
                </div>
                <Button onClick={handleSave} loading={bulkAttendance.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Chamada
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : attendance.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">Nenhum aluno nesta turma</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead className="text-center">Presente</TableHead>
                    <TableHead className="text-center">Justificado</TableHead>
                    <TableHead>Justificativa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((a) => (
                    <TableRow key={a.studentId} className={cn(!a.present && 'bg-red-50/50')}>
                      <TableCell className="font-medium">
                        {studentsMap[a.studentId]?.name || '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => togglePresent(a.studentId)}
                          className={cn(
                            'h-8 w-20 rounded-full text-xs font-semibold transition-colors',
                            a.present
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          )}
                        >
                          {a.present ? 'Presente' : 'Ausente'}
                        </button>
                      </TableCell>
                      <TableCell className="text-center">
                        {!a.present && (
                          <input
                            type="checkbox"
                            checked={a.justified}
                            onChange={() => toggleJustified(a.studentId)}
                            className="h-4 w-4 rounded border-border"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {!a.present && (
                          <input
                            type="text"
                            value={a.justification}
                            onChange={(e) => updateJustification(a.studentId, e.target.value)}
                            placeholder="Motivo da falta..."
                            className="h-8 w-full rounded-md border border-border px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        )}
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
