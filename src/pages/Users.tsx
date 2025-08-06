import Layout from "@/components/Layout/Layout";
import UsersList from "@/components/Users/UsersList";
import UserManagement from "@/components/Users/UserManagement";

const Users = () => {
  return (
    <Layout title="Usuários" subtitle="Gerencie usuários e permissões do sistema">
      <div className="space-y-6">
        <UsersList />
      </div>
    </Layout>
  );
};

export default Users;