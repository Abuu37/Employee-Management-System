import { useState } from "react";

interface useEditorProps {
    initialValue: string;
}

export default function useEditor(
    {
    initialValue = "",
}: useEditorProps = {}) {
    const [content, setContent] = useState(initialValue);

    const clearEditor = () => {
        setContent("");

    };

    const isEmpty = content.trim() === "";

    return {
        content,
        setContent,
        clearEditor,
        isEmpty,
    };

}
    