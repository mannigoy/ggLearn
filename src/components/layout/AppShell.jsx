import AppHeader from './AppHeader.jsx';
import Sidebar from './Sidebar.jsx';

export default function AppShell({ user, section, view, go, pendingCount, onNewLesson, onLogout, children }) {
  return (
    <div className="app-shell">
      <a className="skip" href="#main">Skip to main content</a>
      <AppHeader user={user} section={section} onNewLesson={onNewLesson} onLogout={onLogout} />
      <div className="app-body">
        <Sidebar user={user} view={view} go={go} pendingCount={pendingCount} />
        <main id="main" className="wrap">{children}</main>
      </div>
    </div>
  );
}
