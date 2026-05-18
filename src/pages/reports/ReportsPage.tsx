import React, { useState } from 'react';
import { FileText, Download, Users, BarChart2, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { reportsService } from '../../services/reports.service';
import { studentsService } from '../../services/students.service';
import { classroomsService } from '../../services/classrooms.service';
import { subjectsService } from '../../services/subjects.service';
import api from '../../services/api';

export default function ReportsPage() {
  const { error, success } = useToast();
  const currentYear = new Date().getFullYear();

  const [studentId, setStudentId] = useState('');
  const [classRoomId, setClassRoomId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [schoolYear, setSchoolYear] = useState(currentYear);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const { data: studentsData } = useQuery({
    queryKey: ['students', { limit: 200 }],
    queryFn: () => studentsService.findAll({ limit: 200 }),
  });

  const { data: classroomsData } = useQuery({
    queryKey: ['classrooms', { limit: 100 }],
    queryFn: () => classroomsService.findAll({ limit: 100 }),
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', { limit: 100 }],
    queryFn: () => subjectsService.findAll({ limit: 100 }),
  });

  const { data: validYearsData = [] } = useQuery({
    queryKey: ['grades', 'valid-years'],
    queryFn: async () => {
      const { data } = await api.get<number[]>('/grades/valid-years');
      return data;
    },
  });

  const studentOptions = studentsData?.data?.map((s) => ({ value: s.id, label: `${s.name} — ${s.enrollmentNumber}` })) || [];
  const classroomOptions = classroomsData?.data?.map((c) => ({ value: c.id, label: c.name })) || [];
  const subjectOptions = subjectsData?.data?.map((s) => ({ value: s.id, label: s.name })) || [];
  const baseYears = validYearsData.length > 0 ? validYearsData : [currentYear, currentYear - 1, currentYear - 2];
  const yearOptions = baseYears.map((y) => ({ value: String(y), label: String(y) }));

  const setReportLoading = (key: string, val: boolean) =>
    setLoading((prev) => ({ ...prev, [key]: val }));

  const handleDownloadReportCard = async () => {
    if (!studentId) { error('Selecione um aluno'); return; }
    setReportLoading('reportCard', true);
    try {
      const blob = await reportsService.downloadReportCard(studentId, schoolYear);
      const student = studentsData?.data?.find((s) => s.id === studentId);
      reportsService.downloadBlob(blob, `boletim-${student?.name}-${schoolYear}.pdf`);
      success('Boletim exportado com sucesso');
    } catch { error('Erro ao exportar boletim'); }
    finally { setReportLoading('reportCard', false); }
  };

  const handleDownloadClassReport = async () => {
    if (!classRoomId) { error('Selecione uma turma'); return; }
    setReportLoading('classReport', true);
    try {
      const blob = await reportsService.downloadClassReport(classRoomId, schoolYear);
      const classroom = classroomsData?.data?.find((c) => c.id === classRoomId);
      reportsService.downloadBlob(blob, `relatorio-${classroom?.name}-${schoolYear}.pdf`);
      success('Relatório exportado com sucesso');
    } catch { error('Erro ao exportar relatório'); }
    finally { setReportLoading('classReport', false); }
  };

  const handleDownloadGradesSheet = async () => {
    if (!classRoomId) { error('Selecione uma turma'); return; }
    setReportLoading('gradesSheet', true);
    try {
      const blob = await reportsService.downloadGradesSheet(classRoomId, schoolYear);
      const classroom = classroomsData?.data?.find((c) => c.id === classRoomId);
      reportsService.downloadBlob(blob, `notas-${classroom?.name}-${schoolYear}.xlsx`);
      success('Planilha exportada com sucesso');
    } catch { error('Erro ao exportar planilha'); }
    finally { setReportLoading('gradesSheet', false); }
  };

  const handleDownloadAttendanceSheet = async () => {
    if (!classRoomId || !subjectId || !startDate || !endDate) {
      error('Selecione turma, disciplina e período');
      return;
    }
    setReportLoading('attendanceSheet', true);
    try {
      const blob = await reportsService.downloadAttendanceSheet(classRoomId, subjectId, startDate, endDate);
      reportsService.downloadBlob(blob, `frequencia-${startDate}-${endDate}.xlsx`);
      success('Planilha exportada com sucesso');
    } catch { error('Erro ao exportar planilha'); }
    finally { setReportLoading('attendanceSheet', false); }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Relatórios</h2>
        <p className="text-muted-foreground">Exporte relatórios em PDF e Excel</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Boletim individual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Boletim Individual
            </CardTitle>
            <CardDescription>Exporte o boletim de um aluno em PDF</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Select label="Aluno" options={studentOptions} value={studentId} onValueChange={setStudentId} placeholder="Selecione o aluno" />
            <Select label="Ano Letivo" options={yearOptions} value={String(schoolYear)} onValueChange={(v) => setSchoolYear(Number(v))} />
            <Button onClick={handleDownloadReportCard} loading={loading.reportCard} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Exportar Boletim PDF
            </Button>
          </CardContent>
        </Card>

        {/* Relatório de turma */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Relatório de Turma
            </CardTitle>
            <CardDescription>Exporte o relatório geral da turma em PDF</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Select label="Turma" options={classroomOptions} value={classRoomId} onValueChange={setClassRoomId} placeholder="Selecione a turma" />
            <Select label="Ano Letivo" options={yearOptions} value={String(schoolYear)} onValueChange={(v) => setSchoolYear(Number(v))} />
            <Button onClick={handleDownloadClassReport} loading={loading.classReport} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Exportar Relatório PDF
            </Button>
          </CardContent>
        </Card>

        {/* Planilha de notas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-purple-500" />
              Planilha de Notas
            </CardTitle>
            <CardDescription>Exporte a planilha de notas da turma em Excel</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Select label="Turma" options={classroomOptions} value={classRoomId} onValueChange={setClassRoomId} placeholder="Selecione a turma" />
            <Select label="Ano Letivo" options={yearOptions} value={String(schoolYear)} onValueChange={(v) => setSchoolYear(Number(v))} />
            <Button variant="outline" onClick={handleDownloadGradesSheet} loading={loading.gradesSheet} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Exportar Notas XLSX
            </Button>
          </CardContent>
        </Card>

        {/* Planilha de frequência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              Planilha de Frequência
            </CardTitle>
            <CardDescription>Exporte a planilha de frequência em Excel</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Select label="Turma" options={classroomOptions} value={classRoomId} onValueChange={setClassRoomId} placeholder="Selecione a turma" />
            <Select label="Disciplina" options={subjectOptions} value={subjectId} onValueChange={setSubjectId} placeholder="Selecione a disciplina" />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Data inicial" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input label="Data final" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button variant="outline" onClick={handleDownloadAttendanceSheet} loading={loading.attendanceSheet} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Exportar Frequência XLSX
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
