import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { useStudents, useDeleteStudent } from '../../hooks/useStudents';
import { useClassrooms } from '../../hooks/useClassrooms';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../stores/auth.store';
import { formatDate, formatCPF } from '../../utils/format';

export default function StudentsListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { success, error } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [classRoomId, setClassRoomId] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useStudents({
    page,
    limit: 10,
    search: search || undefined,
    classRoomId: classRoomId || undefined,
  });

  const { data: classroomsData } = useClassrooms({ limit: 100 });
  const deleteStudent = useDeleteStudent();

  const classroomOptions = [
    { value: '', label: 'Todas as turmas' },
    ...(classroomsData?.data?.map((c) => ({ value: c.id, label: c.name })) || []),
  ];

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteStudent.mutateAsync(deleteId);
      success('Aluno excluído com sucesso');
      setDeleteId(null);
    } catch {
      error('Erro ao excluir aluno');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Alunos</h2>
          <p className="text-muted-foreground">Gerencie os alunos cadastrados</p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate('/students/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Aluno
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          placeholder="Buscar por nome, matrícula..."
          onSearch={handleSearch}
          className="flex-1"
        />
        <Select
          options={classroomOptions}
          value={classRoomId}
          onValueChange={(v) => { setClassRoomId(v); setPage(1); }}
          placeholder="Filtrar por turma"
          className="w-full sm:w-48"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Data Nasc.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum aluno encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.enrollmentNumber}</TableCell>
                      <TableCell>{formatCPF(student.cpf)}</TableCell>
                      <TableCell>{student.classRoom?.name || '-'}</TableCell>
                      <TableCell>{formatDate(student.birthDate)}</TableCell>
                      <TableCell>
                        <Badge variant={student.isActive ? 'success' : 'secondary'}>
                          {student.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/students/${student.id}`)}
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/students/${student.id}/edit`)}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(student.id)}
                                title="Excluir"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border p-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((page - 1) * 10) + 1}–{Math.min(page * 10, data.total)} de {data.total} alunos
                </p>
                <Pagination
                  page={page}
                  totalPages={data.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Confirmar exclusão"
        description="Esta ação não pode ser desfeita. O aluno será removido permanentemente."
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={deleteStudent.isPending}
          >
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}
