import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import UserManagementSection from "../components/user/UserManagementSection";
import { useState } from "react";

function Managers() {

  const [searchTerm, setSearchTerm] = useState(""); 
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6">
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <UserManagementSection
          title="Managers Management"
          filterRole="manager"
          emptyMessage="No managers found."
          roleOptions={["manager"]}
        />
      </main>
    </div>
  );
}

export default Managers;
