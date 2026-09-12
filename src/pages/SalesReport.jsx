import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import { Search } from '@mui/icons-material'
import { supabase } from '../lib/supabase'

const firstOfMonth = () => {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}
const today = () => new Date().toISOString().slice(0, 10)

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    background: '#fff',
    '& fieldset': { borderColor: '#e8ddd3' },
    '&:hover fieldset': { borderColor: '#d4948b' },
    '&.Mui-focused fieldset': { borderColor: '#7a4a30' }
  }
}

export default function SalesReport() {
  const [from, setFrom] = useState(firstOfMonth())
  const [to, setTo] = useState(today())
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  async function search() {
    setError('')
    if (!from || !to || from > to) {
      setError('Please select a valid From Date and To Date.')
      return
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        order_id, order_no, cake_name, customer_name, mobile_number,
        order_date, delivery_date, price, status,
        sales_bills (
          bill_no, actual_delivery_date, actual_price, cake_image_path
        )
      `)
      .gte('order_date', from)
      .lte('order_date', to)
      .order('order_date', { ascending: false })

    if (error) setError(error.message)
    else setRows(data || [])
  }

  const totalOrder = rows.reduce((s, x) => s + Number(x.price || 0), 0)
  const totalActual = rows.reduce((s, x) => s + Number(getBill(x)?.actual_price || 0), 0)
  const delivered = rows.filter(x => x.status === 'Delivered').length
  const pending = rows.filter(x => x.status === 'Pending').length

  return (
    <Box className="cake-page">
      <Box mb={3}>
        <Typography className="cake-title" variant="h4" sx={{ fontWeight: 700, color: 'var(--ink)' }}>
          Combined Sales Report
        </Typography>
        <Typography sx={{ color: 'var(--warm-gray)' }}>
          Order and sales information combined by order date.
        </Typography>
      </Box>

      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid var(--cake-border)', boxShadow: '0 12px 24px rgba(61,31,14,0.04)' }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField label="From Date" type="date" value={from} onChange={e => setFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={inputStyle} />
          <TextField label="To Date" type="date" value={to} onChange={e => setTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={inputStyle} />
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={search}
            sx={{
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #3d1f0e 0%, #7a4a30 100%)',
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 'none',
              px: 2,
              py: 1.1,
              '&:hover': { background: 'linear-gradient(135deg, #4f2a14 0%, #7a4a30 100%)' }
            }}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={4} lg={2.3}>
          <Paper sx={{ p: 2.25, borderRadius: 3, border: '1px solid var(--cake-border)', background: '#fff' }}>
            <Typography sx={{ color: 'var(--warm-gray)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>Orders</Typography>
            <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)', mt: 1 }}>{rows.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.3}>
          <Paper sx={{ p: 2.25, borderRadius: 3, border: '1px solid var(--cake-border)', background: '#fff' }}>
            <Typography sx={{ color: 'var(--warm-gray)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>Delivered</Typography>
            <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)', mt: 1 }}>{delivered}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.3}>
          <Paper sx={{ p: 2.25, borderRadius: 3, border: '1px solid var(--cake-border)', background: '#fff' }}>
            <Typography sx={{ color: 'var(--warm-gray)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>Pending</Typography>
            <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)', mt: 1 }}>{pending}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.8}>
          <Paper sx={{ p: 2.25, borderRadius: 3, border: '1px solid var(--cake-border)', background: '#fff' }}>
            <Typography sx={{ color: 'var(--warm-gray)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>Order Value</Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', mt: 1 }}>₹ {totalOrder.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.8}>
          <Paper sx={{ p: 2.25, borderRadius: 3, border: '1px solid var(--cake-border)', background: 'linear-gradient(135deg, #c97b72 0%, #d4948b 100%)', color: '#fff' }}>
            <Typography sx={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.8)' }}>Actual Sale Value</Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, mt: 1 }}>₹ {totalActual.toFixed(2)}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ overflow: 'auto', borderRadius: 3, border: '1px solid var(--cake-border)', boxShadow: '0 12px 24px rgba(61,31,14,0.04)' }}>
        <Box className="mobile-records">
          {rows.map(x => {
            const bill = getBill(x)
            return <Box className="mobile-record" key={x.order_id}>
              <Box className="mobile-record-topline"><Box><Typography className="mobile-record-eyebrow">{x.order_no}</Typography><Typography className="mobile-record-title">{x.cake_name}</Typography></Box><StatusPill status={x.status} /></Box>
              <Typography className="mobile-record-customer">{x.customer_name} <span>·</span> {x.mobile_number}</Typography>
              <Box className="mobile-record-grid mobile-report-grid">
                <RecordField label="Ordered" value={x.order_date} />
                <RecordField label="Planned delivery" value={x.delivery_date} />
                <RecordField label="Actual delivery" value={bill?.actual_delivery_date || '—'} />
                <RecordField label="Order value" value={`₹ ${Number(x.price || 0).toFixed(2)}`} />
                <RecordField label="Actual sale" value={bill ? `₹ ${Number(bill.actual_price || 0).toFixed(2)}` : '—'} />
              </Box>
            </Box>
          })}
          {!rows.length && <Box className="mobile-empty">Run a search to view the report.</Box>}
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: '#faf5f0' }}>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Order No</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Cake</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Order Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Planned Delivery</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Order Price</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Actual Delivery</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Actual Sale Value</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(x => {
              const bill = getBill(x)
              return (
                <TableRow key={x.order_id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell>{x.order_no}</TableCell>
                  <TableCell>{x.customer_name}</TableCell>
                  <TableCell>{x.mobile_number}</TableCell>
                  <TableCell>{x.cake_name}</TableCell>
                  <TableCell>{x.order_date}</TableCell>
                  <TableCell>{x.delivery_date}</TableCell>
                  <TableCell>₹ {Number(x.price).toFixed(2)}</TableCell>
                  <TableCell>{bill?.actual_delivery_date || '—'}</TableCell>
                  <TableCell>{bill ? `₹ ${Number(bill.actual_price).toFixed(2)}` : '—'}</TableCell>
                  <TableCell>
                    <Box component="span" sx={{ display: 'inline-flex', px: 1.2, py: 0.5, borderRadius: 999, fontSize: 10, fontWeight: 800, background: x.status === 'Delivered' ? '#ecfdf5' : x.status === 'Pending' ? '#fff7ed' : '#fef2f2', color: x.status === 'Delivered' ? '#166534' : x.status === 'Pending' ? '#9a5b00' : '#991b1b' }}>
                      {x.status}
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
            {!rows.length && <TableRow><TableCell colSpan={10} align="center" sx={{ py: 4, color: 'var(--warm-gray)' }}>Run a search to view the report.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}

function RecordField({ label, value }) {
  return <Box><Typography className="mobile-record-label">{label}</Typography><Typography className="mobile-record-value">{value}</Typography></Box>
}

function getBill(row) {
  return Array.isArray(row.sales_bills) ? row.sales_bills[0] : row.sales_bills
}

function StatusPill({ status }) {
  return <Box className={`mobile-status ${status === 'Delivered' ? 'is-delivered' : status === 'Pending' ? 'is-pending' : 'is-cancelled'}`}>{status}</Box>
}
