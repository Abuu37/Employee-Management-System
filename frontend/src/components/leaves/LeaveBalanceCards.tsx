import React from "react";

interface LeaveBalanceCardsProps {
  annual?: number;
  sick?: number;
  casual?: number;
  // Optionally, you can pass total values if needed for future dynamic use
  annualTotal?: number;
  sickTotal?: number;
  casualTotal?: number;
}

const Card = ({
  label,
  remaining,
  total,
  color,
}: {
  label: string;
  remaining: number;
  total: number;
  color: string;
}) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 2px 12px rgba(80, 112, 255, 0.07)",
      padding: 24,
      minWidth: 260,
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      marginRight: 24,
      border: `1.5px solid ${color}22`,
    }}
  >
    <div style={{ fontWeight: 700, fontSize: 18, color }}>{label} Leave</div>
    <div style={{ fontSize: 15, margin: "12px 0 6px 0", color: "#555" }}>
      Remaining:
      <span style={{ fontWeight: 600, color: "#222", marginLeft: 8 }}>
        {remaining}
      </span>
    </div>
    <div style={{ fontSize: 14, color: "#888", marginBottom: 10 }}>
      Total: <span style={{ color: "#222" }}>{total} days</span>
    </div>
    <div
      style={{
        width: "100%",
        background: "#f1f3fa",
        borderRadius: 6,
        height: 10,
      }}
    >
      <div
        style={{
          width: `${(remaining / total) * 100}%`,
          background: color,
          height: "100%",
          borderRadius: 6,
          transition: "width 0.5s cubic-bezier(.4,2,.6,1)",
        }}
      />
    </div>
  </div>
);

const LeaveBalanceCards: React.FC<LeaveBalanceCardsProps> = ({
  annual = 20,
  sick = 10,
  casual = 5,
  annualTotal = 20,
  sickTotal = 10,
  casualTotal = 5,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        marginBottom: 36,
        marginTop: 8,
        justifyContent: "flex-start",
        flexWrap: "wrap",
      }}
    >
      <Card
        label="Annual"
        remaining={annual}
        total={annualTotal}
        color="#4f8cff"
      />
      <Card label="Sick" remaining={sick} total={sickTotal} color="#00b894" />
      <Card
        label="Casual"
        remaining={casual}
        total={casualTotal}
        color="#fdcb6e"
      />
    </div>
  );
};

export default LeaveBalanceCards;
