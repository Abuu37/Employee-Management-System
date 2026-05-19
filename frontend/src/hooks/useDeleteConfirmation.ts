import { useState } from "react";

type DeleteConfirmationOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
};

type DeleteDialogState = DeleteConfirmationOptions | null;

export default function useDeleteConfirmation() {
  const [dialog, setDialog] = useState<DeleteDialogState>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const requestDelete = (options: DeleteConfirmationOptions) => {
    setDialog(options);
  };

  const closeDialog = () => {
    if (isProcessing) return;
    setDialog(null);
  };

  const confirmDelete = async () => {
    if (!dialog || isProcessing) return;

    try {
      setIsProcessing(true);
      await dialog.onConfirm();
      setDialog(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isOpen: Boolean(dialog),
    dialog,
    isProcessing,
    requestDelete,
    closeDialog,
    confirmDelete,
  };
}
