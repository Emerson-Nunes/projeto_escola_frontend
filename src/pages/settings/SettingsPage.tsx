import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';
import api from '../../services/api';

const configSchema = z.object({
  schoolName: z.string().min(2, 'Nome é obrigatório'),
  averagePassGrade: z.coerce.number().min(0).max(10),
  averageRecoveryGrade: z.coerce.number().min(0).max(10),
  maxAbsencePercentage: z.coerce.number().min(0).max(100),
});

type ConfigFormData = z.infer<typeof configSchema>;

export default function SettingsPage() {
  const { success, error } = useToast();

  const { data: config, isLoading } = useQuery({
    queryKey: ['school-config'],
    queryFn: async () => {
      const { data } = await api.get('/school-config');
      return data;
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    values: config
      ? {
          schoolName: config.schoolName || '',
          averagePassGrade: config.averagePassGrade ?? 7,
          averageRecoveryGrade: config.averageRecoveryGrade ?? 4,
          maxAbsencePercentage: config.maxAbsencePercentage ?? 25,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ConfigFormData) => {
      const { data: result } = await api.patch('/school-config', data);
      return result;
    },
    onSuccess: () => success('Configurações salvas com sucesso'),
    onError: () => error('Erro ao salvar configurações'),
  });

  const onSubmit = (data: ConfigFormData) => updateMutation.mutateAsync(data);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
        <p className="text-muted-foreground">Configurações gerais da escola</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Escolares
            </CardTitle>
            <CardDescription>
              Defina os parâmetros de aprovação, recuperação e frequência.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              label="Nome da Escola"
              error={errors.schoolName?.message}
              {...register('schoolName')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Média para aprovação"
                type="number"
                step="0.1"
                error={errors.averagePassGrade?.message}
                {...register('averagePassGrade')}
              />
              <Input
                label="Média para recuperação"
                type="number"
                step="0.1"
                error={errors.averageRecoveryGrade?.message}
                {...register('averageRecoveryGrade')}
              />
            </div>

            <Input
              label="Percentual máximo de faltas (%)"
              type="number"
              step="1"
              error={errors.maxAbsencePercentage?.message}
              {...register('maxAbsencePercentage')}
            />

            <div className="rounded-md border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Como funciona o cálculo de médias:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Média 1 = (1º Bimestre + 2º Bimestre) ÷ 2</li>
                <li>Média 2 = (3º Bimestre + 4º Bimestre) ÷ 2</li>
                <li>Média Final = (Média 1 + Média 2) ÷ 2</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button type="submit" loading={isSubmitting || updateMutation.isPending}>
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  );
}
