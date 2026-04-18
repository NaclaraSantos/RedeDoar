import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  SvgIcon,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import logoSrc from '../assets/logo02.png'

function EyeIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 11c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
      <circle cx="12" cy="12" r="2.5" />
    </SvgIcon>
  )
}

function EyeOffIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M2.1 3.51 1 4.62l4.01 4.01A10.94 10.94 0 0 0 1 12c1.73 3.89 6 7 11 7 2 0 3.88-.5 5.53-1.38L20.38 20l1.11-1.11L2.1 3.51zM12 17c-2.76 0-5-2.24-5-5 0-.71.15-1.39.42-2l1.61 1.61A2.99 2.99 0 0 0 12 15c.53 0 1.03-.14 1.46-.38l1.68 1.68c-.94.44-1.99.7-3.14.7zM12 7c2.76 0 5 2.24 5 5 0 .36-.04.71-.11 1.04l3.03 3.03A11.77 11.77 0 0 0 23 12c-1.73-3.89-6-7-11-7-1.3 0-2.55.22-3.7.62l2.39 2.39c.41-.01.86-.01 1.31-.01z" />
    </SvgIcon>
  )
}

const ACCOUNT_STORAGE_KEY = 'rededoar_accounts'

function getStoredAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY)
    if (!raw) {
      // Contas de teste pré-carregadas
      const defaultAccounts = [
        { name: 'Empresa Teste', email: 'empresa@test.com', password: '123456', userType: 'empresa' },
        { name: 'Instituição Teste', email: 'instituicao@test.com', password: '123456', userType: 'instituicao' },
        { name: 'Voluntário Teste', email: 'voluntario@test.com', password: '123456', userType: 'voluntario' },
      ]
      saveAccounts(defaultAccounts)
      return defaultAccounts
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts))
}

