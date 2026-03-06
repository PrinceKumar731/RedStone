import redstoneIcon from '../../assets/Redstone_Dust_JE2_BE2.webp';

function LoadingScreen({ progress }) {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <section className="boot-screen" aria-label="Loading RedStone">
      <div className="boot-center">
        <img src={redstoneIcon} alt="RedStone logo" className="boot-logo" />
        <h1 className="boot-title">RedStone</h1>
        <p className="boot-subtitle">Initializing world engine...</p>

        <div className="boot-progress-wrap" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeProgress}>
          <div className="boot-progress-track">
            <div className="boot-progress-aura" style={{ width: `${safeProgress}%` }} />
          </div>
          <p className="boot-progress-text">{safeProgress}%</p>
        </div>
      </div>
    </section>
  );
}

export default LoadingScreen;
