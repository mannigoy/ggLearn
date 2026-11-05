import AppShell from './components/layout/AppShell.jsx'
import { ROLES } from './constants/index.js'
import useNav from './hooks/useNav.js'
import useStore from './hooks/useStore.js'
import useUsers from './hooks/useUsers.js'
import AdminPage from './pages/admin/AdminPage.jsx'
import Overview from './pages/app/Overview.jsx'
import Auth from './pages/auth/Auth.jsx'
import ChangePassword from './pages/auth/ChangePassword.jsx'
import Site from './pages/public/Site.jsx'

const SECTIONS = { home: 'Overview', admin: 'Users', password: 'Account' }

export default function App() {
  const { user, authLoading, login, register, logout } = useStore()
  const { view, pub, go, goPub, openAuth, resetPublic } = useNav()
  const isAdmin = user?.role === ROLES.ADMIN
  const { users, error: usersError } = useUsers(isAdmin)
  const pendingCount = users?.filter((u) => u.role === ROLES.PENDING_TEACHER).length ?? 0

  const handleLogout = async () => {
    await logout()
    resetPublic()
    go({ name: 'home' })
  }

  if (authLoading) {
    return <p className="auth-page" role="status">Opening your notebook…</p>
  }

  if (user) {
    // Fall back to the overview if the current view isn't allowed for this role.
    const page = view.name === 'admin' && !isAdmin ? 'home' : view.name
    return (
      <AppShell
        user={user}
        section={SECTIONS[page] ?? SECTIONS.home}
        view={{ ...view, name: page }}
        go={go}
        pendingCount={pendingCount}
        onLogout={handleLogout}
      >
        {page === 'admin' && <AdminPage user={user} users={users} loadError={usersError} />}
        {page === 'password' && <ChangePassword />}
        {page !== 'admin' && page !== 'password' && <Overview user={user} pendingCount={pendingCount} go={go} />}
      </AppShell>
    )
  }

  if (pub.page === 'auth') {
    return (
      <Auth
        initialTab={pub.tab}
        onBack={() => goPub(pub.from)}
        onLogin={login}
        onRegister={register}
      />
    )
  }

  return <Site page={pub.page} go={goPub} onAuth={openAuth} />
}
