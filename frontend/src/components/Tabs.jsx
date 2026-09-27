// A simple pill-style tab bar. Used to group several related screens
// (e.g. Sell / Add Stock / Services) under one nav item instead of
// giving each its own place in the main navigation.
export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs-bar">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={active === tab.key ? 'tab active' : 'tab'}
          onClick={() => onChange(tab.key)}
        >
          <span>{tab.icon}</span> {tab.label}
        </button>
      ))}
    </div>
  );
}
