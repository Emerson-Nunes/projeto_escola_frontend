import React, { useState, useEffect } from 'react';
import { Save, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useClassrooms } from '../../hooks/useClassrooms';
import { useClassroomGrades, useBulkCreateGrades, useReportCard } from '../../hooks/useGrades';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../stores/auth.store';
import { classroomsService } from '../../services/classrooms.service';
import { subjectsService } from '../../services/subjects.service';
import { studentsService } from '../../services/students.service';
import { guardiansService } from '../../services/guardians.service';
import { reportsService } from '../../services/reports.service';
import { Student } from '../../types/student';
import { formatGrade } from '../../utils/format';

interface GradeEntry {
  studentId: string;
  value: number | '';
  recoveryValue: number | '';
}

// ─────────────────────────────────────────────
// Shared boletim table for ALUNO / RESPONSAVEL
// ─────────────────────────────────────────────
interface ReportCardTableProps {
  studentId: string;
  schoolYear: number;
  studentName?: string;
  onDownload: () => Promise<void>;
  downloading: boolean;
}

function ReportCardTable({ studentId, schoolYear, studentName, onDownload, downloading }: ReportCardTableProps) {
  const { data: reportCard, isLoading } = useReportCard(studentId, schoolYear);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>
            Boletim {studentName ? `— ${studentName} ` : ''}— {schoolYear}
          </CardTitle>
          <Button variant="outline" onClick={onDownload} loading={downloading}>
            <Download className="mr-2 h-4 w-4" />
            Baixar Boletim PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : reportCard ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Disciplina</TableHead>
                <TableHead className="text-center">1º Bim</TableHead>
                <TableHead className="text-center">2º Bim</TableHead>
                <TableHead className="text-center">3º Bim</TableHead>
                <TableHead className="text-center">4º Bim</TableHead>
                <TableHead className="text-center">Méd. 1</TableHead>
                <TableHead className="text-center">Méd. 2</TableHead>
                <TableHead className="text-center">Média Final</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportCard.subjects.map((s) => (
                <TableRow key={s.subject.id}>
                  <TableCell className="font-medium">{s.subject.name}</TableCell>
                  {[1, 2, 3, 4].map((b) => {
                    const bim = s.bimesters.find((x) => x.bimester === b);
                    return (
                      <TableCell key={b} className="text-center text-sm">
                        {bim ? (
                          <div>
                            <div>{formatGrade(bim.value)}</div>
                            {bim.recoveryValue !== undefined && (
                              <div className="text-xs text-muted-foreground">
                                Rec: {formatGrade(bim.recoveryValue)}
                              </div>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">{formatGrade(s.media1)}</TableCell>
                  <TableCell className="text-center">{formatGrade(s.media2)}</TableCell>
                  <TableCell className="text-center font-bold">{formatGrade(s.mediaFinal)}</TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={s.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Nenhuma nota lançada para {schoolYear}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// ALUNO view
// ─────────────────────────────────────────────
function StudentGradesView() {
  const { error } = useToast();
  const currentYear = new Date().getFullYear();
  const [schoolYear, setSchoolYear] = useState(currentYear);
  const [downloading, setDownloading] = useState(false);

  const { data: student, isLoading } = useQuery({
    queryKey: ['students', 'me'],
    queryFn: () => studentsService.findMe(),
  });

  const yearOptions = [currentYear, currentYear - 1, currentYear - 2].map((y) => ({
    value: String(y),
    label: String(y),
  }));

  const handleDownload = async () => {
    if (!student) return;
    setDownloading(true);
    try {
      const blob = await reportsService.downloadReportCard(student.id, schoolYear);
      reportsService.downloadBlob(blob, `boletim-meu-${schoolYear}.pdf`);
    } catch {
      error('Erro ao baixar boletim');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Minhas Notas</h2>
        <p className="text-muted-foreground">Visualize seu boletim e desempenho escolar</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="max-w-xs">
            <Select
              label="Ano Letivo"
              options={yearOptions}
              value={String(schoolYear)}
              onValueChange={(v) => setSchoolYear(Number(v))}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : student ? (
        <ReportCardTable
          studentId={student.id}
          schoolYear={schoolYear}
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
function GuardianGradesView() {
  const { error } = useToast();
  const currentYear = new Date().getFullYear();
  const [schoolYear, setSchoolYear] = useState(currentYear);
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

  const yearOptions = [currentYear, currentYear - 1, currentYear - 2].map((y) => ({
    value: String(y),
    label: String(y),
  }));

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleDownload = async () => {
    if (!selectedStudentId) return;
    setDownloading(true);
    try {
      const blob = await reportsService.downloadReportCard(selectedStudentId, schoolYear);
      reportsService.downloadBlob(blob, `boletim-${selectedStudent?.name ?? selectedStudentId}-${schoolYear}.pdf`);
    } catch {
      error('Erro ao baixar boletim');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Notas do Aluno</h2>
        <p className="text-muted-foreground">Visualize o boletim e desempenho do aluno</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {guardianLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Select
                  label="Aluno *"
                  options={studentOptions}
                  value={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                  placeholder="Selecione o aluno"
                />
              </div>
              <Select
                label="Ano Letivo"
                options={yearOptions}
                value={String(schoolYear)}
                onValueChange={(v) => setSchoolYear(Number(v))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStudentId && (
        <ReportCardTable
          studentId={selectedStudentId}
          schoolYear={schoolYear}
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
function ProfessorGradesView() {
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

  useEffect(() => {
    const list = students?.data ?? [];
    if (list.length > 0 || classRoomId) {
      setGrades(
        list.map((s: Student) => {
          const existing = existingGrades?.find((g) => g.studentId === s.id);
          return {
            studentId: s.id,
            value: existing ? existing.value : '',
            recoveryValue: existing?.recoveryValue ?? '',
          };
        })
      );
    }
  }, [students, existingGrades, classRoomId]);

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

  const studentsMap = (students?.data ?? []).reduce((acc: Record<string, Student>, s: Student) => {
    acc[s.id] = s;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Lançamento de Notas</h2>
        <p className="text-muted-foreground">Selecione turma, disciplina e bimestre para lançar as notas</p>
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
            <Select
              label="Bimestre *"
              options={bimesterOptions}
              value={String(bimester)}
              onValueChange={(v) => setBimester(Number(v) as 1 | 2 | 3 | 4)}
            />
          </div>
        </CardContent>
      </Card>

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
                          className="h-9 w-28 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                          className="h-9 w-28 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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

// ─────────────────────────────────────────────
// Main component — role-based dispatcher
// ─────────────────────────────────────────────
export default function GradeLaunchPage() {
  const { user } = useAuthStore();
  const role = user?.role;

  if (role === 'ALUNO') return <StudentGradesView />;
  if (role === 'RESPONSAVEL') return <GuardianGradesView />;
  return <ProfessorGradesView />;
}
