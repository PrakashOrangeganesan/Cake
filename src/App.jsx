import { useEffect, useState } from 'react'
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from '@mui/material'
import {
  Assessment,
  Cake,
  Logout,
  Menu,
  ReceiptLong,
  Dashboard as DashboardIcon
} from '@mui/icons-material'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import DashboardPage from './pages/Dashboard'
import Orders from './pages/Orders'
import SalesBills from './pages/SalesBills'
import SalesReport from './pages/SalesReport'

const drawerWidth = 240

function CakeLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <rect x="16" y="62" width="64" height="8" rx="4" fill="#C97B72" />
      <rect x="24" y="42" width="48" height="22" rx="6" fill="#7A4A30" />
      <rect x="22" y="36" width="52" height="10" rx="5" fill="#F5E8E6" />
      <ellipse cx="36" cy="44" rx="3" ry="5" fill="#F5E8E6" />
      <ellipse cx="50" cy="46" rx="3" ry="6" fill="#F5E8E6" />
      <ellipse cx="64" cy="44" rx="3" ry="5" fill="#F5E8E6" />
      <rect x="45" y="22" width="6" height="16" rx="3" fill="#C97B72" />
      <ellipse cx="48" cy="20" rx="3" ry="4" fill="#FFCD84" />
    </svg>
  )
}

function ProtectedLayout({ session }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function logout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const menu = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { text: 'Cake Orders', path: '/orders', icon: <Cake /> },
    { text: 'Sales Bills', path: '/sales-bills', icon: <ReceiptLong /> },
    { text: 'Sales Report', path: '/reports', icon: <Assessment /> }
  ]

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #3d1f0e 0%, #4f2a14 100%)', color: '#fff' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 3, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2.5, background: 'rgba(245, 232, 230, 0.12)', display: 'grid', placeItems: 'center' }}>
          <CakeLogo size={22} />
        </Box>
        <Box>
          <Typography variant="caption" sx={{ display: 'block', letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
            SaranyaRajasekaran
          </Typography>
          <Typography variant="subtitle1" sx={{ lineHeight: 1.1, fontWeight: 700, color: '#f5e8e6' }}>
            Cake
          </Typography>
        </Box>
      </Box>

      <List sx={{ px: 1.5, py: 2 }}>
        {menu.map(item => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.75,
              color: location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.7)',
              background: location.pathname === item.path ? 'rgba(255,255,255,0.12)' : 'transparent',
              '&.Mui-selected': {
                background: 'rgba(255,255,255,0.12)',
                color: '#fff'
              },
              '&:hover': {
                background: 'rgba(255,255,255,0.07)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: 'auto', px: 1.5, pb: 3 }}>
        <Button
          fullWidth
          onClick={logout}
          startIcon={<Logout />}
          sx={{
            justifyContent: 'flex-start',
            color: 'rgba(255,255,255,0.7)',
            borderRadius: 2,
            py: 1.1,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { background: 'rgba(255,255,255,0.07)', color: '#fff' }
          }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box className="cake-shell" sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--cream)' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'rgba(250,247,242,0.9)',
          color: 'var(--ink)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 1px 12px rgba(61,31,14,0.08)',
          borderBottom: '1px solid var(--cake-border)'
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 72 }, px: { xs: 2, sm: 3 } }}>
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ display: { sm: 'none' }, mr: 1.5, color: 'var(--choco)' }}
            aria-label="Open menu"
          >
            <Menu />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexGrow: 1 }}>
            <Box sx={{ display: { xs: 'flex', sm: 'none' }, width: 34, height: 34, borderRadius: 2, background: 'linear-gradient(135deg, #3d1f0e 0%, #7a4a30 100%)', placeItems: 'center' }}>
              <CakeLogo size={18} />
            </Box>
            <Typography sx={{ fontWeight: 700, color: 'var(--ink)', fontSize: { xs: '1rem', sm: '1.05rem' } }}>
              SaranyaRajasekaran Homemade Cakes
            </Typography>
          </Box>

          <Button
            startIcon={<Logout />}
            onClick={logout}
            sx={{
              color: 'var(--choco)',
              borderRadius: 999,
              px: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              display: { xs: 'none', sm: 'inline-flex' },
              '&:hover': { background: 'rgba(61,31,14,0.06)' }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: 'block', sm: 'none' } }}
          PaperProps={{ sx: { width: drawerWidth, border: 'none' } }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid rgba(61,31,14,0.12)',
              background: 'transparent'
            }
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, pt: { xs: 8, sm: 9 }, minWidth: 0 }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/sales-bills" element={<SalesBills />} />
          <Route path="/reports" element={<SalesReport />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>

      <Box
        component="nav"
        className="mobile-nav"
        aria-label="Primary navigation"
      >
        {menu.map(item => (
          <Box
            key={item.path}
            component={NavLink}
            to={item.path}
            className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            {item.icon}
            <Typography component="span">{
              item.text === 'Cake Orders' ? 'Orders' :
              item.text === 'Sales Bills' ? 'Bills' :
              item.text === 'Sales Report' ? 'Report' :
              item.text
            }</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'var(--cream)' }}>
        <CircularProgress sx={{ color: 'var(--choco-muted)' }} />
      </Box>
    )
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return <ProtectedLayout session={session} />
}
