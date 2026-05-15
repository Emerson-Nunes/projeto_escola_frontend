import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { useReportCard } from '../../hooks/useGrades';
import { useToast } from '../../components/ui/Toast';
import { studentsService } from '../../services/students.service';
import { reportsService } from '../../services/reports.service';
import { formatGrade } from '../../utils/format';

export default function ReportCardPage() {
  const { error } = useToast();
  const currentYear = new Date().getFullYear();
  const [studentId, setStudentId] = useState('');
  const [schoolYear, setSchoolYear] = useState(currentYear);
  const [downloading, setDownloading] = useState(false);

  const { data: studentsData } = useQuery({
    queryKey: ['students', { limit: 200 }],
    queryFn: () => studentsService.findAll({ limit: 200 }),
  });

  const { data: reportCard, isLoading } = useReportCard(studentId, schoolYear);

  const studentOptions = studentsData?.data?.map((s) => ({
    value: s.id,
    label: `${s.name} — ${s.enrollmentNumber}`,
  })) || [];

  const yearOptions = [currentYear, currentYear - 1, currentYear - 2].map((y) => ({
    value: String(y),
    label: String(y),
  }));

  const handleDownload = async () => {
    if (!studentId) return;
    setDownloading(true);
    try {
      const blob = await reportsService.downloadReportCard(studentId, schoolYear);
      const student = studentsData?.data?.find((s) => s.id === studentId);
      reportsService.downloadBlob(blob, `boletim-${student?.name}-${schoolYear}.pdf`);
    } catch {
      error('Erro ao baixar boletim');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Boletim Escolar</h2>
        <p className="text-muted-foreground">Consulte o boletim completo de um aluno</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Select
                label="Aluno *"
                options={studentOptions}
                value={studentId}
                onValueChange={setStudentId}
                placeholder="Selecione o aluno"
              />
            </div>
            <Select
              label="Ano Letivo"
              options={yearOptions}
              value={String(schoolYear)}
              onValueChange={(v) => setSchoolYear(Number(v))}
            />
            {studentId && (
              <Button variant="outline" onClick={handleDownload} loading={downloading}>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {studentId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Boletim — {studentsData?.data?.find((s) => s.id === studentId)?.name} — {schoolYear}
            </CardTitle>
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
      )}
    </div>
  );
}
