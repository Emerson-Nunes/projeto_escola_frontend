import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, User, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { guardiansService } from '../../services/guardians.service';
import { formatCPF, formatPhone } from '../../utils/format';
import { useAuthStore } from '../../stores/auth.store';

export default function GuardianDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const { data: guardian, isLoading } = useQuery({
    queryKey: ['guardians', id],
    queryFn: () => guardiansService.findById(id!),
    enabled: !!id,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!guardian) return <p className="text-muted-foreground">Responsável não encontrado</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/guardians')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{guardian.name}</h2>
            <p className="text-muted-foreground">{guardian.relationship}</p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate(`/guardians/${id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{guardian.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CPF</p>
              <p className="text-sm font-medium">{formatCPF(guardian.cpf)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Telefone</p>
              <p className="text-sm font-medium">{formatPhone(guardian.phone)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Endereço</p>
              <p className="text-sm font-medium">{guardian.address}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={guardian.isActive ? 'success' : 'secondary'}>
                {guardian.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Alunos Associados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {guardian.students && guardian.students.length > 0 ? (
              <ul className="space-y-2">
                {guardian.students.map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded-md border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">Matrícula: {s.enrollmentNumber}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/students/${s.id}`)}>
                      Ver
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum aluno associado</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
