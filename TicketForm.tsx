import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  File,
  CheckCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const ticketSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres").max(100, "Título muito longo"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  category: z.string().min(1, "Categoria é obrigatória"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  organization: z.string().min(1, "Organização é obrigatória"),
  dueDate: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  onSubmit?: (data: TicketFormData & { attachments: File[] }) => void;
  className?: string;
}

const TicketForm = ({ onSubmit, className }: TicketFormProps) => {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
      organization: "",
      dueDate: "",
    },
  });

  const categories = [
    { value: "access", label: "Acesso", description: "Problemas de login, permissões" },
    { value: "system", label: "Sistema", description: "Erros, bugs, funcionalidades" },
    { value: "hardware", label: "Hardware", description: "Equipamentos, infraestrutura" },
    { value: "software", label: "Software", description: "Aplicações, licenças" },
    { value: "network", label: "Rede", description: "Conectividade, internet" },
    { value: "email", label: "Email", description: "Problemas com email" },
    { value: "phone", label: "Telefone", description: "Telefonia, ramais" },
    { value: "users", label: "Usuários", description: "Cadastro, alterações" },
    { value: "other", label: "Outros", description: "Outras solicitações" },
  ];

  const organizations = [
    { value: "matriz", label: "Matriz" },
    { value: "filial-sp", label: "Filial São Paulo" },
    { value: "filial-rj", label: "Filial Rio de Janeiro" },
    { value: "filial-mg", label: "Filial Minas Gerais" },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 5;

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de 10MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (attachments.length + validFiles.length > maxFiles) {
      toast({
        title: "Muitos arquivos",
        description: `Máximo de ${maxFiles} arquivos permitidos`,
        variant: "destructive",
      });
      return;
    }

    setAttachments(prev => [...prev, ...validFiles]);
    event.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (file.type.includes('pdf') || file.type.includes('document')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (data: TicketFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onSubmit) {
        onSubmit({ ...data, attachments });
      }
      
      toast({
        title: "Ticket criado com sucesso!",
        description: "Seu ticket foi criado e será processado em breve.",
        variant: "default",
      });
      
      form.reset();
      setAttachments([]);
    } catch (error) {
      toast({
        title: "Erro ao criar ticket",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "text-success border-success bg-success/10";
      case "medium":
        return "text-warning border-warning bg-warning/10";
      case "high":
        return "text-danger border-danger bg-danger/10";
      case "critical":
        return "text-purple-600 border-purple-600 bg-purple-600/10";
      default:
        return "text-muted-foreground border-border";
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Criar Novo Ticket</span>
          {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
        </CardTitle>
        <CardDescription>
          Preencha os campos abaixo para criar um novo ticket de suporte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Descreva brevemente o problema..."
                      {...field}
                      className="transition-smooth"
                    />
                  </FormControl>
                  <FormDescription>
                    Título claro e objetivo do seu problema ou solicitação
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria e Prioridade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex flex-col">
                              <span>{category.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {category.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-success"></div>
                            <span>Baixa</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-warning"></div>
                            <span>Média</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-danger"></div>
                            <span>Alta</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="critical">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                            <span>Crítica</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Organização e Data de Vencimento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organização *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a organização" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.value} value={org.value}>
                            {org.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                        className="transition-smooth"
                      />
                    </FormControl>
                    <FormDescription>
                      Data limite para resolução (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva detalhadamente o problema, incluindo passos para reproduzi-lo, mensagens de erro, etc..."
                      className="min-h-[120px] transition-smooth"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Quanto mais detalhes você fornecer, mais rápido poderemos ajudar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload de Arquivos */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Anexos</label>
                <p className="text-xs text-muted-foreground mt-1">
                  Adicione capturas de tela, logs ou outros arquivos relevantes (máx. 5 arquivos, 10MB cada)
                </p>
              </div>
              
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,.pdf,.doc,.docx,.txt,.log"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Clique para fazer upload ou arraste arquivos aqui
                  </span>
                </label>
              </div>

              {/* Lista de Arquivos */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preview da Prioridade */}
            {form.watch("priority") && (
              <div className="p-4 border border-border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Prioridade selecionada:</span>
                  <Badge className={cn("", getPriorityColor(form.watch("priority")))}>
                    {form.watch("priority").toUpperCase()}
                  </Badge>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSubmitting}
              >
                Limpar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Criar Ticket
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TicketForm;