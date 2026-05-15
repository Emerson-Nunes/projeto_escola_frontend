import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { guardiansService } from '../../services/guardians.service';
import { classroomsService } from '../../services/classrooms.service';
import { studentsService } from '../../services/students.service';
import { isValidCPF, formatCPFInput } from '../../utils/cpf';

const guardianSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').optional().or(z.literal('')),
  cpf: z.string().refine((v) => isValidCPF(v), 'CPF inválido — verifique os dígitos'),
  phone: z.string().min(10, 'Telefone inválido'),
  relationship: z.string().min(2, 'Parentesco é obrigatório'),
});

type GuardianFormData = z.infer<typeof guardianSchema>;

export default function GuardianFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [cpfDisplay, setCpfDisplay] = useState('');
  const [classRoomId, setClassRoomId] = useState('');
  const [studentId, setStudentId] = useState('');

  const { data: guardian } = useQuery({
    queryKey: ['guardians', id],
    queryFn: () => guardiansService.findById(id!),
    enabled: !!id,
  });

  const { data: classroomsData } = useQuery({
    queryKey: ['classrooms', { limit: 100 }],
    queryFn: () => classroomsService.findAll({ limit: 100 }),
  });

  const { data: studentsData } = useQuery({
    queryKey: ['classrooms', classRoomId, 'students'],
    queryFn: () => classroomsService.findStudents(classRoomId),
    enabled: !!classRoomId,
  });

  const createMutation = useMutation({
    mutationFn: (dto: any) => guardiansService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guardians'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ gid, dto }: { gid: string; dto: any }) => guardiansService.update(gid, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guardians'] }),
  });

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<GuardianFormData>({
    resolver: zodResolver(guardianSchema),
    values: guardian
      ? { name: guardian.name, email: guardian.email, password: '', cpf: guardian.cpf, phone: guardian.phone, relationship: guardian.relationship }
      : undefined,
  });

  React.useEffect(() => {
    if (guardian?.cpf) setCpfDisplay(formatCPFInput(guardian.cpf));
    if (guardian?.students?.[0]) setStudentId(guardian.students[0].id);
  }, [guardian]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPFInput(e.target.value);
    setCpfDisplay(formatted);
    setValue('cpf', formatted.replace(/\D/g, ''), { shouldValidate: true });
  };

  const classroomOptions = [
    { value: '', label: 'Selecione a turma...' },
    ...(classroomsData?.data?.sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({ value: c.id, label: c.name })) ?? []),
  ];

  const studentOptions = [
    { value: '', label: 'Selecione o aluno...' },
    ...(studentsData?.data?.map((s) => ({ value: s.id, label: s.name })) ?? []),
  ];

  const onSubmit = async (data: GuardianFormData) => {
    try {
      const payload = { ...data, cpf: data.cpf.replace(/\D/g, '') };

      if (isEditing) {
        const { password, ...rest } = payload;
        await updateMutation.mutateAsync({ gid: id!, dto: password ? payload : rest });

        // Link student if selected
        if (studentId) {
          await studentsService.update(studentId, { guardianId: id! } as any);
        }
        success('Responsável atualizado com sucesso');
      } else {
        const guardian = await createMutation.mutateAsync({ ...payload, password: payload.password || '' });

        // Link student to guardian
        if (studentId && (guardian as any).id) {
          await studentsService.update(studentId, { guardianId: (guardian as any).id } as any);
        }
        success('Responsável cadastrado com sucesso');
      }
      navigate('/guardians');
    } catch {
      error(isEditing ? 'Erro ao atualizar responsável' : 'Erro ao cadastrar responsável');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/guardians')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Editar Responsável' : 'Novo Responsável'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Dados do Responsável</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input label="Nome completo *" error={errors.name?.message} {...register('name')} />
              <Input label="Email *" type="email" error={errors.email?.message} {...register('email')} />
              <Input label={isEditing ? 'Nova senha (opcional)' : 'Senha *'} type="password" error={errors.password?.message} {...register('password')} />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">CPF *</label>
                <input
                  type="text"
                  value={cpfDisplay}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.cpf ? 'border-destructive' : 'border-border'}`}
                />
                {errors.cpf && <p className="text-xs text-destructive">{errors.cpf.message}</p>}
              </div>

              <Input label="Telefone *" error={errors.phone?.message} {...register('phone')} />
              <Input label="Parentesco *" placeholder="Pai, Mãe, Avô, Avó..." error={errors.relationship?.message} {...register('relationship')} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Aluno Vinculado</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Select
                label="Turma"
                options={classroomOptions}
                value={classRoomId}
                onValueChange={(v) => { setClassRoomId(v); setStudentId(''); }}
                placeholder="Selecione a turma"
              />
              <Select
                label="Aluno"
                options={studentOptions}
                value={studentId}
                onValueChange={setStudentId}
                placeholder={classRoomId ? 'Selecione o aluno' : 'Selecione uma turma primeiro'}
                disabled={!classRoomId}
              />
              {studentId && (
                <p className="text-xs text-muted-foreground">
                  O aluno selecionado será vinculado a este responsável.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/guardians')}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Salvar Alterações' : 'Cadastrar Responsável'}
          </Button>
        </div>
      </form>
    </div>
  );
}
