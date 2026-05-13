import { useTranslation } from "react-i18next";
import Header from "@/layouts/Header";
import Sidebar from "@/layouts/Sidebar";
import TaskTable from "@/features/tasks/components/TaskTable";
import CommentModal from "@/features/tasks/components/CommentModal";
import TaskCommentPage from "@/features/tasks/pages/TaskCommentPage";
import { useTasksPage } from "@/features/tasks/hooks/useTasksPage";

function Tasks() {
  const { t } = useTranslation();
  const {
    displayedTasks,
    loading,
    error,
    updatingId,
    searchTerm,
    setSearchTerm,
    selectedTask,
    detailsOpen,
    updateTaskStatus,
    handleOpenComments,
    handleCloseComments,
  } = useTasksPage();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <div className="p-6">
          {error ? (
            <p className="mb-4 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <TaskTable
            title={t("tasks.myAssignedTasks")}
            tasks={displayedTasks}
            loading={loading}
            updatingId={updatingId}
            emptyMessage={t("tasks.noAssignedTasks")}
            onStatusChange={updateTaskStatus}
            onViewTask={handleOpenComments}
          />

          {selectedTask && (
            <CommentModal isOpen={detailsOpen} onClose={handleCloseComments}>
              <TaskCommentPage modalMode taskId={selectedTask.id} />
            </CommentModal>
          )}
        </div>
      </main>
    </div>
  );
}

export default Tasks;
