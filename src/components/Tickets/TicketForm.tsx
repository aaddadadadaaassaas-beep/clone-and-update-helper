import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from '@/hooks/useCategories';
import { useCreateTicket } from '@/hooks/useTickets';
import { useNavigate } from 'react-router-dom';
import FileUpload from './FileUpload';
import { UploadedFile } from '@/hooks/useFileUpload';

const ticketSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  category_id: z.string().min(1, "Categoria é obrigatória"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
});

type TicketFormData = z.infer<typeof ticketSchema>;

const priorities = [
  { value: "low", label: "Baixa" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
];

const TicketForm = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createTicket = useCreateTicket();
  const navigate = useNavigate();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      priority: "normal",
    },
  });

  const handleSubmit = async (data: TicketFormData) => {
    try {
      const result = await createTicket.mutateAsync({
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        priority: data.priority,
      });
      
      // Set the created ticket ID to enable file uploads
      setCreatedTicketId(result.id);
      
      toast({
        title: "Ticket criado com sucesso!",
        description: "Agora você pode adicionar anexos se desejar.",
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleFilesChange = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  if (categoriesLoading) {
    return <div>Carregando categorias...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Criar Novo Ticket</CardTitle>
        <CardDescription>
          Preencha os dados abaixo para criar um novo ticket de suporte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Descreva brevemente o problema..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o problema em detalhes..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
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
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Label>Anexos</Label>
              {!createdTicketId ? (
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Primeiro crie o ticket para poder adicionar anexos
                  </p>
                </div>
              ) : (
                <FileUpload
                  ticketId={createdTicketId}
                  onFilesChange={handleFilesChange}
                  maxFiles={5}
                  disabled={false}
                  existingFiles={uploadedFiles}
                />
              )}
            </div>

            <div className="flex gap-4 pt-4">
              {!createdTicketId ? (
                <>
                  <Button type="submit" disabled={createTicket.isPending} className="flex-1">
                    {createTicket.isPending ? "Criando..." : "Criar Ticket"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      form.reset();
                      setUploadedFiles([]);
                      setCreatedTicketId(null);
                    }}
                  >
                    Limpar
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    type="button" 
                    onClick={() => navigate('/tickets')}
                    className="flex-1"
                  >
                    Ir para Meus Tickets
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      form.reset();
                      setUploadedFiles([]);
                      setCreatedTicketId(null);
                    }}
                  >
                    Criar Novo Ticket
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TicketForm;