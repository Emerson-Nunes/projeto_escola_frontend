import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { subjectsService } from '../../services/subjects.service';

const subjectSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  code: z.string().min(2, 'Código é obrigatório'),
  workload: z.coerce.number().min(1, 'Carga horária deve ser maior que 0'),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

export default function SubjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const { data: subject } = useQuery({
    queryKey: ['subjects', id],
    queryFn: () => subjectsService.findById(id!),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: subjectsService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ sid, dto }: { sid: string; dto: Partial<SubjectFormData> }) =>
      subjectsService.update(sid, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] }),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    values: subject ? { name: subject.name, code: subject.code, workload: subject.workload } : undefined,
  });

  const onSubmit = async (data: SubjectFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ sid: id!, dto: data });
        success('Disciplina atualizada com sucesso');
      } else {
        await createMutation.mutateAsync(data);
        success('Disciplina cadastrada com sucesso');
      }
      navigate('/subjects');
    } catch {
      error(isEditing ? 'Erro ao atualizar disciplina' : 'Erro ao cadastrar disciplina');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/subjects')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold text-foreground">
          {isEditing ? 'Editar Disciplina' : 'Nova Disciplina'}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="max-w-lg">
          <CardHeader><CardTitle>Dados da Disciplina</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input label="Nome *" placeholder="Matemática" error={errors.name?.message} {...register('name')} />
            <Input label="Código *" placeholder="MAT-001" error={errors.code?.message} {...register('code')} />
            <Input label="Carga Horária (horas) *" type="number" error={errors.workload?.message} {...register('workload')} />
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/subjects')}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Salvar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
