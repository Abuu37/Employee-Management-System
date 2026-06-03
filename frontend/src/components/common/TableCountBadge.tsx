import CountUp from "react-countup";
import { TABLE_COUNT_BADGE_CLASS } from "@/hooks/useTableCountBadge";

type TableCountBadgeProps = {
  count: number;
  visible?: boolean;
};

export default function TableCountBadge({
  count,
  visible = true,
}: TableCountBadgeProps) {
  if (!visible) return null;

  return (
    <span className={TABLE_COUNT_BADGE_CLASS}>
      <span className="text-[11px] font-bold leading-none text-blue-600">
        +
      </span>
      <span>
        <CountUp 
        end={count} 
        duration={1.2} 
        separator="," 
        preserveValue 
        />
      </span>
    </span>
  );
}
