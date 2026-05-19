import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { editorFormats, fullToolbar, simpleToolbar } from "./editorConfig";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: string;
  simple?: boolean;
  readOnly?: boolean; // New prop to control read-only mode
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  height = "200px",
  simple = false,
  readOnly = false, // New prop to control read-only mode
}: RichTextEditorProps) {
  const modules = readOnly
    ? { toolbar: false }
    : simple
      ? simpleToolbar
      : fullToolbar;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={editorFormats}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          height,
          marginBottom: readOnly ? "0" : "50px",
        }}
      />
    </div>
  );
}
