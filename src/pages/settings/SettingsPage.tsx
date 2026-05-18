import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../utils/cn';
import api from '../../services/api';
import { formatPhoneInput } from '../../utils/phone';

// ─── Schemas ───────────────────────────────────────────────────────────────────

const academicSchema = z.object({
  schoolName: z.string().min(2, 'Nome é obrigatório'),
  averagePassGrade: z.coerce.number().min(0).max(10),
  averageRecoveryGrade: z.coerce.number().min(0).max(10),
  maxAbsencePercentage: z.coerce.number().min(0).max(100),
});

const contactSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  directorName: z.string().optional(),
  institutionalInfo: z.string().optional(),
});

type AcademicFormData = z.infer<typeof academicSchema>;
type ContactFormData = z.infer<typeof contactSchema>;

// ─── Tab component ─────────────────────────────────────────────────────────────

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-md transition-colors',
        active
          ? 'bg-primary text-white'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

// ─── Academic settings tab ─────────────────────────────────────────────────────

function AcademicSettingsTab({ config }: { config: any }) {
  const { success, error } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AcademicFormData>({
    resolver: zodResolver(academicSchema),
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
    mutationFn: async (data: AcademicFormData) => {
      const { data: result } = await api.patch('/school-config', data);
      return result;
    },
    onSuccess: () => success('Configurações salvas com sucesso'),
    onError: () => error('Erro ao salvar configurações'),
  });

  const onSubmit = (data: AcademicFormData) => updateMutation.mutateAsync(data);

  return (
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
  );
}

// ─── Contact settings tab ──────────────────────────────────────────────────────

function ContactSettingsTab({ config }: { config: any }) {
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [phoneDisplay, setPhoneDisplay] = useState('');

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    values: config
      ? {
          phone: config.phone || '',
          email: config.email || '',
          address: config.address || '',
          directorName: config.directorName || '',
          institutionalInfo: config.institutionalInfo || '',
        }
      : undefined,
  });

  React.useEffect(() => {
    if (config?.phone) setPhoneDisplay(formatPhoneInput(config.phone));
  }, [config]);

  const updateMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const { data: result } = await api.patch('/school-config', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-config'] });
      success('Informações de contato salvas com sucesso');
    },
    onError: () => error('Erro ao salvar informações de contato'),
  });

  const onSubmit = (data: ContactFormData) => updateMutation.mutateAsync(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Informações da Direção
          </CardTitle>
          <CardDescription>
            Configure as informações de contato exibidas para alunos e responsáveis.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            label="Nome do(a) Diretor(a)"
            placeholder="Ex: Maria Silva"
            error={errors.directorName?.message}
            {...register('directorName')}
          />
          <Input
            label="Telefone"
            value={phoneDisplay}
            onChange={(e) => {
              const formatted = formatPhoneInput(e.target.value);
              setPhoneDisplay(formatted);
              setValue('phone', formatted);
            }}
            placeholder="(00) 00000-0000"
            error={errors.phone?.message}
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="Ex: direcao@escola.edu.br"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Endereço"
            placeholder="Ex: Rua das Flores, 100 — Centro"
            error={errors.address?.message}
            {...register('address')}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Informações Institucionais</label>
            <textarea
              rows={4}
              placeholder="Horário de atendimento, informações adicionais..."
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              {...register('institutionalInfo')}
            />
            {errors.institutionalInfo && (
              <p className="text-xs text-destructive">{errors.institutionalInfo.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button type="submit" loading={isSubmitting || updateMutation.isPending}>
          Salvar Informações
        </Button>
      </div>
    </form>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

type TabKey = 'academic' | 'contact';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('academic');

  const { data: config, isLoading } = useQuery({
    queryKey: ['school-config'],
    queryFn: async () => {
      const { data } = await api.get('/school-config');
      return data;
    },
  });

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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <TabButton active={activeTab === 'academic'} onClick={() => setActiveTab('academic')}>
          Configurações Escolares
        </TabButton>
        <TabButton active={activeTab === 'contact'} onClick={() => setActiveTab('contact')}>
          Informações da Direção
        </TabButton>
      </div>

      {activeTab === 'academic' && <AcademicSettingsTab config={config} />}
      {activeTab === 'contact' && <ContactSettingsTab config={config} />}
    </div>
  );
}
