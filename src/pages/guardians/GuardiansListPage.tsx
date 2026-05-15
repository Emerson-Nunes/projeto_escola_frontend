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
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../stores/auth.store';
import { formatCPF, formatPhone } from '../../utils/format';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guardiansService } from '../../services/guardians.service';

export default function GuardiansListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { success, error } = useToast();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['guardians', { page, search }],
    queryFn: () => guardiansService.findAll({ page, limit: 10, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => guardiansService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guardians'] }),
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      success('Responsável excluído com sucesso');
      setDeleteId(null);
    } catch {
      error('Erro ao excluir responsável');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Responsáveis</h2>
          <p className="text-muted-foreground">Gerencie os responsáveis cadastrados</p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate('/guardians/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Responsável
          </Button>
        )}
      </div>

      <SearchInput placeholder="Buscar por nome, CPF..." onSearch={handleSearch} className="max-w-sm" />

      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Parentesco</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum responsável encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((guardian) => (
                    <TableRow key={guardian.id}>
                      <TableCell className="font-medium">{guardian.name}</TableCell>
                      <TableCell>{formatCPF(guardian.cpf)}</TableCell>
                      <TableCell>{formatPhone(guardian.phone)}</TableCell>
                      <TableCell>{guardian.relationship}</TableCell>
                      <TableCell>
                        <Badge variant={guardian.isActive ? 'success' : 'secondary'}>
                          {guardian.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/guardians/${guardian.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/guardians/${guardian.id}/edit`)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteId(guardian.id)} className="text-destructive hover:text-destructive">
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
                <p className="text-sm text-muted-foreground">{data.total} responsáveis encontrados</p>
                <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Confirmar exclusão" description="Esta ação não pode ser desfeita.">
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleteMutation.isPending}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
