import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import { Add, Delete, Edit } from '@mui/icons-material'
import { supabase } from '../lib/supabase'

const today = () => new Date().toISOString().slice(0, 10)

const empty = {
  cake_name: '',
  customer_name: '',
  mobile_number: '',
  order_date: today(),
  delivery_date: '',
  price: '',
  remarks: ''
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(empty)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data, error } = await supabase.from('orders').select('*').order('order_id', { ascending: false })
    if (error) setError(error.message)
    else setOrders(data)
  }

  function openNew() {
    setEditing(null)
    setForm(empty)
    setError('')
    setOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm({
      cake_name: row.cake_name,
      customer_name: row.customer_name,
      mobile_number: row.mobile_number,
      order_date: row.order_date,
      delivery_date: row.delivery_date,
      price: row.price,
      remarks: row.remarks || ''
    })
    setError('')
    setOpen(true)
  }

  async function save() {
    if (!form.cake_name || !form.customer_name || !form.mobile_number || !form.delivery_date || form.price === '') {
      setError('Please fill all required fields.')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      cake_name: form.cake_name.trim(),
      customer_name: form.customer_name.trim(),
      mobile_number: form.mobile_number.trim(),
      order_date: form.order_date,
      delivery_date: form.delivery_date,
      price: Number(form.price),
      remarks: form.remarks.trim()
    }

    const result = editing
      ? await supabase.from('orders').update(payload).eq('order_id', editing.order_id)
      : await supabase.from('orders').insert(payload)

    if (result.error) setError(result.error.message)
    else {
      setOpen(false)
      await load()
    }
    setSaving(false)
  }

  async function remove(row) {
    if (!window.confirm(`Delete ${row.order_no}?`)) return
    const { error } = await supabase.from('orders').delete().eq('order_id', row.order_id)
    if (error) setError(error.message)
    else load()
  }

  const filteredOrders = orders.filter(row => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return true
    return (row.customer_name || '').toLowerCase().includes(term)
  })

  return (
    <Box className="cake-page">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5} gap={2} flexWrap="wrap">
        <Box>
          <Typography className="cake-title" variant="h4" sx={{ fontWeight: 700, color: 'var(--ink)' }}>
            Cake Orders
          </Typography>
          <Typography sx={{ color: 'var(--warm-gray)' }}>
            Create and manage customer cake orders.
          </Typography>
        </Box>

        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search customer"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            sx={{
              ...inputStyle,
              minWidth: { xs: '100%', sm: 220 }
            }}
          />

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openNew}
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
            New Order
          </Button>
        </Box>
      </Box>

      {error && !open && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

      <Paper sx={{ overflow: 'auto', borderRadius: 3, border: '1px solid var(--cake-border)', boxShadow: '0 12px 24px rgba(61,31,14,0.04)' }}>
        <Box className="mobile-records">
          {filteredOrders.map(row => (
            <Box className="mobile-record" key={row.order_id}>
              <Box className="mobile-record-topline"><Box><Typography className="mobile-record-eyebrow">{row.order_no}</Typography><Typography className="mobile-record-title">{row.cake_name}</Typography></Box><StatusPill status={row.status} /></Box>
              <Typography className="mobile-record-customer">{row.customer_name} <span>·</span> {row.mobile_number}</Typography>
              <Box className="mobile-record-grid"><RecordField label="Order date" value={row.order_date} /><RecordField label="Delivery" value={row.delivery_date} /><RecordField label="Price" value={`₹ ${Number(row.price).toFixed(2)}`} /></Box>
              <Box className="mobile-record-actions"><Button startIcon={<Edit />} onClick={() => openEdit(row)}>Edit order</Button><IconButton aria-label="Delete order" color="error" onClick={() => remove(row)}><Delete /></IconButton></Box>
            </Box>
          ))}
          {!filteredOrders.length && <Box className="mobile-empty">No orders found.</Box>}
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: '#faf5f0' }}>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Order No</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Cake</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Order Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Delivery Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map(row => (
              <TableRow key={row.order_id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell>{row.order_no}</TableCell>
                <TableCell>{row.cake_name}</TableCell>
                <TableCell>{row.customer_name}</TableCell>
                <TableCell>{row.mobile_number}</TableCell>
                <TableCell>{row.order_date}</TableCell>
                <TableCell>{row.delivery_date}</TableCell>
                <TableCell>₹ {Number(row.price).toFixed(2)}</TableCell>
                <TableCell>
                  <Box component="span" sx={{ display: 'inline-flex', px: 1.25, py: 0.55, borderRadius: 999, fontSize: 10, fontWeight: 800, background: row.status === 'Delivered' ? '#ecfdf5' : row.status === 'Pending' ? '#fff7ed' : '#fef2f2', color: row.status === 'Delivered' ? '#166534' : row.status === 'Pending' ? '#9a5b00' : '#991b1b', border: '1px solid rgba(0,0,0,0.03)' }}>
                    {row.status}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(row)} sx={{ color: 'var(--choco-muted)' }}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => remove(row)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!filteredOrders.length && <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: 'var(--warm-gray)' }}>No orders found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800, color: 'var(--ink)', pb: 1 }}>{editing ? 'Edit Cake Order' : 'New Cake Order'}</DialogTitle>
        <DialogContent>
          <Box display="grid" gap={2} pt={1}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
            <TextField label="Cake Name" value={form.cake_name} onChange={e => setForm({ ...form, cake_name: e.target.value })} required sx={inputStyle} />
            <TextField label="Customer Name" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} required sx={inputStyle} />
            <TextField label="Mobile Number" value={form.mobile_number} onChange={e => setForm({ ...form, mobile_number: e.target.value })} required sx={inputStyle} />
            <TextField label="Order Date" type="date" value={form.order_date} onChange={e => setForm({ ...form, order_date: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} required sx={inputStyle} />
            <TextField label="Delivery Date" type="date" value={form.delivery_date} onChange={e => setForm({ ...form, delivery_date: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} required sx={inputStyle} />
            <TextField label="Price" type="number" inputProps={{ min: 0, step: '0.01' }} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required sx={inputStyle} />
            <TextField label="Remarks" multiline minRows={2} value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} sx={inputStyle} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'var(--choco)', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving} sx={{ background: 'linear-gradient(135deg, #3d1f0e 0%, #7a4a30 100%)', textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
            {saving ? 'Saving...' : 'Save Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function RecordField({ label, value }) {
  return <Box><Typography className="mobile-record-label">{label}</Typography><Typography className="mobile-record-value">{value}</Typography></Box>
}

function StatusPill({ status }) {
  return <Box className={`mobile-status ${status === 'Delivered' ? 'is-delivered' : status === 'Pending' ? 'is-pending' : 'is-cancelled'}`}>{status}</Box>
}

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    background: '#fff',
    '& fieldset': { borderColor: '#e8ddd3' },
    '&:hover fieldset': { borderColor: '#d4948b' },
    '&.Mui-focused fieldset': { borderColor: '#7a4a30' }
  }
}
