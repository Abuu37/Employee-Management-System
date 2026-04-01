import react, { useState } from "react";

interface TaskCommentInputProps {
    onSend: (content: string) => void;
    disabled?: boolean;
}

const TaskCommentInput: React.FC<TaskCommentInputProps> = ({ onSend, disabled = false }) => {
    const [value, setValue] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onSend(value.trim());
            setValue("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-2"> 
            <input
                type="text"
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                placeholder="Type a message..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={disabled}
            />
            <button
                type="submit"
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:bg-slate-300"
                disabled={disabled }
            >
                Send
            </button>
        </form>
    );

};

export default TaskCommentInput;