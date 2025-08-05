import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCreateComment, useComments, useTicketHistory } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageSquare, 
  Lock, 
  Clock, 
  User,
  Send,
  History
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const commentSchema = z.object({
  content: z.string().min(1, 'Comentário não pode estar vazio'),
  is_private: z.boolean().default(false),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentsSectionProps {
  ticketId: string;
}

const CommentsSection = ({ ticketId }: CommentsSectionProps) => {
  const [showPrivateComments, setShowPrivateComments] = useState(false);
  const { data: comments, isLoading: commentsLoading } = useComments(ticketId);
  const { data: history, isLoading: historyLoading } = useTicketHistory(ticketId);
  const createComment = useCreateComment();
  const { user } = useAuth();

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
      is_private: false,
    },
  });

  const handleSubmit = async (data: CommentFormData) => {
    try {
      await createComment.mutateAsync({
        ticket_id: ticketId,
        content: data.content,
        is_private: data.is_private,
      });
      form.reset();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const filteredComments = comments?.filter(comment => 
    showPrivateComments || !comment.is_private
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comunicação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="comments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comments">
              Comentários ({comments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="history">
              Histórico ({history?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="comments" className="space-y-4">
            {/* Toggle para comentários privados */}
            <div className="flex items-center space-x-2">
              <Switch
                id="show-private"
                checked={showPrivateComments}
                onCheckedChange={setShowPrivateComments}
              />
              <Label htmlFor="show-private" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Mostrar comentários privados
              </Label>
            </div>

            {/* Lista de comentários */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {commentsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex gap-3">
                        <div className="h-8 w-8 bg-muted rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                          <div className="h-16 bg-muted rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredComments?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                </div>
              ) : (
                filteredComments?.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-4 bg-muted/30 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {comment.user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{comment.user?.full_name || 'Usuário'}</span>
                        <span className="text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString('pt-BR')}
                        </span>
                        {comment.is_private && (
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Privado
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm whitespace-pre-wrap">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Formulário de novo comentário */}
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Adicione um comentário..."
                  {...form.register('content')}
                  className="min-h-[100px]"
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.content.message}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-private"
                    {...form.register('is_private')}
                  />
                  <Label htmlFor="is-private" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Comentário privado
                  </Label>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={createComment.isPending}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {createComment.isPending ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {historyLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : history?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum histórico disponível.</p>
                </div>
              ) : (
                history?.map((entry) => (
                  <div key={entry.id} className="flex gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{entry.user?.full_name || 'Sistema'}</span>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {new Date(entry.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {entry.description}
                        {entry.old_value && entry.new_value && (
                          <span className="block mt-1">
                            <span className="line-through text-red-600">{entry.old_value}</span>
                            {' → '}
                            <span className="text-green-600">{entry.new_value}</span>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CommentsSection;