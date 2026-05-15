import React, { useState } from 'react';
import { Plus, Trash2, Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../stores/auth.store';
import { notificationsService } from '../../services/notifications.service';

const roleLabels: Record<string, string> = {
  ADMIN: 'Administradores',
  PROFESSOR: 'Professores',
  ALUNO: 'Alunos',
  RESPONSAVEL: 'Responsáveis',
};

const ROLE_OPTIONS_BY_ROLE: Record<string, string[]> = {
  ADMIN: ['ADMIN', 'PROFESSOR', 'ALUNO', 'RESPONSAVEL'],
  PROFESSOR: ['PROFESSOR', 'ALUNO', 'RESPONSAVEL'],
};

const schema = z.object({
  title: z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
  message: z.string().min(5, 'Mensagem deve ter ao menos 5 caracteres'),
});
type FormData = z.infer<typeof schema>;

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: () => notificationsService.findAll(),
  });

  const createMutation = useMutation({
    mutationFn: (dto: { title: string; message: string; targetRoles: string[] }) =>
      notificationsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      success('Notificação enviada');
      setShowForm(false);
      reset();
      setSelectedRoles([]);
    },
    onError: () => error('Erro ao enviar notificação'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      success('Notificação removida');
      setDeleteId(null);
    },
    onError: () => error('Erro ao remover notificação'),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    if (selectedRoles.length === 0) {
      error('Selecione ao menos um grupo de destinatários');
      return;
    }
    createMutation.mutate({ ...data, targetRoles: selectedRoles });
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const allowedRoles = ROLE_OPTIONS_BY_ROLE[user?.role ?? ''] ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notificações</h2>
          <p className="text-muted-foreground">Envie avisos para os usuários do sistema</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Notificação
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nova Notificação</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input label="Título *" placeholder="Reunião de pais e mestres" error={errors.title?.message} {...register('title')} />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">Mensagem *</label>
                <textarea
                  rows={3}
                  placeholder="Digite o conteúdo da notificação..."
                  className="flex w-full rounded-md border border-border px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  {...register('message')}
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Destinatários *</label>
                <div className="flex flex-wrap gap-2">
                  {allowedRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                        selectedRoles.includes(role)
                          ? 'bg-primary text-white border-primary'
                          : 'border-border text-muted-foreground hover:border-primary'
                      }`}
                    >
                      {roleLabels[role]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); reset(); setSelectedRoles([]); }}>
                  Cancelar
                </Button>
                <Button type="submit" loading={isSubmitting || createMutation.isPending}>
                  Enviar Notificação
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {isLoading && <p className="text-center text-muted-foreground py-6">Carregando...</p>}
        {!isLoading && notifications.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhuma notificação enviada ainda.
            </CardContent>
          </Card>
        )}
        {notifications.map((n) => (
          <Card key={n.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(n.targetRoles || '').split(',').filter(Boolean).map((r) => (
                        <Badge key={r} variant="secondary" className="text-xs">{roleLabels[r.trim()] ?? r.trim()}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Por {n.senderName} • {new Date(n.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                {(user?.role === 'ADMIN' || n.senderUserId === user?.id) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive flex-shrink-0"
                    onClick={() => setDeleteId(n.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Remover notificação"
        description="Esta notificação será removida permanentemente."
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending}>
            Remover
          </Button>
        </div>
      </Modal>
    </div>
  );
}
