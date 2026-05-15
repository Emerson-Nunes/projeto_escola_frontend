import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Download, User, BookOpen, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { useStudent } from '../../hooks/useStudents';
import { useReportCard } from '../../hooks/useGrades';
import { useToast } from '../../components/ui/Toast';
import { reportsService } from '../../services/reports.service';
import { formatDate, formatCPF, formatPhone, formatGrade } from '../../utils/format';
import { useAuthStore } from '../../stores/auth.store';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const { error } = useToast();
  const currentYear = new Date().getFullYear();
  const [downloading, setDownloading] = useState(false);

  const { data: student, isLoading: studentLoading } = useStudent(id || '');
  const { data: reportCard, isLoading: reportLoading } = useReportCard(id || '', currentYear);

  const handleDownloadReportCard = async () => {
    if (!id) return;
    setDownloading(true);
    try {
      const blob = await reportsService.downloadReportCard(id, currentYear);
      reportsService.downloadBlob(blob, `boletim-${student?.name}-${currentYear}.pdf`);
    } catch {
      error('Erro ao baixar boletim');
    } finally {
      setDownloading(false);
    }
  };

  if (studentLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-muted-foreground">Aluno não encontrado</p>
        <Button onClick={() => navigate('/students')}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/students')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
            <p className="text-muted-foreground">Matrícula: {student.enrollmentNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadReportCard} loading={downloading}>
            <Download className="mr-2 h-4 w-4" />
            Boletim PDF
          </Button>
          {isAdmin && (
            <Button onClick={() => navigate(`/students/${id}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Personal data */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-muted-foreground">CPF</p>
              <p className="text-sm font-medium">{formatCPF(student.cpf)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data de Nascimento</p>
              <p className="text-sm font-medium">{formatDate(student.birthDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Telefone</p>
              <p className="text-sm font-medium">{formatPhone(student.phone)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Endereço</p>
              <p className="text-sm font-medium">{student.address}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Turma</p>
              <p className="text-sm font-medium">{student.classRoom?.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={student.isActive ? 'success' : 'secondary'}>
                {student.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Report card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Boletim {currentYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportLoading ? (
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
                    <TableHead className="text-center">Média</TableHead>
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
                          <TableCell key={b} className="text-center">
                            {bim ? formatGrade(bim.finalValue) : '-'}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-bold">
                        {formatGrade(s.mediaFinal)}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={s.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Nenhuma nota lançada para {currentYear}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
