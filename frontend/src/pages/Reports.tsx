import { useState } from "react";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

function Reports() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <div className="p-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Reports</h2>
            <p className="mt-2 text-sm text-slate-600">
              Reports module is ready for role-based analytics and exports.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Reports;
