import {
  FiArrowUp,
  FiArrowDown,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";

interface SortArrowProps {
  column: string;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
}

/**
 * Visual sort indicator for table column headers.
 *
 * Usage:
 *   <th onClick={() => handleSort("name")}>
 *     Name <SortArrow column="name" sortBy={sortBy} sortOrder={sortOrder} />
 *   </th>
 */
export default function SortArrow({
  column,
  sortBy,
  sortOrder,
}: SortArrowProps) {
  const active = sortBy === column;

  if (!active) {
    return (
      <span
        className="ml-1 inline-flex flex-col items-center opacity-40"
        style={{ verticalAlign: "middle", gap: 0 }}
      >
        <FiChevronUp className="h-2.5 w-2.5 -mb-0.5" />
        <FiChevronDown className="h-2.5 w-2.5" />
      </span>
    );
  }

  return sortOrder === "ASC" ? (
    <FiArrowUp className="ml-1 inline h-3 w-3 text-blue-500" />
  ) : (
    <FiArrowDown className="ml-1 inline h-3 w-3 text-blue-500" />
  );
}
