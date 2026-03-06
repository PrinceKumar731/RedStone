function StatsCard({ label, value }) {
  return (
    <article className="stats-card card">
      <p className="stats-label">{label}</p>
      <h3 className="stats-value">{value}</h3>
    </article>
  );
}

export default StatsCard;
