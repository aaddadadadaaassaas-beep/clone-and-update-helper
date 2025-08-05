import Layout from "@/components/Layout/Layout";
import CommunityForum from "@/pages/CommunityForum";
import EventsCalendar from "@/components/Community/EventsCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Calendar, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Community = () => {
  return (
    <Layout title="Comunidade" subtitle="Conecte-se, aprenda e compartilhe com outros usuários">
      <Tabs defaultValue="forum" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forum" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Fórum</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Eventos</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Ranking</span>
          </TabsTrigger>
          <TabsTrigger value="directory" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Diretório</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forum">
          <CommunityForum />
        </TabsContent>

        <TabsContent value="events">
          <EventsCalendar />
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Ranking da Comunidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Ranking em desenvolvimento...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="directory">
          <Card>
            <CardHeader>
              <CardTitle>Diretório de Especialistas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Diretório em desenvolvimento...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Community;