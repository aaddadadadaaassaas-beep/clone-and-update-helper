import Layout from "@/components/Layout/Layout";
import UsersList from "@/components/Users/UsersList";

const Users = () => {
  return (
    <Layout title="Usuários" subtitle="Gerencie usuários e permissões do sistema">
      <UsersList />
    </Layout>
  );
};

export default Users;