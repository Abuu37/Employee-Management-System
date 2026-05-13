import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import type {
  AddUserFormValues,
  EditUserFormValues,
  User,
  UserRole,
} from "@/features/users/types/user.types";

interface BaseProps {
  isOpen: boolean;
  onClose: () => void;
  roleOptions: UserRole[];
  isSaving: boolean;
}

interface AddProps extends BaseProps {
  mode: "add";
  onSave: (values: AddUserFormValues) => Promise<void>;
  user?: undefined;
}

interface EditProps extends BaseProps {
  mode: "edit";
  onSave: (values: EditUserFormValues) => Promise<void>;
  user: User | null;
}

type UserFormProps = AddProps | EditProps;

export default function UserForm(props: UserFormProps) {
  if (props.mode === "edit") {
    return (
      <EditUserModal
        isOpen={props.isOpen}
        onClose={props.onClose}
        onSave={props.onSave}
        user={props.user}
        roleOptions={props.roleOptions}
        isSaving={props.isSaving}
      />
    );
  }

  return (
    <AddUserModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      onSave={props.onSave}
      roleOptions={props.roleOptions}
      isSaving={props.isSaving}
    />
  );
}
