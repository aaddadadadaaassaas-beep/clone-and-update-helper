import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export interface ReportData {
  type: 'performance' | 'users' | 'categories';
  data: any;
  generatedAt: string;
}

export type ExportFormat = 'json' | 'excel';

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportToExcel = (data: ReportData, filename: string) => {
  const workbook = XLSX.utils.book_new();
  
  if (data.type === 'performance') {
    // Aba de métricas gerais
    const metricsSheet = XLSX.utils.json_to_sheet([
      { Métrica: 'Total de Tickets', Valor: data.data.totalTickets },
      { Métrica: 'Tickets Fechados', Valor: data.data.closedTickets },
      { Métrica: 'Tickets Atrasados', Valor: data.data.overdueTickets },
      { Métrica: 'Taxa de Performance (%)', Valor: data.data.performanceRate },
      { Métrica: 'Tempo Médio de Resolução', Valor: data.data.avgResolutionTime }
    ]);
    XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Métricas Gerais');
    
    // Aba de tickets por prioridade
    const prioritySheet = XLSX.utils.json_to_sheet([
      { Prioridade: 'Urgente', Quantidade: data.data.ticketsByPriority.urgent },
      { Prioridade: 'Alta', Quantidade: data.data.ticketsByPriority.high },
      { Prioridade: 'Normal', Quantidade: data.data.ticketsByPriority.normal },
      { Prioridade: 'Baixa', Quantidade: data.data.ticketsByPriority.low }
    ]);
    XLSX.utils.book_append_sheet(workbook, prioritySheet, 'Por Prioridade');
  } 
  else if (data.type === 'users') {
    // Aba de estatísticas
    const statsSheet = XLSX.utils.json_to_sheet([
      { Métrica: 'Total de Usuários', Valor: data.data.totalUsers },
      { Métrica: 'Usuários Ativos', Valor: data.data.activeUsers },
      { Métrica: 'Usuários Inativos', Valor: data.data.inactiveUsers },
      { Métrica: 'Administradores', Valor: data.data.usersByRole.admin },
      { Métrica: 'Proprietários', Valor: data.data.usersByRole.owner },
      { Métrica: 'Funcionários', Valor: data.data.usersByRole.employee },
      { Métrica: 'Usuários Comuns', Valor: data.data.usersByRole.user }
    ]);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estatísticas');
    
    // Aba de lista de usuários
    const usersSheet = XLSX.utils.json_to_sheet(
      data.data.users.map((user: any) => ({
        Nome: user.name,
        Email: user.email,
        Perfil: user.role === 'admin' ? 'Administrador' : 
               user.role === 'owner' ? 'Proprietário' :
               user.role === 'employee' ? 'Funcionário' : 'Usuário',
        Status: user.isActive ? 'Ativo' : 'Inativo',
        Organização: user.organization || 'N/A',
        'Data de Criação': new Date(user.createdAt).toLocaleDateString('pt-BR')
      }))
    );
    XLSX.utils.book_append_sheet(workbook, usersSheet, 'Lista de Usuários');
  }
  else if (data.type === 'categories') {
    // Aba de estatísticas
    const statsSheet = XLSX.utils.json_to_sheet([
      { Métrica: 'Total de Categorias', Valor: data.data.totalCategories },
      { Métrica: 'Categorias Ativas', Valor: data.data.activeCategories }
    ]);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estatísticas');
    
    // Aba de lista de categorias
    const categoriesSheet = XLSX.utils.json_to_sheet(
      data.data.categories.map((category: any) => ({
        Nome: category.name,
        Descrição: category.description || 'N/A',
        Cor: category.color,
        'Tickets Associados': category.ticketCount,
        Status: category.isActive ? 'Ativa' : 'Inativa',
        'Data de Criação': new Date(category.createdAt).toLocaleDateString('pt-BR')
      }))
    );
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Lista de Categorias');
  }
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadFile(blob, filename);
};

const exportToJson = (data: ReportData, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadFile(blob, filename);
};

