import React, { useState } from 'react';
import { User, Mail, Shield, KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../components/ui/Toast';
import api from '../../services/api';

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  PROFESSOR: 'Professor',
  ALUNO: 'Aluno',
  RESPONSAVEL: 'Responsável',
};

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { success, error } = useToast();
  const [changingPassword, setChangingPassword] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onChangePassword = async (data: PasswordFormData) => {
    try {
      await api.patch('/users/me/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      success('Senha alterada com sucesso');
      reset();
      setChangingPassword(false);
    } catch {
      error('Erro ao alterar senha. Verifique a senha atual.');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Meu Perfil</h2>
        <p className="text-muted-foreground">Informações da sua conta</p>
      </div>

      {/* Profile info */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{user?.name}</p>
              <Badge variant="secondary">{roleLabels[user?.role || ''] || user?.role}</Badge>
            </div>
          </div>

          <div className="grid gap-3 pt-2">
            <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-4 py-3">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Nome</p>
                <p className="text-sm font-medium text-foreground">{user?.name || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-4 py-3">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{user?.email || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-4 py-3">
              <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Perfil de acesso</p>
                <p className="text-sm font-medium text-foreground">{roleLabels[user?.role || ''] || user?.role || '—'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Segurança</CardTitle>
            {!changingPassword && (
              <Button variant="outline" size="sm" onClick={() => setChangingPassword(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Alterar senha
              </Button>
            )}
          </div>
        </CardHeader>
        {changingPassword && (
          <CardContent>
            <form onSubmit={handleSubmit(onChangePassword)} className="flex flex-col gap-4">
              <Input
                label="Senha atual"
                type="password"
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
              />
              <Input
                label="Nova senha"
                type="password"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
              <Input
                label="Confirmar nova senha"
                type="password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setChangingPassword(false); reset(); }}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Salvar nova senha
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
