import Layout from "@/components/Layout/Layout";
import KnowledgeBase from "@/components/KnowledgeBase/KnowledgeBase";

const KnowledgeBasePage = () => {
  return (
    <Layout title="Base de Conhecimento" subtitle="Gerencie artigos e documentação do sistema">
      <KnowledgeBase />
    </Layout>
  );
};

export default KnowledgeBasePage;