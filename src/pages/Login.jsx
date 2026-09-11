import { useState } from 'react'
import { Alert, Box, Button, Card, CardContent, CircularProgress, TextField, Typography } from '@mui/material'
import { supabase } from '../lib/supabase'

function CakeLogo({ size = 56 }) {
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

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function login(e) {
    e.preventDefault()
    setBusy(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) setError(error.message)
    setBusy(false)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        background: 'radial-gradient(circle at top, rgba(201,123,114,0.17) 0%, rgba(250,247,242,0.95) 32%, #f5efe8 100%)'
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 430,
          borderRadius: 4,
          border: '1px solid #e8ddd3',
          boxShadow: '0 18px 40px rgba(61, 31, 14, 0.12)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ background: 'linear-gradient(135deg, #3d1f0e 0%, #5c3321 58%, #7a4a30 100%)', p: 3, display: 'grid', placeItems: 'center' }}>
          <Box sx={{ width: 88, height: 88, borderRadius: 3, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.08)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)' }}>
            <CakeLogo size={58} />
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography
            className="cake-title"
            variant="h4"
            sx={{ fontWeight: 700, color: 'var(--ink)', textAlign: 'center', mb: 1 }}
          >
            Homemade Cake
          </Typography>
          <Typography sx={{ color: 'var(--warm-gray)', textAlign: 'center', mb: 3 }}>
            Sign in to manage orders and sales
          </Typography>

          <Box component="form" onSubmit={login} display="grid" gap={2.25}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  background: '#fff',
                  '& fieldset': { borderColor: '#e8ddd3' },
                  '&:hover fieldset': { borderColor: '#d4948b' },
                  '&.Mui-focused fieldset': { borderColor: '#7a4a30' }
                }
              }}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  background: '#fff',
                  '& fieldset': { borderColor: '#e8ddd3' },
                  '&:hover fieldset': { borderColor: '#d4948b' },
                  '&.Mui-focused fieldset': { borderColor: '#7a4a30' }
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={busy}
              sx={{
                mt: 0.5,
                borderRadius: 2.5,
                py: 1.25,
                background: 'linear-gradient(135deg, #3d1f0e 0%, #7a4a30 100%)',
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: 'none',
                '&:hover': { background: 'linear-gradient(135deg, #4f2a14 0%, #7a4a30 100%)' }
              }}
            >
              {busy ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
