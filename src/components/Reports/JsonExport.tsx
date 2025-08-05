import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface JsonExportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JsonExport = ({ open, onOpenChange }: JsonExportProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [exportType, setExportType] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');

  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se o usuário é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!profile || !['admin', 'owner'].includes(profile.role)) {
        throw new Error('Acesso negado: apenas administradores podem exportar dados');
      }

      let query = supabase
        .from('tickets')
        .select(`
          *,
          submitter:submitter_id(id, full_name, email),
          assignee:assignee_id(id, full_name, email),
          category:category_id(id, name, color),
          comments(
            id,
            content,
            is_private,
            created_at,
            user:user_id(id, full_name, email)
          ),
          attachments(
            id,
            filename,
            file_size,
            mime_type,
            created_at
          ),
          ticket_history(
            id,
            action,
            field_name,
            old_value,
            new_value,
            description,
            created_at,
            user:user_id(id, full_name, email)
          )
        `);

      if (dateFrom) {
        query = query.gte('created_at', dateFrom.toISOString());
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo.toISOString());
      }
      if (exportType !== 'all') {
        query = query.eq('status', exportType as 'open' | 'waiting' | 'closed');
      }
      if (category !== 'all') {
        query = query.eq('category_id', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Gerar arquivo JSON
      const jsonData = {
        export_date: new Date().toISOString(),
        export_filters: {
          date_from: dateFrom?.toISOString(),
          date_to: dateTo?.toISOString(),
          export_type: exportType,
          category: category
        },
        total_tickets: data?.length || 0,
        tickets: data
      };

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tickets-export-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Exportação concluída',
        description: `${data?.length || 0} tickets exportados com sucesso.`,
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro na exportação',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Exportar Tickets JSON
          </DialogTitle>
          <DialogDescription>
            Configure os filtros para exportar dados de tickets em formato JSON.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Exportação</Label>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tickets</SelectItem>
                <SelectItem value="open">Apenas abertos</SelectItem>
                <SelectItem value="closed">Apenas fechados</SelectItem>
                <SelectItem value="waiting">Apenas em espera</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data Final</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Shield className="h-4 w-4 mr-2 text-warning" />
              <span className="text-sm font-medium">Dados Incluídos</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Informações completas dos tickets</li>
              <li>• Histórico de alterações</li>
              <li>• Comentários públicos e privados</li>
              <li>• Referências de anexos</li>
              <li>• Dados dos usuários envolvidos</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            {exportMutation.isPending ? 'Exportando...' : 'Exportar JSON'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JsonExport;