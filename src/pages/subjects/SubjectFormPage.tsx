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

type Shift = '' | 'MANHA' | 'TARDE';

function autoCode(name: string, shift: Shift): string {
  const base = name.trim().replace(/\s+/g, ' ').split(' ').slice(0, 3)
    .map((w) => w.slice(0, 3).toUpperCase()).join('').slice(0, 6);
  if (shift === 'MANHA') return `${base}-M`;
  if (shift === 'TARDE') return `${base}-V`;
  return base;
}

const subjectSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  code: z.string().min(2, 'Código é obrigatório'),
  workload: z.coerce.number().min(1, 'Carga horária deve ser maior que 0'),
  shift: z.string().optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

export default function SubjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [shift, setShift] = React.useState<Shift>('');

  const { data: subject } = useQuery({
    queryKey: ['subjects', id],
    queryFn: () => subjectsService.findById(id!),
    enabled: !!id,
  });

  React.useEffect(() => {
    if (subject) {
      setShift((subject as any).shift || '');
    }
  }, [subject]);

  const createMutation = useMutation({
    mutationFn: subjectsService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ sid, dto }: { sid: string; dto: Partial<SubjectFormData> }) =>
      subjectsService.update(sid, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] }),
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    values: subject
      ? { name: subject.name, code: subject.code || autoCode(subject.name, (subject as any).shift || ''), workload: subject.workload, shift: (subject as any).shift || '' }
      : undefined,
  });

  const watchedName = watch('name', '');

  React.useEffect(() => {
    if (!isEditing && watchedName.length >= 2) {
      setValue('code', autoCode(watchedName, shift));
    }
  }, [watchedName, shift, isEditing, setValue]);

  const handleShiftChange = (s: Shift) => {
    setShift(s);
    if (!isEditing && watchedName.length >= 2) {
      setValue('code', autoCode(watchedName, s));
    }
  };

  const onSubmit = async (data: SubjectFormData) => {
    try {
      const payload = { ...data, shift };
      if (isEditing) {
        await updateMutation.mutateAsync({ sid: id!, dto: payload });
        success('Disciplina atualizada com sucesso');
      } else {
        await createMutation.mutateAsync(payload);
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

            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">Turno</p>
              <div className="flex gap-2">
                {([['', 'Sem turno'], ['MANHA', 'Manhã (-M)'], ['TARDE', 'Tarde (-V)']] as [Shift, string][]).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleShiftChange(val)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      shift === val
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-secondary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">O turno adiciona sufixo -M (manhã) ou -V (tarde) no código.</p>
            </div>

            <div className="flex flex-col gap-1">
              <Input
                label="Código *"
                placeholder="MAT-M"
                error={errors.code?.message}
                {...register('code')}
              />
              <p className="text-xs text-muted-foreground">
                Gerado automaticamente a partir do nome + turno. Ex: Matemática manhã = MAT-M. Você pode editar.
              </p>
            </div>

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
