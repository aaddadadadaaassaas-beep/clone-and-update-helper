import Layout from "@/components/Layout/Layout";
import ExportManager from "@/components/Reports/ExportManager";

const Reports = () => {
  return (
    <Layout title="Relatórios" subtitle="Exportação e operações em lote">
      <ExportManager />
    </Layout>
  );
};

export default Reports;