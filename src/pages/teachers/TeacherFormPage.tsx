import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useTeacher, useCreateTeacher, useUpdateTeacher } from '../../hooks/useTeachers';
import { useToast } from '../../components/ui/Toast';
import { subjectsService } from '../../services/subjects.service';
import { isValidCPF, formatCPFInput, isAdult } from '../../utils/cpf';

const teacherSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').optional().or(z.literal('')),
  cpf: z.string()
    .refine((v) => isValidCPF(v), 'CPF inválido — verifique os dígitos'),
  birthDate: z.string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((v) => isAdult(v), 'Professor deve ser maior de 18 anos'),
  phone: z.string().min(10, 'Telefone inválido'),
  registrationNumber: z.string().min(1, 'Nº de registro é obrigatório'),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

export default function TeacherFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { success, error } = useToast();

  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [cpfDisplay, setCpfDisplay] = useState('');

  const { data: teacher } = useTeacher(id || '');

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', { limit: 100 }],
    queryFn: () => subjectsService.findAll({ limit: 100 }),
  });

  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    values: teacher
      ? {
          name: teacher.name,
          email: '',
          password: '',
          cpf: teacher.cpf,
          birthDate: teacher.birthDate?.split('T')[0] ?? '',
          phone: teacher.phone,
          registrationNumber: teacher.registrationNumber || (teacher as any).registration || '',
        }
      : undefined,
  });

  // Sync selected subjects from existing teacher
  React.useEffect(() => {
    if (teacher?.subjects?.length) {
      setSelectedSubjectIds(teacher.subjects.map((s) => s.id));
    }
  }, [teacher]);

  // Sync CPF display when editing
  React.useEffect(() => {
    if (teacher?.cpf) setCpfDisplay(formatCPFInput(teacher.cpf));
  }, [teacher]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPFInput(e.target.value);
    setCpfDisplay(formatted);
    setValue('cpf', formatted.replace(/\D/g, ''), { shouldValidate: true });
  };

  const subjectOptions = subjectsData?.data?.map((s) => ({ value: s.id, label: s.name })) ?? [];
  const selectedSubjects = subjectsData?.data?.filter((s) => selectedSubjectIds.includes(s.id)) ?? [];
  const availableSubjects = subjectOptions.filter((o) => !selectedSubjectIds.includes(o.value));

  const addSubject = (id: string) => {
    if (id && !selectedSubjectIds.includes(id)) {
      setSelectedSubjectIds((prev) => [...prev, id]);
    }
  };

  const removeSubject = (id: string) => {
    setSelectedSubjectIds((prev) => prev.filter((s) => s !== id));
  };

  const onSubmit = async (data: TeacherFormData) => {
    const payload = {
      ...data,
      cpf: data.cpf.replace(/\D/g, ''),
      subjectIds: selectedSubjectIds,
    };
    try {
      if (isEditing) {
        const { password, ...rest } = payload;
        await updateTeacher.mutateAsync({ id: id!, dto: password ? payload : rest });
        success('Professor atualizado com sucesso');
      } else {
        await createTeacher.mutateAsync({ ...payload, password: payload.password || '' });
        success('Professor cadastrado com sucesso');
      }
      navigate('/teachers');
    } catch {
      error(isEditing ? 'Erro ao atualizar professor' : 'Erro ao cadastrar professor');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/teachers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Editar Professor' : 'Novo Professor'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize os dados do professor' : 'Preencha os dados para cadastrar'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Dados Pessoais</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input label="Nome completo *" placeholder="Maria da Silva" error={errors.name?.message} {...register('name')} />
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
              <Input label="Data de Nascimento *" type="date" error={errors.birthDate?.message} {...register('birthDate')} />
              <Input label="Telefone *" placeholder="(11) 99999-9999" error={errors.phone?.message} {...register('phone')} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Acesso e Registro</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input label="Email *" type="email" placeholder="professor@escola.com" error={errors.email?.message} {...register('email')} />
              <Input label={isEditing ? 'Nova senha (opcional)' : 'Senha *'} type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
              <Input label="Nº de Registro *" placeholder="REG-001" error={errors.registrationNumber?.message} {...register('registrationNumber')} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Disciplinas que leciona</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Select
                options={[{ value: '', label: 'Selecione uma disciplina...' }, ...availableSubjects]}
                value=""
                onValueChange={addSubject}
                placeholder="Adicionar disciplina"
              />
                  <div className="min-h-24 rounded-md border border-border bg-secondary/20 p-3">
                {selectedSubjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSubjects.map((s) => (
                      <Badge key={s.id} variant="secondary" className="flex items-center gap-1 pr-1 text-sm py-1">
                        {s.name}
                        {s.code && <span className="text-xs opacity-60 ml-1">({s.code})</span>}
                        <button
                          type="button"
                          onClick={() => removeSubject(s.id)}
                          className="ml-1 rounded-full hover:bg-muted p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma disciplina selecionada — use o seletor acima para adicionar</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/teachers')}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Salvar Alterações' : 'Cadastrar Professor'}
          </Button>
        </div>
      </form>
    </div>
  );
}
