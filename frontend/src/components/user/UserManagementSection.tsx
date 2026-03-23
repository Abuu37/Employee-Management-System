import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserTable from "./UserTable";
import AddUserModal from "./AddUserModal";
import ViewUserModal from "./ViewUserModal";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";
import type { AddUserFormValues } from "./AddUserModal";
import type { EditUserFormValues } from "./EditUserModal";
import type { Feedback, User, UserRole } from "./types";

const API_BASE_URL = "http://localhost:5000/api/user";

interface UserManagementSectionProps {
  title: string;
  filterRole?: UserRole;
  emptyMessage: string;
  roleOptions?: UserRole[];
  searchTerm?: string;
}

type RawUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

function normalizeUsers(usersData: unknown): User[] {
  const users = Array.isArray(usersData)
    ? (usersData as RawUser[])
    : usersData
      ? ([usersData] as RawUser[])
      : [];

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: "Active",
  }));
}

function UserManagementSection({
  title,
  filterRole,
  emptyMessage,
  roleOptions = [],
  searchTerm = "",
}: UserManagementSectionProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {

    // Fetch users from the API and handle authentication errors
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No auth token found. Please login again.");
          navigate("/login");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/view-users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const normalizedUsers = normalizeUsers(response.data);
        const filteredUsers = filterRole
          ? normalizedUsers.filter((user) => user.role === filterRole)
          : normalizedUsers;

        setUsers(filteredUsers);
        setError("");
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const statusCode = err.response?.status;

          if (statusCode === 401 || statusCode === 400) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }

          setError(err.response?.data?.message || "Failed to fetch users");
        } else {
          setError("Failed to fetch users");
        }
      }
    };

    fetchUsers();
  }, [filterRole, navigate]);

  // Modal control functions

  const closeAllModals = () => {
    setAddOpen(false);
    setViewOpen(false);
    setEditOpen(false);
    setDeleteOpen(false);
    setActiveUser(null);
  };

  const closeAddModal = () => {
    setAddOpen(false);
  };

  const handleOpenView = (user: User) => {
    setActiveUser(user);
    setViewOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setActiveUser(user);
    setEditOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setActiveUser(user);
    setDeleteOpen(true);
  };

  const handleAddUser = () => {
    setAddOpen(true);
  };


  // Action handlers for create, update, delete operations
  const handleCreateUser = async (formValues: AddUserFormValues) => {
    try {
      setIsCreating(true);
      setFeedback(null);

      const token = localStorage.getItem("token");

      await axios.post(`${API_BASE_URL}/create-user`, formValues, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await axios.get(`${API_BASE_URL}/view-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const normalizedUsers = normalizeUsers(response.data);
      const filteredUsers = filterRole
        ? normalizedUsers.filter((user) => user.role === filterRole)
        : normalizedUsers;

      setUsers(filteredUsers);
      setFeedback({
        type: "success",
        message: `${formValues.name} created successfully. Credentials were sent by email.`,
      });
      closeAddModal();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFeedback({
          type: "error",
          message: err.response?.data?.message || "Failed to create user.",
        });
      } else {
        setFeedback({ type: "error", message: "Failed to create user." });
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Handler for updating a user

  const handleSave = async (formValues: EditUserFormValues) => {
    if (!activeUser) {
      return;
    }

    try {
      setIsSaving(true);
      setFeedback(null);

      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE_URL}/update-user/${activeUser.id}`,
        formValues,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUsers((currentUsers) => {
        const nextUsers = currentUsers.map((user) =>
          user.id === activeUser.id ? { ...user, ...formValues } : user,
        );

        return filterRole
          ? nextUsers.filter((user) => user.role === filterRole)
          : nextUsers;
      });

      setFeedback({
        type: "success",
        message: `${formValues.name} updated successfully.`,
      });
      closeAllModals();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFeedback({
          type: "error",
          message: err.response?.data?.message || "Failed to update user.",
        });
      } else {
        setFeedback({ type: "error", message: "Failed to update user." });
      }
    } finally {
      setIsSaving(false);
    }
  };


  // Handler for deleting a user

  const handleDelete = async () => {
    if (!activeUser) {
      return;
    }

    try {
      setIsDeleting(true);
      setFeedback(null);

      const token = localStorage.getItem("token");

      await axios.delete(`${API_BASE_URL}/delete-user/${activeUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== activeUser.id),
      );
      setFeedback({
        type: "success",
        message: `${activeUser.name} deleted successfully.`,
      });
      closeAllModals();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFeedback({
          type: "error",
          message: err.response?.data?.message || "Failed to delete user.",
        });
      } else {
        setFeedback({ type: "error", message: "Failed to delete user." });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter users based on search term
  const displayedUser = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      {error ? (
        <p className="mb-4 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {feedback ? (
        <p
          className={`mb-4 rounded-2xl px-5 py-4 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <UserTable
        title={title}
        users={displayedUser}
        emptyMessage={emptyMessage}
        onAdd={handleAddUser}
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <AddUserModal
        key={addOpen ? "add-user-open" : "add-user-closed"}
        isOpen={addOpen}
        onClose={closeAddModal}
        onSave={handleCreateUser}
        roleOptions={
          roleOptions.length > 0
            ? roleOptions
            : ["employee", "manager", "admin"]
        }
        isSaving={isCreating}
      />
      <ViewUserModal
        isOpen={viewOpen}
        onClose={closeAllModals}
        user={activeUser}
      />
      <EditUserModal
        key={activeUser?.id}
        isOpen={editOpen}
        onClose={closeAllModals}
        onSave={handleSave}
        user={activeUser}
        roleOptions={
          roleOptions.length > 0
            ? roleOptions
            : ["employee", "manager", "admin"]
        }
        isSaving={isSaving}
      />
      <DeleteUserModal
        isOpen={deleteOpen}
        onClose={closeAllModals}
        onConfirm={handleDelete}
        user={activeUser}
        isDeleting={isDeleting}
      />
    </>
  );
}

export default UserManagementSection;
