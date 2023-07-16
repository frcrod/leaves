interface StatProps {
  title?: string;
  value?: number;
  sub?: string;
}

export default function Stat({ title, value, sub }: StatProps) {
  return (
    <div className="stats shadow">
      <div className="stat text-center">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        {sub?.length ? (
          <>
            <div className="stat-desc">{sub}</div>
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