function Login({ onLogin, mode: themeMode, onToggleTheme }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState('empresa')
  const [error, setError] = useState('')

  const isRegister = mode === 'register'
  const isDark = themeMode === 'dark'

  const fieldSx = useMemo(
    () => ({
      '& .MuiOutlinedInput-root': {
        color: isDark ? '#F8F8FF' : '#10103F',
        bgcolor: isDark ? 'rgba(15, 14, 52, 0.84)' : 'rgba(255, 255, 255, 0.95)',
        '& fieldset': { borderColor: isDark ? 'rgba(79, 72, 236, 0.5)' : 'rgba(79, 72, 236, 0.3)' },
        '&:hover fieldset': { borderColor: 'rgba(79, 72, 236, 0.7)' },
        '&.Mui-focused fieldset': { borderColor: '#4F48EC' },
      },
      '& .MuiInputLabel-root': { color: isDark ? '#C7C4FF' : '#4F48EC' },
    }),
    [isDark],
  )

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha para continuar.')
      return
    }

    if (password.trim().length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    const accounts = getStoredAccounts()
    const normalizedEmail = email.trim().toLowerCase()

    if (isRegister) {
      if (!name.trim()) {
        setError('Informe seu nome para criar a conta.')
        return
      }

      const existing = accounts.find((account) => account.email === normalizedEmail)
      if (existing) {
        setError('Ja existe uma conta com esse e-mail. Tente entrar.')
        return
      }

      const newAccount = {
        name: name.trim(),
        email: normalizedEmail,
        password: password.trim(),
        userType,
      }

      saveAccounts([newAccount, ...accounts])

      if (typeof onLogin === 'function') {
        onLogin({ email: newAccount.email, userType: newAccount.userType, name: newAccount.name })
      }

      return
    }

    const account = accounts.find((item) => item.email === normalizedEmail)

    if (!account || account.password !== password.trim()) {
      setError('Conta nao encontrada. Clique em "Criar cadastro" para se registrar.')
      return
    }

    if (typeof onLogin === 'function') {
      onLogin({ email: account.email, userType: account.userType, name: account.name })
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  function handleForgotPassword(event) {
    event.preventDefault()
    setError('Recuperacao de senha em breve. Enquanto isso, crie um novo cadastro.')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background: 'linear-gradient(180deg, #100E34 0%, #120F3A 100%)',
      }}
    >
      <Button
        type="button"
        onClick={onToggleTheme}
        sx={{
          position: 'absolute',
          top: 20,
          right: 22,
          minWidth: 0,
          px: 1.8,
          py: 0.8,
          borderRadius: 999,
          bgcolor: '#FFBF18',
          color: '#100E34',
          fontSize: 12,
          fontWeight: 700,
          '&:hover': { bgcolor: '#e6b114' },
        }}
      >
        {isDark ? 'CLARO' : 'ESCURO'}
      </Button>

      <Card
        sx={{
          width: '100%',
          maxWidth: 560,
          borderRadius: 3.2,
          border: isDark ? '1px solid rgba(79, 72, 236, 0.35)' : '1px solid rgba(79, 72, 236, 0.28)',
          bgcolor: isDark ? 'rgba(15, 14, 52, 0.92)' : 'rgba(255, 255, 255, 0.96)',
          boxShadow: isDark ? '0 18px 40px rgba(15, 14, 52, 0.6)' : '0 18px 40px rgba(79,72,236,0.16)',
        }}
        elevation={0}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Stack spacing={2.2} component="form" onSubmit={handleSubmit}>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                component="img"
                src={logoSrc}
                alt="Rede Doar Logo"
                sx={{
                  width: { xs: 220, sm: 280 },
                  maxWidth: '78%',
                  mx: 'auto',
                  my: 2,
                }}
              />
              
            </Box>

            <ToggleButtonGroup
              value={mode}
              exclusive
              fullWidth
              onChange={(_, nextValue) => {
                if (nextValue) switchMode(nextValue)
              }}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: isDark ? '#D9D9FF' : '#4F48EC',
                  borderColor: isDark ? 'rgba(79, 72, 236, 0.35)' : 'rgba(79, 72, 236, 0.28)',
                  bgcolor: isDark ? 'rgba(15, 14, 52, 0.52)' : 'rgba(255,255,255,0.94)',
                  fontWeight: 600,
                },
                '& .Mui-selected': {
                  color: '#FFFFFF',
                  bgcolor: 'rgba(79, 72, 236, 0.9) !important',
                },
              }}
            >
             
            </ToggleButtonGroup>

            {isRegister ? (
              <TextField
                label="Nome"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nome da pessoa responsavel"
                fullWidth
                sx={fieldSx}
              />
            ) : null}

            {isRegister ? (
              <TextField
                select
                label="Tipo de perfil"
                value={userType}
                onChange={(event) => setUserType(event.target.value)}
                fullWidth
                sx={fieldSx}
              >
                <MenuItem value="empresa">Empresa doadora</MenuItem>
                <MenuItem value="instituicao">Instituicao recebedora</MenuItem>
                <MenuItem value="voluntario">Entregador voluntário</MenuItem>
              </TextField>
            ) : null}

            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@organizacao.org"
              autoComplete="email"
              fullWidth
              sx={fieldSx}
            />

            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              fullWidth
              sx={fieldSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      edge="end"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                color: '#100E34',
                mt: 0.6,
                py: 1.2,
                fontWeight: 700,
                letterSpacing: '0.03em',
                backgroundColor: '#FFBF18',
                '&:hover': { backgroundColor: '#e6b114' },
              }}
            >
              {isRegister ? 'Cadastrar' : 'Entrar'}
            </Button>

            <Stack justifyContent="space-between" alignItems="center">
              {isRegister ? (
                <Link
                  component="button"
                  type="button"
                  underline="always"
                  onClick={() => switchMode('login')}
                  sx={{
                    color: isDark ? '#ffffff' : '#4F48EC',
                    textUnderlineOffset: 3,
                    p: 0,
                    m: 0,
                    minWidth: 0,
                    border: 'none',
                    backgroundColor: 'transparent',
                    '&:hover': { backgroundColor: 'transparent' },
                  }}
                >
                  Ja tenho conta
                </Link>
              ) : (
                <Link
                  component="button"
                  type="button"
                  underline="always"
                  onClick={handleForgotPassword}
                  sx={{
                    color: isDark ? '#ffffff' : '#4F48EC',
                    textUnderlineOffset: 3,
                    p: 0,
                    m: 0,
                    minWidth: 0,
                    border: 'none',
                    backgroundColor: 'transparent',
                    '&:hover': { backgroundColor: 'transparent' },
                  }}
                >
                  Esqueci minha senha
                </Link>
              )}

              {!isRegister ? (
                <Link
                  component="button"
                  type="button"
                  underline="always"
                  onClick={() => switchMode('register')}
                  sx={{
                    color: isDark ? '#ffffff' : '#4F48EC',
                    textUnderlineOffset: 3,
                    p: 0,
                    m: 0,
                    minWidth: 0,
                    border: 'none',
                    backgroundColor: 'transparent',
                    '&:hover': { backgroundColor: 'transparent' },
                  }}
                >
                  Criar cadastro
                </Link>
              ) : null}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Login
