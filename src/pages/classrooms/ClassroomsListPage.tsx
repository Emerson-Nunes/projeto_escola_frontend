import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { useClassrooms, useDeleteClassroom } from '../../hooks/useClassrooms';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../stores/auth.store';
import { formatShift } from '../../utils/format';

export default function ClassroomsListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { success, error } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useClassrooms({ page, limit: 10, search: search || undefined });
  const deleteClassroom = useDeleteClassroom();

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteClassroom.mutateAsync(deleteId);
      success('Turma excluída com sucesso');
      setDeleteId(null);
    } catch {
      error('Erro ao excluir turma');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Turmas</h2>
          <p className="text-muted-foreground">Gerencie as turmas da escola</p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate('/classrooms/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Turma
          </Button>
        )}
      </div>

      <SearchInput placeholder="Buscar por nome..." onSearch={handleSearch} className="max-w-sm" />

      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Série</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Alunos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhuma turma encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((classroom) => (
                    <TableRow key={classroom.id}>
                      <TableCell className="font-medium">{classroom.name}</TableCell>
                      <TableCell>{classroom.year}</TableCell>
                      <TableCell>{classroom.grade}º Ano</TableCell>
                      <TableCell>{formatShift(classroom.shift)}</TableCell>
                      <TableCell>{classroom.studentCount || 0}</TableCell>
                      <TableCell>
                        <Badge variant={classroom.isActive ? 'success' : 'secondary'}>
                          {classroom.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/classrooms/${classroom.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/classrooms/${classroom.id}/edit`)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteId(classroom.id)} className="text-destructive hover:text-destructive">
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
                <p className="text-sm text-muted-foreground">{data.total} turmas</p>
                <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Confirmar exclusão" description="Esta ação não pode ser desfeita.">
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleteClassroom.isPending}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
