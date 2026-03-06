import redstoneIcon from '../assets/Redstone_Dust_JE2_BE2.webp';

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'servers', label: 'Servers' },
  { key: 'createServer', label: 'Create World' }
];

function Sidebar({ activePage, onNavigate, hasRunningServer }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <img
          src={redstoneIcon}
          alt="RedStone icon"
          className={`brand-icon ${hasRunningServer ? 'online' : ''}`}
        />
        <div>
          <h1 className="brand-title">RedStone</h1>
          <p className="brand-subtitle">Server Manager</p>
        </div>
      </div>

      <nav className="nav-list">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`nav-item ${activePage === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
