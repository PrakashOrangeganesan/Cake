import { useEffect, useState } from 'react'
import { Alert, Box, Card, CardContent, CircularProgress, Typography } from '@mui/material'
import { AccessTime, ArrowUpward, CheckCircle, Inventory, MoreHoriz, TrendingUp } from '@mui/icons-material'
import { supabase } from '../lib/supabase'

function StatCard({ title, value, icon, accent }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid var(--cake-border)',
        background: accent === 'primary' ? 'linear-gradient(135deg, #c97b72 0%, #d4948b 100%)' : '#fff',
        boxShadow: '0 10px 22px rgba(61,31,14,0.05)',
        minHeight: 136,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              background: accent === 'primary' ? 'rgba(255,255,255,0.14)' : 'var(--surface)',
              color: accent === 'primary' ? '#fff' : 'var(--choco-muted)'
            }}
          >
            {icon}
          </Box>
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: accent === 'primary' ? '1.9rem' : '1.7rem',
              lineHeight: 1,
              letterSpacing: '-0.05em',
              fontWeight: 800,
              color: accent === 'primary' ? '#fff' : 'var(--ink)',
              mb: 0.5
            }}
          >
            {value}
          </Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: accent === 'primary' ? 'rgba(255,255,255,0.8)' : 'var(--warm-gray)' }}>
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ orders: 0, pending: 0, delivered: 0, sales: 0 })
  const [chartData, setChartData] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data: orders, error: oe } = await supabase.from('orders').select('order_id,order_no,status,order_date,customer_name,cake_name,price')
    const { data: bills, error: be } = await supabase.from('sales_bills').select('actual_price,actual_delivery_date')
    if (oe || be) {
      setError((oe || be).message)
    } else {
      setStats({
        orders: orders.length,
        pending: orders.filter(x => x.status === 'Pending').length,
        delivered: orders.filter(x => x.status === 'Delivered').length,
        sales: bills.reduce((sum, x) => sum + Number(x.actual_price || 0), 0)
      })
      setRecentOrders((orders || []).slice(0, 4))
      setChartData(buildChartData(bills || []))
    }
    setLoading(false)
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const completion = stats.orders ? Math.round((stats.delivered / stats.orders) * 100) : 0

  if (loading) {
    return (
      <Box className="cake-page" sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: 'var(--choco-muted)' }} />
      </Box>
    )
  }

  return (
    <Box className="cake-page dashboard-page">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
        <Box className="cake-banner dashboard-banner" sx={{ position: 'relative', color: '#fff' }}>
          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            <Box>
          <Typography variant="caption" sx={{ position: 'relative', zIndex: 1, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.8, textTransform: 'uppercase' }}>
            {today}
          </Typography>
          <Typography className="cake-title" variant="h3" sx={{ position: 'relative', zIndex: 1, fontWeight: 700, my: 1.2, fontSize: { xs: '2rem', sm: '3rem' } }}>
            {greeting}
          </Typography>
          <Typography sx={{ position: 'relative', zIndex: 1, color: 'rgba(255,255,255,0.8)', maxWidth: 520 }}>
            Here is your cake business snapshot for the day.
          </Typography>
            </Box>
            <Box className="dashboard-banner-mark"><CakeMark /></Box>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        <Box className="dashboard-stats">
          <StatCard title="Total Orders" value={stats.orders} icon={<Inventory />} />
          <StatCard title="Pending" value={stats.pending} icon={<AccessTime />} />
          <StatCard title="Delivered" value={stats.delivered} icon={<CheckCircle />} />
          <StatCard title="Actual Sales" value={`₹ ${stats.sales.toFixed(0)}`} icon={<TrendingUp />} accent="primary" />
        </Box>

        <Box className="dashboard-grid">
          <Card className="dashboard-chart-card">
            <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
              <Box className="section-heading">
                <Box><Typography className="section-kicker">Revenue overview</Typography><Typography className="section-title">Sales performance</Typography></Box>
                <Box className="trend-badge"><ArrowUpward fontSize="small" /> Live</Box>
              </Box>
              <Box className="bar-chart" aria-label="Revenue for the last six months">
                {chartData.map(item => <Box className="bar-column" key={item.label}><Typography className="bar-value">{item.value ? `₹${new Intl.NumberFormat('en-IN').format(Math.round(item.value))}` : ''}</Typography><Box className="bar-track"><Box className="bar-fill" sx={{ height: `${item.height}%` }} /></Box><Typography className="bar-label">{item.label}</Typography></Box>)}
              </Box>
            </CardContent>
          </Card>

          <Card className="dashboard-chart-card status-card">
            <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
              <Typography className="section-kicker">Order health</Typography>
              <Typography className="section-title">Completion rate</Typography>
              <Box className="completion-wrap"><Box className="completion-ring" sx={{ background: `conic-gradient(var(--rose) ${completion}%, var(--rose-light) 0)` }}><Box><strong>{completion}%</strong><span>complete</span></Box></Box></Box>
              <Box className="status-legend"><span><i className="dot delivered-dot" /> Delivered <b>{stats.delivered}</b></span><span><i className="dot pending-dot" /> Pending <b>{stats.pending}</b></span></Box>
            </CardContent>
          </Card>
        </Box>

        <Card className="recent-card">
          <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
            <Box className="section-heading"><Box><Typography className="section-kicker">Latest activity</Typography><Typography className="section-title">Recent orders</Typography></Box><MoreHoriz sx={{ color: 'var(--warm-gray)' }} /></Box>
            <Box className="recent-list">
              {recentOrders.map(row => <Box className="recent-row" key={row.order_id}><Box className="recent-avatar">{row.customer_name?.charAt(0)?.toUpperCase() || '?'}</Box><Box className="recent-details"><strong>{row.customer_name}</strong><span>{row.cake_name} · {row.order_no}</span></Box><Box className="recent-meta"><strong>₹{Number(row.price || 0).toFixed(0)}</strong><span className={`status-text ${row.status === 'Delivered' ? 'is-delivered' : ''}`}>{row.status}</span></Box></Box>)}
              {!recentOrders.length && <Typography className="empty-state">No recent orders yet.</Typography>}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

function CakeMark() {
  return <Box sx={{ fontSize: { xs: '2.8rem', sm: '4rem' }, lineHeight: 1 }} aria-hidden="true">✦</Box>
}

function buildChartData(bills) {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth() - (5 - index))
    return { key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, label: date.toLocaleDateString('en-IN', { month: 'short' }), value: 0 }
  })
  bills.forEach(bill => {
    const month = months.find(item => item.key === String(bill.actual_delivery_date || '').slice(0, 7))
    if (month) month.value += Number(bill.actual_price || 0)
  })
  const max = Math.max(...months.map(item => item.value), 1)
  return months.map(item => ({ ...item, height: item.value ? Math.max(12, (item.value / max) * 100) : 5 }))
}
