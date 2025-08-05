import Layout from "@/components/Layout/Layout";
import ExportManager from "@/components/Reports/ExportManager";
import JsonExport from "@/components/Reports/JsonExport";
import BatchOperations from "@/components/Admin/BatchOperations";

const Reports = () => {
  return (
    <Layout title="Relatórios" subtitle="Exportação e operações em lote">
      <div className="space-y-6">
        <ExportManager />
        <JsonExport />
        <BatchOperations />
      </div>
    </Layout>
  );
};

export default Reports;