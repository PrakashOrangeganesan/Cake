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
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import { CameraAlt, Edit, Image, Visibility } from '@mui/icons-material'
import { supabase } from '../lib/supabase'

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

export default function SalesBills() {
  const [orders, setOrders] = useState([])
  const [bills, setBills] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [actualDate, setActualDate] = useState(today())
  const [actualPrice, setActualPrice] = useState('')
  const [remarks, setRemarks] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [viewImage, setViewImage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data: orderData, error: oe } = await supabase
      .from('orders')
      .select('*')
      .order('order_id', { ascending: false })

    const { data: billData, error: be } = await supabase
      .from('sales_bills')
      .select('*, orders(order_no,cake_name,customer_name,mobile_number,order_date,delivery_date,price)')
      .order('sales_bill_id', { ascending: false })

    if (oe || be) setError((oe || be).message)
    else {
      setOrders(orderData || [])
      setBills(billData || [])
    }
  }

  const selected = orders.find(x => String(x.order_id) === String(selectedOrderId))

  function openNew() {
    setEditing(null)
    setSelectedOrderId('')
    setActualDate(today())
    setActualPrice('')
    setRemarks('')
    setImageFile(null)
    setPreview('')
    setError('')
    setOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setSelectedOrderId(String(row.order_id))
    setActualDate(row.actual_delivery_date || today())
    setActualPrice(row.actual_price ?? '')
    setRemarks(row.remarks || '')
    setImageFile(null)
    setPreview('')
    setError('')
    setOpen(true)
  }

  function chooseFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (file.size > 6 * 1024 * 1024) {
      setError('Please use an image smaller than 6 MB.')
      return
    }
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function save() {
    if (!selectedOrderId || actualDate === '' || actualPrice === '') {
      setError('Select an order and enter actual delivery date and actual price.')
      return
    }

    setSaving(true)
    setError('')

    try {
      let imagePath = null

      if (imageFile) {
        const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        imagePath = `sales/${selectedOrderId}-${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('cake-images')
          .upload(imagePath, imageFile, {
            contentType: imageFile.type,
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError
      }

      const billPayload = {
        actual_delivery_date: actualDate,
        actual_price: Number(actualPrice),
        remarks: remarks.trim()
      }

      if (editing) {
        if (imageFile) billPayload.cake_image_path = imagePath
      } else {
        billPayload.order_id = Number(selectedOrderId)
        billPayload.cake_image_path = imagePath
      }

      const billResult = editing
        ? await supabase.from('sales_bills').update(billPayload).eq('sales_bill_id', editing.sales_bill_id)
        : await supabase.from('sales_bills').insert(billPayload)

      if (billResult.error) throw billResult.error

      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'Delivered' })
        .eq('order_id', Number(selectedOrderId))

      if (updateError) throw updateError

      setOpen(false)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function showImage(path) {
    const { data, error } = await supabase.storage
      .from('cake-images')
      .createSignedUrl(path, 300)

    if (error) setError(error.message)
    else setViewImage(data.signedUrl)
  }

  const filteredBills = bills.filter(row => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return true
    return (row.orders?.customer_name || '').toLowerCase().includes(term)
  })

  return (
    <Box className="cake-page">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5} gap={2} flexWrap="wrap">
        <Box>
          <Typography className="cake-title" variant="h4" sx={{ fontWeight: 700, color: 'var(--ink)' }}>
            Sales Bills
          </Typography>
          <Typography sx={{ color: 'var(--warm-gray)' }}>Create the bill against an existing order.</Typography>
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
            New Sales Bill
          </Button>
        </Box>
      </Box>

      {error && !open && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

      <Paper sx={{ overflow: 'auto', borderRadius: 3, border: '1px solid var(--cake-border)', boxShadow: '0 12px 24px rgba(61,31,14,0.04)' }}>
        <Box className="mobile-records">
          {filteredBills.map(row => (
            <Box className="mobile-record" key={row.sales_bill_id}>
              <Box className="mobile-record-topline"><Box><Typography className="mobile-record-eyebrow">{row.bill_no}</Typography><Typography className="mobile-record-title">{row.orders?.cake_name || 'Cake sale'}</Typography></Box><Box>{row.cake_image_path ? <IconButton aria-label="View cake photo" onClick={() => showImage(row.cake_image_path)}><Visibility /></IconButton> : null}<IconButton aria-label="Edit sales bill" onClick={() => openEdit(row)}><Edit /></IconButton></Box></Box>
              <Typography className="mobile-record-customer">{row.orders?.customer_name || 'Unknown customer'} <span>·</span> {row.orders?.order_no || 'No order number'}</Typography>
              <Box className="mobile-record-grid"><RecordField label="Order price" value={`₹ ${Number(row.orders?.price || 0).toFixed(2)}`} /><RecordField label="Delivered" value={row.actual_delivery_date} /><RecordField label="Actual price" value={`₹ ${Number(row.actual_price || 0).toFixed(2)}`} /></Box>
            </Box>
          ))}
          {!filteredBills.length && <Box className="mobile-empty">No sales bills found.</Box>}
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: '#faf5f0' }}>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Bill No</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Order No</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Cake</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Order Price</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Actual Delivery</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Actual Price</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Photo</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'var(--choco-muted)' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBills.map(row => (
              <TableRow key={row.sales_bill_id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell>{row.bill_no}</TableCell>
                <TableCell>{row.orders?.order_no}</TableCell>
                <TableCell>{row.orders?.customer_name}</TableCell>
                <TableCell>{row.orders?.cake_name}</TableCell>
                <TableCell>₹ {Number(row.orders?.price || 0).toFixed(2)}</TableCell>
                <TableCell>{row.actual_delivery_date}</TableCell>
                <TableCell>₹ {Number(row.actual_price).toFixed(2)}</TableCell>
                <TableCell>
                  {row.cake_image_path ? (
                    <IconButton onClick={() => showImage(row.cake_image_path)} sx={{ color: 'var(--choco-muted)' }}><Visibility /></IconButton>
                  ) : '—'}
                </TableCell>
                <TableCell><IconButton aria-label="Edit sales bill" onClick={() => openEdit(row)} sx={{ color: 'var(--choco-muted)' }}><Edit /></IconButton></TableCell>
              </TableRow>
            ))}
            {!filteredBills.length && <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: 'var(--warm-gray)' }}>No sales bills found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800, color: 'var(--ink)', pb: 1 }}>{editing ? `Edit ${editing.bill_no}` : 'New Sales Bill'}</DialogTitle>
        <DialogContent>
          <Box display="grid" gap={2} pt={1}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            <TextField
              select
              label="Select Order"
              value={selectedOrderId}
              onChange={e => {
                setSelectedOrderId(e.target.value)
                const row = orders.find(x => String(x.order_id) === String(e.target.value))
                if (row) setActualPrice(row.price)
              }}
              required
              sx={inputStyle}
            >
              {orders.filter(row => !editing ? row.status === 'Pending' : String(row.order_id) === String(selectedOrderId)).map(row => (
                <MenuItem key={row.order_id} value={row.order_id}>
                  {row.order_no} — {row.cake_name} — {row.customer_name}
                </MenuItem>
              ))}
            </TextField>

            {selected && (
              <Paper
                variant="outlined"
                sx={{
                  p: 1,
                  borderRadius: 2,
                  borderColor: '#f1e1d8',
                  background: '#fffaf7',
                  boxShadow: 'none'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75, mb: 0.9 }}>
                  <Typography sx={{ fontWeight: 800, color: 'var(--ink)', fontSize: 13 }}>Order Details</Typography>
                  <Box component="span" sx={{ px: 0.75, py: 0.2, borderRadius: 999, background: '#fff1ee', color: '#a24d3b', fontSize: 8, fontWeight: 800, letterSpacing: 0.08, textTransform: 'uppercase' }}>
                    {selected.status}
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 0.65 }}>
                  {[
                    ['Customer', selected.customer_name],
                    ['Mobile', selected.mobile_number],
                    ['Cake', selected.cake_name],
                    ['Order Date', selected.order_date],
                    ['Planned Delivery', selected.delivery_date],
                    ['Order Price', `₹ ${Number(selected.price).toFixed(2)}`]
                  ].map(([label, value]) => (
                    <Box
                      key={label}
                      sx={{
                        p: 0.8,
                        borderRadius: 1.5,
                        border: '1px solid #f2e4dc',
                        background: '#fff',
                        minHeight: 52
                      }}
                    >
                      <Typography sx={{ color: 'var(--warm-gray)', fontSize: 8.5, fontWeight: 800, letterSpacing: 0.08, textTransform: 'uppercase', mb: 0.2 }}>
                        {label}
                      </Typography>
                      <Typography sx={{ color: 'var(--ink)', fontSize: 11.5, fontWeight: 700, lineHeight: 1.25, wordBreak: 'break-word' }}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

            <Box>
              <Typography sx={{ fontWeight: 800, mb: 1, color: 'var(--ink)' }}>Cake Photo</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button component="label" variant="outlined" startIcon={<Image />} sx={{ borderRadius: 2, borderColor: '#d4948b', color: 'var(--choco-muted)', textTransform: 'none', fontWeight: 600 }}>
                  Upload Image
                  <input hidden type="file" accept="image/*" onChange={e => chooseFile(e.target.files?.[0])} />
                </Button>

                <Button component="label" variant="outlined" startIcon={<CameraAlt />} sx={{ borderRadius: 2, borderColor: '#d4948b', color: 'var(--choco-muted)', textTransform: 'none', fontWeight: 600 }}>
                  Take Photo
                  <input hidden type="file" accept="image/*" capture="environment" onChange={e => chooseFile(e.target.files?.[0])} />
                </Button>
              </Box>

              {preview && (
                <Box mt={2}>
                  <img src={preview} alt="Cake preview" style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 12, border: '1px solid #e8ddd3' }} />
                </Box>
              )}
            </Box>

            <TextField label="Actual Delivery Date" type="date" value={actualDate} onChange={e => setActualDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} required sx={inputStyle} />
            <TextField label="Actual Price" type="number" inputProps={{ min: 0, step: '0.01' }} value={actualPrice} onChange={e => setActualPrice(e.target.value)} required sx={inputStyle} />
            <TextField label="Remarks" multiline minRows={2} value={remarks} onChange={e => setRemarks(e.target.value)} sx={inputStyle} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'var(--choco)', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving} sx={{ background: 'linear-gradient(135deg, #3d1f0e 0%, #7a4a30 100%)', textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
            {saving ? 'Saving...' : editing ? 'Update Sales Bill' : 'Save Sales Bill'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!viewImage} onClose={() => setViewImage('')} maxWidth="md">
        <Box p={1}>
          {viewImage && <img src={viewImage} alt="Cake" style={{ display: 'block', maxWidth: '90vw', maxHeight: '80vh' }} />}
        </Box>
      </Dialog>
    </Box>
  )
}

function RecordField({ label, value }) {
  return <Box><Typography className="mobile-record-label">{label}</Typography><Typography className="mobile-record-value">{value}</Typography></Box>
}
