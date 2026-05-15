import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useClassrooms } from '../../hooks/useClassrooms';
import { useAttendanceReport } from '../../hooks/useAttendance';
import { useToast } from '../../components/ui/Toast';
import { useQuery } from '@tanstack/react-query';
import { subjectsService } from '../../services/subjects.service';
import { reportsService } from '../../services/reports.service';

export default function AttendanceReportPage() {
  const { error } = useToast();
  const [classRoomId, setClassRoomId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloading, setDownloading] = useState(false);

  const { data: classroomsData } = useClassrooms({ limit: 100 });
  const { data: subjects } = useQuery({
    queryKey: ['subjects', { limit: 100 }],
    queryFn: () => subjectsService.findAll({ limit: 100 }),
  });

  const { data: report, isLoading } = useAttendanceReport({
    classRoomId: classRoomId || undefined,
    subjectId: subjectId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const classroomOptions = classroomsData?.data?.map((c) => ({ value: c.id, label: c.name })) || [];
  const subjectOptions = [
    { value: '', label: 'Todas as disciplinas' },
    ...(subjects?.data?.map((s) => ({ value: s.id, label: s.name })) || []),
  ];

  const handleDownload = async () => {
    if (!classRoomId || !subjectId || !startDate || !endDate) {
      error('Selecione todos os filtros para exportar');
      return;
    }
    setDownloading(true);
    try {
      const blob = await reportsService.downloadAttendanceSheet(classRoomId, subjectId, startDate, endDate);
      reportsService.downloadBlob(blob, `frequencia-${classRoomId}-${startDate}-${endDate}.xlsx`);
    } catch {
      error('Erro ao baixar planilha');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Relatório de Frequência</h2>
        <p className="text-muted-foreground">Consulte e exporte o relatório de frequência por turma</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Turma"
              options={classroomOptions}
              value={classRoomId}
              onValueChange={setClassRoomId}
              placeholder="Selecione a turma"
            />
            <Select
              label="Disciplina"
              options={subjectOptions}
              value={subjectId}
              onValueChange={setSubjectId}
            />
            <Input label="Data inicial" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="Data final" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={handleDownload} loading={downloading}>
              <Download className="mr-2 h-4 w-4" />
              Exportar XLSX
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : report && report.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead className="text-center">Total Aulas</TableHead>
                  <TableHead className="text-center">Presenças</TableHead>
                  <TableHead className="text-center">Faltas</TableHead>
                  <TableHead className="text-center">% Freq.</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{r.student.name}</TableCell>
                    <TableCell>{r.subject.name}</TableCell>
                    <TableCell className="text-center">{r.totalClasses}</TableCell>
                    <TableCell className="text-center text-green-600">{r.presences}</TableCell>
                    <TableCell className="text-center text-red-600">{r.absences}</TableCell>
                    <TableCell className="text-center font-bold">{r.percentage.toFixed(1)}%</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={r.percentage >= 75 ? 'success' : 'destructive'}>
                        {r.percentage >= 75 ? 'Regular' : 'Irregular'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              {classRoomId ? 'Nenhum dado encontrado para os filtros selecionados' : 'Selecione uma turma para visualizar'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
