import Layout from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar,
  Clock,
  Users,
  MessageSquare,
  FileText,
  Plus,
  Send,
  Phone,
  Video,
  Search,
  Filter,
  Star,
  Eye,
  ThumbsUp
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ForumTopic {
  id: string;
  title: string;
  author: string;
  avatar?: string;
  content: string;
  replies: number;
  views: number;
  likes: number;
  category: string;
  isSticky: boolean;
  createdAt: string;
  lastReply: string;
}

const CommunityForum = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const forumTopics: ForumTopic[] = [
    {
      id: "1",
      title: "Dicas para otimizar o atendimento ao cliente",
      author: "Ana Silva",
      content: "Compartilho algumas estratégias que funcionaram na nossa empresa...",
      replies: 23,
      views: 145,
      likes: 18,
      category: "Dicas",
      isSticky: true,
      createdAt: "2024-01-20",
      lastReply: "2024-01-22"
    },
    {
      id: "2", 
      title: "Como configurar SLA personalizados?",
      author: "Carlos Santos",
      content: "Estou tentando configurar SLAs diferentes por categoria...",
      replies: 8,
      views: 67,
      likes: 5,
      category: "Configuração",
      isSticky: false,
      createdAt: "2024-01-19",
      lastReply: "2024-01-21"
    }
  ];

  const categories = ["Dicas", "Configuração", "Bugs", "Sugestões", "Geral"];

  return (
    <Layout title="Fórum da Comunidade" subtitle="Conecte-se e compartilhe conhecimento com outros usuários">
      <div className="space-y-6">
        {/* Forum Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div>
                <CardTitle>Fórum da Comunidade</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Tire dúvidas, compartilhe experiências e conecte-se com outros usuários
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tópico
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tópicos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  Todos
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Topics List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Tópicos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forumTopics.map((topic) => (
                    <div key={topic.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={topic.avatar} />
                          <AvatarFallback>
                            {topic.author.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {topic.isSticky && (
                              <Badge variant="secondary" className="text-xs">
                                📌 Fixado
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {topic.category}
                            </Badge>
                          </div>
                          
                          <h4 className="font-medium text-sm mb-1">{topic.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {topic.content}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>por {topic.author}</span>
                              <span>•</span>
                              <span>{topic.createdAt}</span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{topic.replies}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye className="h-3 w-3" />
                                <span>{topic.views}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ThumbsUp className="h-3 w-3" />
                                <span>{topic.likes}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Forum Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Tópicos</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Respostas</span>
                  <span className="font-medium">5,678</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Usuários Ativos</span>
                  <span className="font-medium">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Online Agora</span>
                  <span className="font-medium text-green-600">12</span>
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Contribuidores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Ana Silva", posts: 42, avatar: undefined },
                    { name: "Carlos Santos", posts: 38, avatar: undefined },
                    { name: "Maria Costa", posts: 35, avatar: undefined }
                  ].map((user, index) => (
                    <div key={user.name} className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.posts} posts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CommunityForum;