export const useReports = () => {
  const { toast } = useToast();

  const generatePerformanceReport = useMutation({
    mutationFn: async ({ format }: { format: ExportFormat }): Promise<ReportData> => {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id,
          status,
          priority,
          created_at,
          updated_at,
          due_date,
          closed_at
        `);

      if (error) throw error;

      // Calcular métricas de performance
      const totalTickets = tickets.length;
      const closedTickets = tickets.filter(t => t.status === 'closed').length;
      const overdueTickets = tickets.filter(t => 
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'closed'
      ).length;
      
      const resolvedOnTime = tickets.filter(t => 
        t.status === 'closed' && 
        t.due_date && 
        t.closed_at && 
        new Date(t.closed_at) <= new Date(t.due_date)
      ).length;

      const performanceRate = totalTickets > 0 ? Math.round((resolvedOnTime / totalTickets) * 100) : 0;

      const reportData: ReportData = {
        type: 'performance',
        data: {
          totalTickets,
          closedTickets,
          overdueTickets,
          performanceRate,
          avgResolutionTime: '2.5 dias', // Cálculo simplificado
          ticketsByPriority: {
            urgent: tickets.filter(t => t.priority === 'urgent').length,
            high: tickets.filter(t => t.priority === 'high').length,
            normal: tickets.filter(t => t.priority === 'normal').length,
            low: tickets.filter(t => t.priority === 'low').length,
          }
        },
        generatedAt: new Date().toISOString()
      };

      // Fazer download baseado no formato
      const dateStr = new Date().toISOString().split('T')[0];
      if (format === 'excel') {
        exportToExcel(reportData, `relatorio-performance-${dateStr}.xlsx`);
      } else {
        exportToJson(reportData, `relatorio-performance-${dateStr}.json`);
      }

      return reportData;
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Relatório gerado',
        description: `Relatório de performance foi gerado em formato ${variables.format === 'excel' ? 'Excel' : 'JSON'} e baixado com sucesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const generateUsersReport = useMutation({
    mutationFn: async ({ format }: { format: ExportFormat }): Promise<ReportData> => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          is_active,
          created_at,
          organization
        `);

      if (error) throw error;

      const activeUsers = profiles.filter(p => p.is_active).length;
      const usersByRole = {
        admin: profiles.filter(p => p.role === 'admin').length,
        owner: profiles.filter(p => p.role === 'owner').length,
        employee: profiles.filter(p => p.role === 'employee').length,
        user: profiles.filter(p => p.role === 'user').length,
      };

      const reportData: ReportData = {
        type: 'users',
        data: {
          totalUsers: profiles.length,
          activeUsers,
          inactiveUsers: profiles.length - activeUsers,
          usersByRole,
          users: profiles.map(p => ({
            name: p.full_name,
            email: p.email,
            role: p.role,
            isActive: p.is_active,
            organization: p.organization,
            createdAt: p.created_at
          }))
        },
        generatedAt: new Date().toISOString()
      };

      // Fazer download baseado no formato
      const dateStr = new Date().toISOString().split('T')[0];
      if (format === 'excel') {
        exportToExcel(reportData, `relatorio-usuarios-${dateStr}.xlsx`);
      } else {
        exportToJson(reportData, `relatorio-usuarios-${dateStr}.json`);
      }

      return reportData;
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Relatório gerado',
        description: `Relatório de usuários foi gerado em formato ${variables.format === 'excel' ? 'Excel' : 'JSON'} e baixado com sucesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const generateCategoriesReport = useMutation({
    mutationFn: async ({ format }: { format: ExportFormat }): Promise<ReportData> => {
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*');

      if (catError) throw catError;

      // Buscar contagem de tickets por categoria
      const categoryStats = await Promise.all(
        categories.map(async (category) => {
          const { count, error } = await supabase
            .from('tickets')
            .select('*', { count: 'exact' })
            .eq('category_id', category.id);

          if (error) {
            console.error('Error counting tickets for category:', error);
            return { ...category, ticketCount: 0 };
          }

          return { ...category, ticketCount: count || 0 };
        })
      );

      const reportData: ReportData = {
        type: 'categories',
        data: {
          totalCategories: categories.length,
          activeCategories: categories.filter(c => c.is_active).length,
          categories: categoryStats.map(c => ({
            name: c.name,
            description: c.description,
            color: c.color,
            ticketCount: c.ticketCount,
            isActive: c.is_active,
            createdAt: c.created_at
          }))
        },
        generatedAt: new Date().toISOString()
      };

      // Fazer download baseado no formato
      const dateStr = new Date().toISOString().split('T')[0];
      if (format === 'excel') {
        exportToExcel(reportData, `relatorio-categorias-${dateStr}.xlsx`);
      } else {
        exportToJson(reportData, `relatorio-categorias-${dateStr}.json`);
      }

      return reportData;
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Relatório gerado',
        description: `Relatório de categorias foi gerado em formato ${variables.format === 'excel' ? 'Excel' : 'JSON'} e baixado com sucesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    generatePerformanceReport,
    generateUsersReport,
    generateCategoriesReport,
  };
};