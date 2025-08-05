import Layout from "@/components/Layout/Layout";
import CategoryManager from "@/components/Categories/CategoryManager";

const Categories = () => {
  return (
    <Layout title="Categorias" subtitle="Organize tickets por categorias">
      <CategoryManager />
    </Layout>
  );
};

export default Categories;