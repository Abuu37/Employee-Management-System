import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import StartCard from "../components/dashboard/StartCard";
import UserManagementSection from "../components/user/UserManagementSection";
import { useState } from "react";

function Dashboard() {

  const [searchTerm, setSearchTerm] = useState("");


  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6">

        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StartCard
            title="Total Employees"
            value="12"
            extra="2% from last month"
          />
          <StartCard 
            title="Managers" 
            value="6" 
            extra="+2 new this quarter" 
          />
          <StartCard
            title="Open Tasks"
            value="0"
            extra="0 need urgent review"
          />
        </section>

        <UserManagementSection
          title="Staff Management"
          emptyMessage="No users found."
        />
      </main>
    </div>
  );
}

export default Dashboard;
