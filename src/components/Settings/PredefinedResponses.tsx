import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Plus, Edit, Trash2, Tag } from 'lucide-react';

interface PredefinedResponse {
  id?: string;
  title: string;
  content: string;
  category: string;
  is_active: boolean;
}

const PredefinedResponses = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<PredefinedResponse | null>(null);
  const [newResponse, setNewResponse] = useState<PredefinedResponse>({
    title: '',
    content: '',
    category: 'geral',
    is_active: true
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Categories for organizing responses
  const categories = [
    { value: 'geral', label: 'Geral' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'suporte', label: 'Suporte' },
    { value: 'fechamento', label: 'Fechamento' },
    { value: 'aguardando', label: 'Aguardando' }
  ];

  // Fetch predefined responses
  const { data: responses, isLoading } = useQuery({
    queryKey: ['predefined-responses'],
    queryFn: async () => {
      // For now, we'll use a simple approach with localStorage until we add a table
      const stored = localStorage.getItem('predefined-responses');
      return stored ? JSON.parse(stored) : [];
    }
  });

  // Save predefined response
  const saveMutation = useMutation({
    mutationFn: async (response: PredefinedResponse) => {
      const responses = JSON.parse(localStorage.getItem('predefined-responses') || '[]');
      
      if (response.id) {
        // Update existing
        const index = responses.findIndex((r: any) => r.id === response.id);
        if (index !== -1) {
          responses[index] = response;
        }
      } else {
        // Create new
        response.id = Date.now().toString();
        responses.push(response);
      }
      
      localStorage.setItem('predefined-responses', JSON.stringify(responses));
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predefined-responses'] });
      setIsOpen(false);
      setEditingResponse(null);
      setNewResponse({
        title: '',
        content: '',
        category: 'geral',
        is_active: true
      });
      toast({
        title: "Resposta salva",
        description: "A resposta pré-definida foi salva com sucesso.",
      });
    }
  });

  // Delete predefined response
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const responses = JSON.parse(localStorage.getItem('predefined-responses') || '[]');
      const filtered = responses.filter((r: any) => r.id !== id);
      localStorage.setItem('predefined-responses', JSON.stringify(filtered));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predefined-responses'] });
      toast({
        title: "Resposta removida",
        description: "A resposta pré-definida foi removida.",
      });
    }
  });

  const handleSave = () => {
    const response = editingResponse || newResponse;
    
    if (!response.title.trim() || !response.content.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e conteúdo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(response);
  };

  const handleEdit = (response: PredefinedResponse) => {
    setEditingResponse(response);
    setIsOpen(true);
  };

  const handleNew = () => {
    setEditingResponse(null);
    setNewResponse({
      title: '',
      content: '',
      category: 'geral',
      is_active: true
    });
    setIsOpen(true);
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      geral: 'bg-blue-100 text-blue-800',
      tecnico: 'bg-green-100 text-green-800',
      comercial: 'bg-purple-100 text-purple-800',
      suporte: 'bg-orange-100 text-orange-800',
      fechamento: 'bg-gray-100 text-gray-800',
      aguardando: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Group responses by category
  const groupedResponses = responses?.reduce((acc: any, response: PredefinedResponse) => {
    const category = response.category || 'geral';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(response);
    return acc;
  }, {}) || {};

  const currentResponse = editingResponse || newResponse;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Respostas Pré-definidas
            </CardTitle>
            <CardDescription>
              Crie respostas rápidas para situações comuns
            </CardDescription>
          </div>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Resposta
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedResponses).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma resposta pré-definida encontrada.</p>
            <p>Clique em "Nova Resposta" para criar sua primeira resposta.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedResponses).map(([category, responses]) => (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <h3 className="font-semibold">{getCategoryLabel(category)}</h3>
                  <Badge variant="outline">{(responses as any[]).length}</Badge>
                </div>
                
                <div className="grid gap-4">
                  {(responses as PredefinedResponse[]).map((response) => (
                    <Card key={response.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{response.title}</h4>
                            <Badge className={getCategoryColor(response.category)}>
                              {getCategoryLabel(response.category)}
                            </Badge>
                            {!response.is_active && (
                              <Badge variant="secondary">Inativo</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {response.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(response)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(response.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingResponse ? 'Editar Resposta' : 'Nova Resposta Pré-definida'}
              </DialogTitle>
              <DialogDescription>
                Configure uma resposta que pode ser reutilizada rapidamente
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ex: Solicitação de informações adicionais"
                  value={currentResponse.title}
                  onChange={(e) => {
                    if (editingResponse) {
                      setEditingResponse({...editingResponse, title: e.target.value});
                    } else {
                      setNewResponse({...newResponse, title: e.target.value});
                    }
                  }}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  value={currentResponse.category}
                  onChange={(e) => {
                    if (editingResponse) {
                      setEditingResponse({...editingResponse, category: e.target.value});
                    } else {
                      setNewResponse({...newResponse, category: e.target.value});
                    }
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content">Conteúdo da Resposta</Label>
                <Textarea
                  id="content"
                  placeholder="Digite o conteúdo da resposta pré-definida..."
                  className="min-h-[120px]"
                  value={currentResponse.content}
                  onChange={(e) => {
                    if (editingResponse) {
                      setEditingResponse({...editingResponse, content: e.target.value});
                    } else {
                      setNewResponse({...newResponse, content: e.target.value});
                    }
                  }}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-active"
                  checked={currentResponse.is_active}
                  onChange={(e) => {
                    if (editingResponse) {
                      setEditingResponse({...editingResponse, is_active: e.target.checked});
                    } else {
                      setNewResponse({...newResponse, is_active: e.target.checked});
                    }
                  }}
                  className="rounded"
                />
                <Label htmlFor="is-active">Resposta ativa</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Salvando...' : 'Salvar Resposta'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PredefinedResponses;