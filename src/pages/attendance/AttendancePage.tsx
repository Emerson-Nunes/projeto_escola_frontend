import React, { useState, useEffect } from 'react';
import { Save, Download } from 'lucide-react';
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
import { useAuthStore } from '../../stores/auth.store';
import { classroomsService } from '../../services/classrooms.service';
import { subjectsService } from '../../services/subjects.service';
import { studentsService } from '../../services/students.service';
import { guardiansService } from '../../services/guardians.service';
import { reportsService } from '../../services/reports.service';
import { Student } from '../../types/student';
import { cn } from '../../utils/cn';
import api from '../../services/api';

interface AttendanceEntry {
  studentId: string;
  present: boolean;
  justified: boolean;
  justification: string;
}

interface StudentAttendanceData {
  records: Array<{
    id: string;
    date: string;
    present: boolean;
    justified: boolean;
    justification?: string;
    subject?: { id: string; name: string };
  }>;
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

// ─────────────────────────────────────────────
// Shared attendance view for ALUNO / RESPONSAVEL
// ─────────────────────────────────────────────
interface StudentAttendanceViewProps {
  studentId: string;
  studentName?: string;
  schoolYear?: number;
  onDownload: () => Promise<void>;
  downloading: boolean;
}

function StudentAttendanceDisplay({ studentId, studentName, onDownload, downloading }: StudentAttendanceViewProps) {
  const { data, isLoading } = useQuery<StudentAttendanceData>({
    queryKey: ['attendance', 'student', studentId],
    queryFn: async () => {
      const { data } = await api.get(`/attendance/student/${studentId}`);
      return data;
    },
    enabled: !!studentId,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>{studentName ? `Frequência — ${studentName}` : 'Frequência'}</CardTitle>
          <Button variant="outline" onClick={onDownload} loading={downloading}>
            <Download className="mr-2 h-4 w-4" />
            Baixar Frequência PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : data ? (
          <>
            {/* Summary */}
            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-md border border-border p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{data.total}</p>
                <p className="text-xs text-muted-foreground">Total de Aulas</p>
              </div>
              <div className="rounded-md border border-border p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{data.present}</p>
                <p className="text-xs text-muted-foreground">Presenças</p>
              </div>
              <div className="rounded-md border border-border p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{data.absent}</p>
                <p className="text-xs text-muted-foreground">Faltas</p>
              </div>
              <div className="rounded-md border border-border p-3 text-center">
                <p className={cn('text-2xl font-bold', data.percentage >= 75 ? 'text-green-600' : 'text-red-600')}>
                  {data.percentage}%
                </p>
                <p className="text-xs text-muted-foreground">Frequência</p>
              </div>
            </div>

            {/* Records table */}
            {data.records.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Disciplina</TableHead>
                    <TableHead className="text-center">Situação</TableHead>
                    <TableHead>Justificativa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.records.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{new Date(r.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{r.subject?.name ?? '—'}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-semibold',
                            r.present
                              ? 'bg-green-100 text-green-700'
                              : r.justified
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          )}
                        >
                          {r.present ? 'Presente' : r.justified ? 'Justificado' : 'Ausente'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {r.justification ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-6 text-center text-muted-foreground">Nenhum registro de frequência</p>
            )}
          </>
        ) : (
          <p className="py-6 text-center text-muted-foreground">Nenhum dado disponível</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// ALUNO view
// ─────────────────────────────────────────────
function StudentAttendanceView() {
  const { error } = useToast();
  const [downloading, setDownloading] = useState(false);

  const { data: student, isLoading } = useQuery({
    queryKey: ['students', 'me'],
    queryFn: () => studentsService.findMe(),
  });

  const handleDownload = async () => {
    if (!student) return;
    setDownloading(true);
    try {
      const blob = await reportsService.downloadStudentAttendance(student.id);
      reportsService.downloadBlob(blob, `frequencia-minha.pdf`);
    } catch {
      error('Erro ao baixar frequência');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Minha Frequência</h2>
        <p className="text-muted-foreground">Acompanhe sua frequência escolar</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : student ? (
        <StudentAttendanceDisplay
          studentId={student.id}
          onDownload={handleDownload}
          downloading={downloading}
        />
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Perfil de aluno não encontrado
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// RESPONSAVEL view
// ─────────────────────────────────────────────
function GuardianAttendanceView() {
  const { error } = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [downloading, setDownloading] = useState(false);

  const { data: guardian, isLoading: guardianLoading } = useQuery({
    queryKey: ['guardians', 'me'],
    queryFn: () => guardiansService.findMe(),
  });

  const students: Student[] = (guardian as any)?.students ?? [];
  const studentOptions = students.map((s) => ({
    value: s.id,
    label: `${s.name} — ${s.enrollmentNumber}`,
  }));

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleDownload = async () => {
    if (!selectedStudentId) return;
    setDownloading(true);
    try {
      const blob = await reportsService.downloadStudentAttendance(selectedStudentId);
      reportsService.downloadBlob(blob, `frequencia-${selectedStudent?.name ?? selectedStudentId}.pdf`);
    } catch {
      error('Erro ao baixar frequência');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Frequência do Aluno</h2>
        <p className="text-muted-foreground">Acompanhe a frequência do aluno</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {guardianLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="max-w-sm">
              <Select
                label="Aluno *"
                options={studentOptions}
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
                placeholder="Selecione o aluno"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStudentId && (
        <StudentAttendanceDisplay
          studentId={selectedStudentId}
          studentName={selectedStudent?.name}
          onDownload={handleDownload}
          downloading={downloading}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN / PROFESSOR view (original)
// ─────────────────────────────────────────────
function ProfessorAttendanceView() {
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
                            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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

// ─────────────────────────────────────────────
// Main component — role-based dispatcher
// ─────────────────────────────────────────────
export default function AttendancePage() {
  const { user } = useAuthStore();
  const role = user?.role;

  if (role === 'ALUNO') return <StudentAttendanceView />;
  if (role === 'RESPONSAVEL') return <GuardianAttendanceView />;
  return <ProfessorAttendanceView />;
}
