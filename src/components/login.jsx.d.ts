import type { PaletteMode } from '@mui/material'
import type { ComponentType } from 'react'

// Payload que o componente Login devolve ao App apos autenticacao.
export type LoginPayload = {
  email: string
  userType: string
  name?: string
}

// Declaracao de tipos para permitir importar login.jsx dentro de arquivos TS/TSX.
declare const Login: ComponentType<{
  onLogin: (user: LoginPayload) => void
  mode: PaletteMode
  onToggleTheme: () => void
}>

export default Login
