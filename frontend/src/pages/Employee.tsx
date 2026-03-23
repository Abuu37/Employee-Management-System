import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import UserManagementSection from "../components/user/UserManagementSection";
import { useState } from "react";

function Employees() {

  const [searchTerm, setSearchTerm] = useState("");
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6">
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <UserManagementSection
          title="Employees Management"
          filterRole="employee"
          emptyMessage="No employees found."
          roleOptions={["employee"]}
        />
      </main>
    </div>
  );
}

export default Employees;
