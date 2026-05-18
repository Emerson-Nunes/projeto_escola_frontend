import React, { useState } from 'react';
import { FileText, Download, Users, BarChart2, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { reportsService } from '../../services/reports.service';
import { classroomsService } from '../../services/classrooms.service';
import { subjectsService } from '../../services/subjects.service';
import api from '../../services/api';
import { PaginatedResponse } from '../../types/pagination';
import { ClassRoom } from '../../types/classroom';

export default function ReportsPage() {
  const { error, success } = useToast();
  const currentYear = new Date().getFullYear();

  // Boletim individual — cascading: year → classroom → student
  const [reportCardYear, setReportCardYear] = useState(currentYear);
  const [reportCardClassRoomId, setReportCardClassRoomId] = useState('');
  const [reportCardStudentId, setReportCardStudentId] = useState('');

  // Relatório de turma — cascading: year → classroom
  const [classReportYear, setClassReportYear] = useState(currentYear);
  const [classReportClassRoomId, setClassReportClassRoomId] = useState('');

  // Planilha de notas — cascading: year → classroom
  const [gradesYear, setGradesYear] = useState(currentYear);
  const [gradesClassRoomId, setGradesClassRoomId] = useState('');

  // Planilha de frequência
  const [attendanceClassRoomId, setAttendanceClassRoomId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const { data: validYearsData = [] } = useQuery({
    queryKey: ['grades', 'valid-years'],
    queryFn: async () => {
      const { data } = await api.get<number[]>('/grades/valid-years');
      return data;
    },
  });

  const baseYears = validYearsData.length > 0 ? validYearsData : [currentYear, currentYear - 1, currentYear - 2];
  const yearOptions = baseYears.map((y) => ({ value: String(y), label: String(y) }));

  // Classrooms by year — boletim
  const { data: reportCardClassrooms } = useQuery({
    queryKey: ['classrooms', { year: reportCardYear, limit: 200 }],
    queryFn: async () => {
      const { data } = await api.get('/classrooms', { params: { year: reportCardYear, limit: 200 } });
      return data as PaginatedResponse<ClassRoom>;
    },
    enabled: !!reportCardYear,
  });

  // Students for selected classroom — boletim
  const { data: reportCardStudentsData } = useQuery({
    queryKey: ['classrooms', reportCardClassRoomId, 'students'],
    queryFn: () => classroomsService.findStudents(reportCardClassRoomId),
    enabled: !!reportCardClassRoomId,
  });

  // Classrooms by year — relatório de turma
  const { data: classReportClassrooms } = useQuery({
    queryKey: ['classrooms', { year: classReportYear, limit: 200 }],
    queryFn: async () => {
      const { data } = await api.get('/classrooms', { params: { year: classReportYear, limit: 200 } });
      return data as PaginatedResponse<ClassRoom>;
    },
    enabled: !!classReportYear,
  });

  // Classrooms by year — planilha de notas
  const { data: gradesClassrooms } = useQuery({
    queryKey: ['classrooms', { year: gradesYear, limit: 200 }],
    queryFn: async () => {
      const { data } = await api.get('/classrooms', { params: { year: gradesYear, limit: 200 } });
      return data as PaginatedResponse<ClassRoom>;
    },
    enabled: !!gradesYear,
  });

  // All classrooms (for attendance sheet — no year cascade needed)
  const { data: allClassroomsData } = useQuery({
    queryKey: ['classrooms', { limit: 200 }],
    queryFn: async () => {
      const { data } = await api.get('/classrooms', { params: { limit: 200 } });
      return data as PaginatedResponse<ClassRoom>;
    },
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', { limit: 100 }],
    queryFn: () => subjectsService.findAll({ limit: 100 }),
  });

  // Options
  const reportCardClassroomOptions = reportCardClassrooms?.data?.map((c) => ({ value: c.id, label: c.name })) || [];
  const reportCardStudentOptions = reportCardStudentsData?.data?.map((s) => ({ value: s.id, label: `${s.name} — ${s.enrollmentNumber ?? ''}` })) || [];
  const classReportClassroomOptions = classReportClassrooms?.data?.map((c) => ({ value: c.id, label: c.name })) || [];
  const gradesClassroomOptions = gradesClassrooms?.data?.map((c) => ({ value: c.id, label: c.name })) || [];
  const attendanceClassroomOptions = allClassroomsData?.data?.map((c) => ({ value: c.id, label: c.name })) || [];
  const subjectOptions = subjectsData?.data?.map((s) => ({ value: s.id, label: s.name })) || [];

  const setReportLoading = (key: string, val: boolean) =>
    setLoading((prev) => ({ ...prev, [key]: val }));

  const handleDownloadReportCard = async () => {
    if (!reportCardStudentId) { error('Selecione um aluno'); return; }
    setReportLoading('reportCard', true);
    try {
      const blob = await reportsService.downloadReportCard(reportCardStudentId, reportCardYear);
      const student = reportCardStudentsData?.data?.find((s) => s.id === reportCardStudentId);
      reportsService.downloadBlob(blob, `boletim-${student?.name}-${reportCardYear}.pdf`);
      success('Boletim exportado com sucesso');
    } catch { error('Erro ao exportar boletim'); }
    finally { setReportLoading('reportCard', false); }
  };

  const handleDownloadClassReport = async () => {
    if (!classReportClassRoomId) { error('Selecione uma turma'); return; }
    setReportLoading('classReport', true);
    try {
      const blob = await reportsService.downloadClassReport(classReportClassRoomId, classReportYear);
      const classroom = classReportClassrooms?.data?.find((c) => c.id === classReportClassRoomId);
      reportsService.downloadBlob(blob, `relatorio-${classroom?.name}-${classReportYear}.pdf`);
      success('Relatório exportado com sucesso');
    } catch { error('Erro ao exportar relatório'); }
    finally { setReportLoading('classReport', false); }
  };

  const handleDownloadGradesSheet = async () => {
    if (!gradesClassRoomId) { error('Selecione uma turma'); return; }
    setReportLoading('gradesSheet', true);
    try {
      const blob = await reportsService.downloadGradesSheet(gradesClassRoomId, gradesYear);
      const classroom = gradesClassrooms?.data?.find((c) => c.id === gradesClassRoomId);
      reportsService.downloadBlob(blob, `notas-${classroom?.name}-${gradesYear}.xlsx`);
      success('Planilha exportada com sucesso');
    } catch { error('Erro ao exportar planilha'); }
    finally { setReportLoading('gradesSheet', false); }
  };

  const handleDownloadAttendanceSheet = async () => {
    if (!attendanceClassRoomId || !subjectId || !startDate || !endDate) {
      error('Selecione turma, disciplina e período');
      return;
    }
    setReportLoading('attendanceSheet', true);
    try {
      const blob = await reportsService.downloadAttendanceSheet(attendanceClassRoomId, subjectId, startDate, endDate);
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
            <Select
              label="Ano Letivo"
              options={yearOptions}
              value={String(reportCardYear)}
              onValueChange={(v) => {
                setReportCardYear(Number(v));
                setReportCardClassRoomId('');
                setReportCardStudentId('');
              }}
            />
            <Select
              label="Turma"
              options={reportCardClassroomOptions}
              value={reportCardClassRoomId}
              onValueChange={(v) => {
                setReportCardClassRoomId(v);
                setReportCardStudentId('');
              }}
              placeholder="Selecione a turma"
              disabled={!reportCardYear}
            />
            {reportCardClassrooms?.data?.length === 0 && !!reportCardYear && (
              <p className="text-sm text-muted-foreground">Nenhuma turma encontrada para {reportCardYear}</p>
            )}
            <Select
              label="Aluno"
              options={reportCardStudentOptions}
              value={reportCardStudentId}
              onValueChange={setReportCardStudentId}
              placeholder="Selecione o aluno"
              disabled={!reportCardClassRoomId}
            />
            {reportCardStudentsData?.data?.length === 0 && !!reportCardClassRoomId && (
              <p className="text-sm text-muted-foreground">Nenhum aluno encontrado nesta turma</p>
            )}
            <Button onClick={handleDownloadReportCard} loading={loading.reportCard} disabled={!reportCardStudentId} className="w-full">
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
            <Select
              label="Ano Letivo"
              options={yearOptions}
              value={String(classReportYear)}
              onValueChange={(v) => {
                setClassReportYear(Number(v));
                setClassReportClassRoomId('');
              }}
            />
            <Select
              label="Turma"
              options={classReportClassroomOptions}
              value={classReportClassRoomId}
              onValueChange={setClassReportClassRoomId}
              placeholder="Selecione a turma"
              disabled={!classReportYear}
            />
            {classReportClassrooms?.data?.length === 0 && !!classReportYear && (
              <p className="text-sm text-muted-foreground">Nenhuma turma encontrada para {classReportYear}</p>
            )}
            <Button onClick={handleDownloadClassReport} loading={loading.classReport} disabled={!classReportClassRoomId} className="w-full">
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
            <Select
              label="Ano Letivo"
              options={yearOptions}
              value={String(gradesYear)}
              onValueChange={(v) => {
                setGradesYear(Number(v));
                setGradesClassRoomId('');
              }}
            />
            <Select
              label="Turma"
              options={gradesClassroomOptions}
              value={gradesClassRoomId}
              onValueChange={setGradesClassRoomId}
              placeholder="Selecione a turma"
              disabled={!gradesYear}
            />
            {gradesClassrooms?.data?.length === 0 && !!gradesYear && (
              <p className="text-sm text-muted-foreground">Nenhuma turma encontrada para {gradesYear}</p>
            )}
            <Button variant="outline" onClick={handleDownloadGradesSheet} loading={loading.gradesSheet} disabled={!gradesClassRoomId} className="w-full">
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
            <Select
              label="Turma"
              options={attendanceClassroomOptions}
              value={attendanceClassRoomId}
              onValueChange={setAttendanceClassRoomId}
              placeholder="Selecione a turma"
            />
            <Select
              label="Disciplina"
              options={subjectOptions}
              value={subjectId}
              onValueChange={setSubjectId}
              placeholder="Selecione a disciplina"
            />
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
