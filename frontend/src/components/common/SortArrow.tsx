import { FiArrowUp, FiArrowDown } from "react-icons/fi";

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
    return <FiArrowUp className="ml-1 inline h-3 w-3 opacity-25" />;
  }

  return sortOrder === "ASC" ? (
    <FiArrowUp className="ml-1 inline h-3 w-3 text-blue-500" />
  ) : (
    <FiArrowDown className="ml-1 inline h-3 w-3 text-blue-500" />
  );
}
