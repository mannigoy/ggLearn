import { useEffect } from 'react'
import AppShell from './components/layout/AppShell.jsx'
import { ROLES } from './constants/index.js'
import useNav from './hooks/useNav.js'
import useStore from './hooks/useStore.js'
import useUsers from './hooks/useUsers.js'
import AdminPage from './pages/admin/AdminPage.jsx'
import ComingSoon from './pages/app/ComingSoon.jsx'
import CoursesPage from './pages/courses/CoursesPage.jsx'
import Overview from './pages/app/Overview.jsx'
import Auth from './pages/auth/Auth.jsx'
import ChangePassword from './pages/auth/ChangePassword.jsx'
import Site from './pages/public/Site.jsx'
import { setUnauthorizedHandler } from './services/api.js'

const SECTIONS = { home: 'Overview', courses: 'Courses', course: 'Courses', lesson: 'Courses', quiz: 'Courses', badges: 'Badges', admin: 'Users', password: 'Account' }

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

  // A 401 from the API means the session is no longer valid: sign out.
  useEffect(() => {
    setUnauthorizedHandler(() => { handleLogout().catch(() => {}) })
    return () => setUnauthorizedHandler(null)
  })

  if (authLoading) {
    return <p className="auth-page" role="status">Opening your notebook…</p>
  }

  if (user) {
    // Fall back to the overview if the current view isn't allowed for this role.
    const page = (view.name === 'admin' && !isAdmin) || (view.name === 'badges' && user.role !== ROLES.STUDENT)
      ? 'home'
      : view.name
    const back = () => go({ name: 'courses' })
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
        {page === 'courses' && <CoursesPage user={user} go={go} />}
        {page === 'course' && <ComingSoon title="Course" onBack={back} />}
        {page === 'lesson' && <ComingSoon title="Lesson" onBack={back} />}
        {page === 'quiz' && <ComingSoon title="Quiz" onBack={back} />}
        {page === 'badges' && <ComingSoon title="Badges" onBack={() => go({ name: 'home' })} />}
        {page === 'home' && <Overview user={user} pendingCount={pendingCount} go={go} />}
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
