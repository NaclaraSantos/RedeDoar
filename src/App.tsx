import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { PaletteMode, Theme } from '@mui/material'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import Login from './components/login.jsx'
import './App.css'
import logo from './assets/logo02.png'

type DonationType =
  | 'alimentos'
  | 'roupas'
  | 'remedios'
  | 'fraldas'
  | 'higiene pessoal'
  | 'materiais de limpeza'
  | 'agua'

type BaseEntry = {
  id: string
  location: string
  foodType: DonationType
  urgency: number
}

type DonationOffer = BaseEntry & {
  company: string
  quantityKg: number
  pickupWindow: string
}

type NeedRequest = BaseEntry & {
  institution: string
  neededKg: number
}

type Match = {
  id: string
  offer: DonationOffer
  request: NeedRequest
  score: number
  distanceKm: number
  suggestedPickup: string
}

type DeliveryAssignment = {
  volunteerName: string
  volunteerLabel: string
  assignedAt: string
}

type Courier = {
  id: string
  name: string
  region: string
  status: 'Ativo' | 'Em rota' | 'Disponivel em breve'
  deliveriesToday: number
}

type Session = {
  email: string
  userType: string
  name?: string
}

type AppProps = {
  mode: PaletteMode
  onToggleTheme: () => void
}

type ScreenId = 'dashboard' | 'doacoes' | 'necessidades' | 'entregadores' | 'matchs'

type NavItem = {
  id: ScreenId
  label: string
  icon: ReactNode
  description: string
}

const DRAWER_WIDTH = 278

const FOOD_LABELS: Record<DonationType, string> = {
  alimentos: 'Alimentos',
  roupas: 'Roupas',
  remedios: 'Remedios',
  fraldas: 'Fraldas',
  'higiene pessoal': 'Higiene pessoal',
  'materiais de limpeza': 'Materiais de limpeza',
  agua: 'Agua',
}

const LOCATION_COORDS: Record<string, { lat: number; lon: number }> = {
  'sao paulo - zona norte': { lat: -23.505, lon: -46.631 },
  'sao paulo - zona sul': { lat: -23.647, lon: -46.69 },
  'sao paulo - zona leste': { lat: -23.548, lon: -46.47 },
  'sao paulo - zona oeste': { lat: -23.56, lon: -46.74 },
  guarulhos: { lat: -23.454, lon: -46.533 },
  osasco: { lat: -23.532, lon: -46.791 },
  santoandre: { lat: -23.663, lon: -46.538 },
}

const INITIAL_OFFERS: DonationOffer[] = [
  {
    id: 'of-1',
    company: 'SuperMais Distribuicao',
    location: 'sao paulo - zona norte',
    foodType: 'alimentos',
    quantityKg: 320,
    pickupWindow: 'Hoje 18:00-21:00',
    urgency: 5,
  },
  {
    id: 'of-2',
    company: 'Mercado Ponte Verde',
    location: 'osasco',
    foodType: 'agua',
    quantityKg: 180,
    pickupWindow: 'Amanha 08:00-12:00',
    urgency: 3,
  },
  {
    id: 'of-3',
    company: 'Central Frio Logistica',
    location: 'guarulhos',
    foodType: 'remedios',
    quantityKg: 95,
    pickupWindow: 'Hoje 14:30-17:30',
    urgency: 4,
  },
  {
    id: 'of-4',
    company: 'Padaria Aurora',
    location: 'sao paulo - zona oeste',
    foodType: 'fraldas',
    quantityKg: 72,
    pickupWindow: 'Hoje 20:00-21:30',
    urgency: 4,
  },
]

const INITIAL_REQUESTS: NeedRequest[] = [
  {
    id: 'rq-1',
    institution: 'Cozinha Solidaria Rio Limpo',
    location: 'sao paulo - zona norte',
    foodType: 'alimentos',
    neededKg: 260,
    urgency: 5,
  },
  {
    id: 'rq-2',
    institution: 'Abrigo Nova Esperanca',
    location: 'osasco',
    foodType: 'agua',
    neededKg: 150,
    urgency: 4,
  },
  {
    id: 'rq-3',
    institution: 'ONG Maos no Clima',
    location: 'sao paulo - zona leste',
    foodType: 'remedios',
    neededKg: 110,
    urgency: 4,
  },
  {
    id: 'rq-4',
    institution: 'Centro Comunitario Horizonte',
    location: 'sao paulo - zona oeste',
    foodType: 'fraldas',
    neededKg: 64,
    urgency: 3,
  },
]

const INITIAL_COURIERS: Courier[] = [
  { id: 'cr-1', name: 'Ana Costa', region: 'Zona Norte', status: 'Ativo', deliveriesToday: 5 },
  { id: 'cr-2', name: 'Marcos Lima', region: 'Osasco e regiao', status: 'Em rota', deliveriesToday: 3 },
  { id: 'cr-3', name: 'Juliana Rocha', region: 'Guarulhos', status: 'Ativo', deliveriesToday: 4 },
  { id: 'cr-4', name: 'Pedro Alves', region: 'Zona Leste', status: 'Disponivel em breve', deliveriesToday: 1 },
]

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Rede Doar', icon: <DashboardOutlinedIcon />, description: '' },
  { id: 'doacoes', label: 'Ofertas', icon: <VolunteerActivismOutlinedIcon />, description: 'Recursos disponíveis e pontos de coleta' },
  { id: 'necessidades', label: 'Solicitações', icon: <Inventory2OutlinedIcon />, description: 'Organizações e demandas emergenciais' },
  { id: 'entregadores', label: 'Logística', icon: <LocalShippingOutlinedIcon />, description: 'Equipe e coletas em campo' },
  { id: 'matchs', label: 'Conexões', icon: <HubOutlinedIcon />, description: 'Combinações entre oferta e demanda' },
]

const DONOR_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Resumo', icon: <DashboardOutlinedIcon />, description: 'Visão geral das ofertas e conexões' },
  { id: 'doacoes', label: 'Ofertas', icon: <VolunteerActivismOutlinedIcon />, description: 'Cadastrar e acompanhar suas doações' },
  { id: 'matchs', label: 'Conexões', icon: <HubOutlinedIcon />, description: 'Ver correspondências entre ofertas e demandas' },
]

const INSTITUTION_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Resumo', icon: <DashboardOutlinedIcon />, description: 'Visão geral das necessidades e conexões' },
  { id: 'necessidades', label: 'Solicitações', icon: <Inventory2OutlinedIcon />, description: 'Registrar e acompanhar necessidades' },
  { id: 'matchs', label: 'Conexões', icon: <HubOutlinedIcon />, description: 'Ver ofertas sugeridas para sua demanda' },
]

const VOLUNTEER_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Resumo', icon: <DashboardOutlinedIcon />, description: 'Visão geral das coletas voluntárias' },
  { id: 'entregadores', label: 'Coletas', icon: <LocalShippingOutlinedIcon />, description: 'Entregas disponíveis para voluntários' },
]

function normalizeLocation(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function toRad(value: number): number {
  return (value * Math.PI) / 180
}

function getDistanceKm(origin: string, destination: string): number {
  const o = LOCATION_COORDS[normalizeLocation(origin)]
  const d = LOCATION_COORDS[normalizeLocation(destination)]

  if (!o || !d) {
    return 35
  }

  const earthRadiusKm = 6371
  const dLat = toRad(d.lat - o.lat)
  const dLon = toRad(d.lon - o.lon)
  const lat1 = toRad(o.lat)
  const lat2 = toRad(d.lat)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Number((earthRadiusKm * c).toFixed(1))
}

function scorePair(offer: DonationOffer, request: NeedRequest): { score: number; distanceKm: number } {
  if (offer.foodType !== request.foodType) {
    return { score: -1, distanceKm: 999 }
  }

  const distanceKm = getDistanceKm(offer.location, request.location)
  const distanceScore = Math.max(0, 40 - distanceKm)
  const urgencyScore = ((offer.urgency + request.urgency) / 10) * 35
  const quantityRatio = Math.min(offer.quantityKg, request.neededKg) / Math.max(offer.quantityKg, request.neededKg)
  const quantityScore = quantityRatio * 25

  return { score: Number((distanceScore + urgencyScore + quantityScore).toFixed(1)), distanceKm }
}

function buildMatches(offers: DonationOffer[], requests: NeedRequest[]): Match[] {
  const candidates: Match[] = []

  for (const offer of offers) {
    for (const request of requests) {
      const { score, distanceKm } = scorePair(offer, request)
      if (score < 0) continue

      candidates.push({
        id: `${offer.id}-${request.id}`,
        offer,
        request,
        score,
        distanceKm,
        suggestedPickup: offer.pickupWindow.includes('Hoje')
          ? `${offer.pickupWindow} (prioridade)`
          : offer.pickupWindow,
      })
    }
  }

  candidates.sort((a, b) => b.score - a.score)

  const usedOffers = new Set<string>()
  const usedRequests = new Set<string>()
  const best: Match[] = []

  for (const candidate of candidates) {
    if (usedOffers.has(candidate.offer.id) || usedRequests.has(candidate.request.id)) continue
    usedOffers.add(candidate.offer.id)
    usedRequests.add(candidate.request.id)
    best.push(candidate)
  }

  return best
}

function surfaceSx(theme: Theme) {
  return {
    borderRadius: 4,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    backgroundColor: theme.palette.background.paper,
  }
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      justifyContent="space-between"
    >
      <Box>
        <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: '0.08em', fontWeight: 700 }}>
          {eyebrow}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
          {description}
        </Typography>
      </Box>
      {action}
    </Stack>
  )
}

function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string
  value: string
  helper: string
  icon: ReactNode
}) {
  return (
    <Card sx={(theme) => surfaceSx(theme)}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {helper}
            </Typography>
          </Box>
          <Avatar variant="rounded" sx={{ width: 48, height: 48, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  )
}

function App({ mode, onToggleTheme }: AppProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [offers, setOffers] = useState<DonationOffer[]>(INITIAL_OFFERS)
  const [requests, setRequests] = useState<NeedRequest[]>(INITIAL_REQUESTS)
  const [couriers] = useState<Courier[]>(INITIAL_COURIERS)
  const [scheduled, setScheduled] = useState<Record<string, string>>({})
  const [deliveryAssignments, setDeliveryAssignments] = useState<Record<string, DeliveryAssignment>>({})

  const [offerForm, setOfferForm] = useState({
    company: '',
    location: '',
    foodType: 'alimentos' as DonationType,
    quantityKg: 50,
    pickupWindow: 'Hoje 16:00-19:00',
    urgency: 3,
  })

  const [requestForm, setRequestForm] = useState({
    institution: '',
    location: '',
    foodType: 'alimentos' as DonationType,
    neededKg: 40,
    urgency: 4,
  })

  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'))
  const isVolunteer = session?.userType === 'voluntario'
  const isDonor = session?.userType === 'empresa'
  const isInstitution = session?.userType === 'instituicao'
  const currentNavItems = isVolunteer
    ? VOLUNTEER_NAV_ITEMS
    : isDonor
    ? DONOR_NAV_ITEMS
    : isInstitution
    ? INSTITUTION_NAV_ITEMS
    : NAV_ITEMS
  const selectedScreen = currentNavItems.some((item) => item.id === activeScreen) ? activeScreen : currentNavItems[0].id

  const matches = useMemo(() => buildMatches(offers, requests), [offers, requests])
  const totalOffered = useMemo(() => offers.reduce((acc, item) => acc + item.quantityKg, 0), [offers])
  const totalNeeded = useMemo(() => requests.reduce((acc, item) => acc + item.neededKg, 0), [requests])
  const activeCouriers = couriers.filter((courier) => courier.status !== 'Disponivel em breve').length
  const deliveriesToday = couriers.reduce((acc, courier) => acc + courier.deliveriesToday, 0)
  const highUrgencyRequests = requests.filter((request) => request.urgency >= 4).length
  const topMatches = matches.slice(0, 3)

  function handleAddOffer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!offerForm.company.trim() || !offerForm.location.trim()) return

    const newOffer: DonationOffer = {
      id: `of-${Date.now()}`,
      company: offerForm.company.trim(),
      location: normalizeLocation(offerForm.location),
      foodType: offerForm.foodType,
      quantityKg: Number(offerForm.quantityKg),
      pickupWindow: offerForm.pickupWindow.trim(),
      urgency: Number(offerForm.urgency),
    }

    setOffers((prev) => [newOffer, ...prev])
    setOfferForm((prev) => ({ ...prev, company: '', location: '' }))
  }

  function handleAddRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!requestForm.institution.trim() || !requestForm.location.trim()) return

    const newRequest: NeedRequest = {
      id: `rq-${Date.now()}`,
      institution: requestForm.institution.trim(),
      location: normalizeLocation(requestForm.location),
      foodType: requestForm.foodType,
      neededKg: Number(requestForm.neededKg),
      urgency: Number(requestForm.urgency),
    }

    setRequests((prev) => [newRequest, ...prev])
    setRequestForm((prev) => ({ ...prev, institution: '', location: '' }))
  }

  function scheduleMatch(match: Match) {
    setScheduled((prev) => ({ ...prev, [match.id]: `Coleta agendada: ${match.suggestedPickup}` }))
  }

  function assignDelivery(match: Match | null, assignmentKey: string) {
    const volunteerName = session?.name?.trim() || 'Voluntario responsavel'
    const volunteerLabel = session?.name ? `${session.name} (${session.email})` : session?.email ?? 'Equipe de logistica'
    const assignedAt = new Date().toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })

    setDeliveryAssignments((prev) => ({
      ...prev,
      [assignmentKey]: {
        volunteerName,
        volunteerLabel,
        assignedAt,
      },
    }))

    setScheduled((prev) => ({
      ...prev,
      [assignmentKey]: `Entrega assumida por ${volunteerName}. Coleta prevista${match ? ` para ${match.suggestedPickup}` : ''}`,
    }))
  }

  function handleLogin(user: Session) {
    setSession(user)
  }

  function handleLogout() {
    setSession(null)
    setActiveScreen('dashboard')
  }

  function openScreen(screenId: ScreenId) {
    setActiveScreen(screenId)
    setMobileOpen(false)
  }

  const pageMeta = useMemo(() => {
    const current = currentNavItems.find((item) => item.id === selectedScreen)
    return current ?? currentNavItems[0]
  }, [selectedScreen, currentNavItems])

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 3 }}>
        <img src={logo} alt="RedeDoar" style={{ height: '50px' }} />
      </Box>

      <List sx={{ px: 2, pb: 2 }}>
        {currentNavItems.map((item) => (
          <ListItemButton
            key={item.id}
            selected={item.id === selectedScreen}
            onClick={() => openScreen(item.id)}
            sx={{
              mb: 1,
              borderRadius: 3,
              alignItems: 'flex-start',
              py: 1.4,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root, & .MuiTypography-root': { color: 'inherit' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, mt: 0.2, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              secondary={item.description}
              primaryTypographyProps={{ fontWeight: 600 }}
              secondaryTypographyProps={{
                sx: { mt: 0.3, color: item.id === selectedScreen ? 'rgba(255,255,255,0.82)' : 'text.secondary' },
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 3 }}>
        <Card sx={(theme) => ({ ...surfaceSx(theme), bgcolor: 'action.hover' })}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Operacao do dia
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {activeCouriers} entregadores ativos, {matches.length} matchs priorizados e {highUrgencyRequests}{' '}
              demandas urgentes.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )

  function renderDashboard() {
    return (
      <Stack spacing={3}>
        <SectionHeader
          eyebrow="Visão Geral"
          title={isVolunteer ? 'Painel do voluntário' : isDonor ? 'Painel da doadora' : isInstitution ? 'Painel da instituição' : 'Dashboard'}
          description={
            isVolunteer
              ? 'Veja as ofertas disponíveis e as coletas que você pode assumir como voluntário.'
              : isDonor
              ? 'Monitore suas ofertas e os matches sugeridos para doações.'
              : isInstitution
              ? 'Monitore suas solicitações e as conexões com recursos disponíveis.'
              : 'Monitore recursos, solicitações e coletas para apoiar quem foi afetado por desastres ambientais.'
          }
          action={<Chip icon={<TrendingUpOutlinedIcon />} label={`${matches.length} conexões priorizadas`} color="primary" variant="outlined" />}
        />

        <Box className="dashboard-grid">
          <MetricCard
            label={isVolunteer ? 'Ofertas disponíveis' : isDonor ? 'Ofertas publicadas' : isInstitution ? 'Solicitações registradas' : 'Ofertas registradas'}
            value={String(isInstitution ? requests.length : offers.length)}
            helper={
              isVolunteer
                ? `${matches.length} conexões sugeridas`
                : isDonor
                ? `${matches.length} correspondências sugeridas`
                : isInstitution
                ? `${matches.length} ofertas sugeridas`
                : ``
            }
            icon={<VolunteerActivismOutlinedIcon />}
          />
          <MetricCard
            label={isVolunteer ? 'Solicitações compatíveis' : isDonor ? 'Demandas compatíveis' : isInstitution ? 'Ofertas compatíveis' : 'Solicitações ativas'}
            value={String(isInstitution ? offers.length : requests.length)}
            helper={`${highUrgencyRequests} com urgência alta`}
            icon={<Inventory2OutlinedIcon />}
          />
          <MetricCard
            label={isVolunteer ? 'Coletas hoje' : isDonor ? 'Conexões ativas' : isInstitution ? 'Conexões ativas' : 'Logística ativa'}
            value={String(deliveriesToday)}
            helper={
              isVolunteer
                ? 'Coletas registradas para voluntários'
                : isDonor || isInstitution
                ? `${deliveriesToday} coletas realizadas hoje`
                : `${deliveriesToday} coletas realizadas hoje`
            }
            icon={<AccessTimeOutlinedIcon />}
          />
        </Box>

        <Box className="content-grid">
          <Card sx={(theme) => surfaceSx(theme)}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Resumo operacional
              </Typography>
              <Stack spacing={2.2} sx={{ mt: 3 }}>
                <Box>
                      <Typography variant="body2" color="text.secondary">
                    Capacidade de coleta
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mt: 0.4, fontWeight: 600 }}>
                    {activeCouriers}/{couriers.length} equipes disponíveis
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Demanda total
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mt: 0.4, fontWeight: 600 }}>
                    {totalNeeded} kg solicitados por organizações
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Oferta total
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mt: 0.4, fontWeight: 600 }}>
                    {totalOffered} kg disponíveis para coleta
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={(theme) => surfaceSx(theme)}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Matchs mais relevantes
              </Typography>
              <Stack spacing={2} sx={{ mt: 3 }}>
                {topMatches.map((match) => (
                  <Box key={match.id} className="match-row">
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {match.offer.company}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {match.request.institution}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Score {match.score}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {match.distanceKm} km
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    )
  }

  function renderDonations() {
    return (
      <Stack spacing={3}>
        <SectionHeader eyebrow="Ofertas" title="Cadastro de ofertas" description="Registre recursos disponíveis e coordene a coleta para apoiar comunidades afetadas." />
        <Box className="content-grid">
          <Card sx={(theme) => surfaceSx(theme)}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Nova oferta
              </Typography>
              <Box component="form" onSubmit={handleAddOffer} className="form-grid" sx={{ mt: 3 }}>
                <TextField label="Empresa ou doador" value={offerForm.company} onChange={(event) => setOfferForm((prev) => ({ ...prev, company: event.target.value }))} required fullWidth />
                <TextField label="Localização" value={offerForm.location} onChange={(event) => setOfferForm((prev) => ({ ...prev, location: event.target.value }))} placeholder="Ex: sao paulo - zona oeste" required fullWidth />
                <TextField select label="Tipo de recurso" value={offerForm.foodType} onChange={(event) => setOfferForm((prev) => ({ ...prev, foodType: event.target.value as DonationType }))} fullWidth>
                  {Object.entries(FOOD_LABELS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField label="Quantidade (kg)" type="number" inputProps={{ min: 1 }} value={offerForm.quantityKg} onChange={(event) => setOfferForm((prev) => ({ ...prev, quantityKg: Number(event.target.value) }))} fullWidth />
                <TextField label="Urgência (1 a 5)" type="number" inputProps={{ min: 1, max: 5 }} value={offerForm.urgency} onChange={(event) => setOfferForm((prev) => ({ ...prev, urgency: Number(event.target.value) }))} fullWidth />
                <TextField label="Janela de coleta" value={offerForm.pickupWindow} onChange={(event) => setOfferForm((prev) => ({ ...prev, pickupWindow: event.target.value }))} fullWidth />
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Button type="submit" variant="contained" size="large">
                    Publicar oferta
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={(theme) => surfaceSx(theme)}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Doacoes recentes
              </Typography>
              <Stack spacing={2} sx={{ mt: 3 }}>
                {offers.map((offer) => (
                  <Box key={offer.id} className="list-row">
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {offer.company}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {offer.location}
                      </Typography>
                    </Box>
                    <Stack alignItems="flex-end" spacing={0.7}>
                      <Chip size="small" label={FOOD_LABELS[offer.foodType]} />
                      <Typography variant="body2" color="text.secondary">
                        {offer.quantityKg} kg
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    )
  }

  function renderNeeds() {
    return (
      <Stack spacing={3}>
        <SectionHeader eyebrow="Solicitações" title="Demandas de organizações" description="Centralize pedidos de instituições e facilite o planejamento das coletas emergenciais." />
        <Box className="content-grid">
          <Card sx={(theme) => surfaceSx(theme)}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Nova solicitação
              </Typography>
              <Box component="form" onSubmit={handleAddRequest} className="form-grid" sx={{ mt: 3 }}>
                <TextField label="Organização" value={requestForm.institution} onChange={(event) => setRequestForm((prev) => ({ ...prev, institution: event.target.value }))} required fullWidth />
                <TextField label="Localização" value={requestForm.location} onChange={(event) => setRequestForm((prev) => ({ ...prev, location: event.target.value }))} placeholder="Ex: guarulhos" required fullWidth />
                <TextField select label="Tipo de recurso" value={requestForm.foodType} onChange={(event) => setRequestForm((prev) => ({ ...prev, foodType: event.target.value as DonationType }))} fullWidth>
                  {Object.entries(FOOD_LABELS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField label="Demanda (kg)" type="number" inputProps={{ min: 1 }} value={requestForm.neededKg} onChange={(event) => setRequestForm((prev) => ({ ...prev, neededKg: Number(event.target.value) }))} fullWidth />
                <TextField label="Urgência (1 a 5)" type="number" inputProps={{ min: 1, max: 5 }} value={requestForm.urgency} onChange={(event) => setRequestForm((prev) => ({ ...prev, urgency: Number(event.target.value) }))} fullWidth />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip label={`${highUrgencyRequests} demandas prioritárias`} color="secondary" variant="outlined" />
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Button type="submit" variant="contained" size="large">
                    Registrar solicitação
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={(theme) => surfaceSx(theme)}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Instituicoes em atendimento
              </Typography>
              <Stack spacing={2} sx={{ mt: 3 }}>
                {requests.map((request) => (
                  <Box key={request.id} className="list-row">
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {request.institution}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.location}
                      </Typography>
                    </Box>
                    <Stack alignItems="flex-end" spacing={0.7}>
                      <Chip size="small" label={`Urgencia ${request.urgency}`} color="warning" variant="outlined" />
                      <Typography variant="body2" color="text.secondary">
                        {request.neededKg} kg
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    )
  }

  function renderCouriers() {
    return (
      <Stack spacing={3}>
        <SectionHeader
          eyebrow={isVolunteer ? 'Voluntário' : isDonor ? 'Ofertas' : isInstitution ? 'Solicitações' : 'Logística'}
          title={
            isVolunteer
              ? 'Coletas voluntárias'
              : isDonor
              ? 'Ofertas para entrega'
              : isInstitution
              ? 'Pedidos ativos'
              : 'Equipe de distribuição'
          }
          description={
            isVolunteer
              ? 'Assuma coletas a partir das ofertas cadastradas e leve recursos aos pontos indicados.'
              : isDonor
              ? 'Acompanhe as ofertas já cadastradas e as demandas correlacionadas.'
              : isInstitution
              ? 'Acompanhe sua demanda e as ofertas sugeridas para atendimento.'
              : 'Acompanhe a equipe responsável por coletas emergenciais e entregas rápidas.'
          }
        />
        <Box className="dashboard-grid">
          <MetricCard
            label={isVolunteer ? 'Ofertas disponíveis' : isDonor ? 'Ofertas cadastradas' : isInstitution ? 'Solicitações registradas' : 'Ativos agora'}
            value={String(isInstitution ? requests.length : offers.length)}
            helper={isVolunteer ? `${matches.length} coletas sugeridas` : isDonor ? `${offers.length} ofertas` : isInstitution ? `${requests.length} pedidos` : 'Profissionais em operação ou em rota'}
            icon={<VolunteerActivismOutlinedIcon />}
          />
          <MetricCard
            label={isVolunteer ? 'Solicitações compatíveis' : isDonor ? 'Demandas correlacionadas' : isInstitution ? 'Ofertas correlacionadas' : 'Entregas hoje'}
            value={String(isInstitution ? offers.length : requests.length)}
            helper={
              isVolunteer
                ? `${highUrgencyRequests} demandas prioritárias`
                : isDonor || isInstitution
                ? `${matches.length} conexões sugeridas`
                : 'Retiradas concluídas no dia'
            }
            icon={<Inventory2OutlinedIcon />}
          />
          <MetricCard
            label={isVolunteer ? 'Coletas agendadas' : 'Coletas hoje'}
            value={String(deliveriesToday)}
            helper={isVolunteer ? 'Registros de coleta já concluídos' : `${deliveriesToday} coletas realizadas hoje`}
            icon={<AccessTimeOutlinedIcon />}
          />
        </Box>

        <Box className="content-grid" sx={{ gridTemplateColumns: '1fr' }}>
          <Card sx={(theme) => surfaceSx(theme)}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {isVolunteer
                  ? 'Entregas disponíveis para voluntários'
                  : isDonor
                  ? 'Suas ofertas cadastradas'
                  : isInstitution
                  ? 'Solicitações em aberto'
                  : 'Entregas disponíveis'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {isVolunteer
                  ? 'Selecione uma doação cadastrada em Ofertas para assumir a coleta e entrega.'
                  : isDonor
                  ? 'Veja suas ofertas e as demandas sugeridas para cada uma.'
                  : isInstitution
                  ? 'Veja suas solicitações e as ofertas sugeridas para atendimento.'
                  : 'Acompanhe as operações disponíveis.'}
              </Typography>
              <Box className="delivery-grid" sx={{ mt: 3 }}>
                {isVolunteer
                  ? offers.map((offer) => {
                      const match = matches.find((item) => item.offer.id === offer.id) ?? null
                      const assignmentKey = match?.id ?? offer.id
                      const assignment = deliveryAssignments[assignmentKey]

                      return (
                        <Box key={offer.id} className="delivery-card">
                          <Stack spacing={1.5}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                  {offer.company}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {offer.location}
                                </Typography>
                              </Box>
                              <Chip
                                size="small"
                                label={assignment ? 'Assumida' : 'Disponível'}
                                color={assignment ? 'success' : 'default'}
                                variant={assignment ? 'filled' : 'outlined'}
                              />
                            </Stack>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems="flex-start">
                              <Typography variant="body2">{FOOD_LABELS[offer.foodType]} · {offer.quantityKg} kg</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {offer.pickupWindow}
                              </Typography>
                            </Stack>

                            <Typography variant="body2" color="text.secondary">
                              {match
                                ? `Destino sugerido: ${match.request.institution}`
                                : 'Sem destino sugerido para esta oferta'}
                            </Typography>

                            <Button
                              fullWidth
                              variant="contained"
                              onClick={() => assignDelivery(match, assignmentKey)}
                              disabled={Boolean(assignment)}
                            >
                              {assignment ? 'Entrega selecionada' : 'Assumir entrega'}
                            </Button>
                          </Stack>
                        </Box>
                      )
                    })
                  : isDonor
                  ? offers.map((offer) => {
                      const match = matches.find((item) => item.offer.id === offer.id) ?? null
                      return (
                        <Box key={offer.id} className="delivery-card">
                          <Stack spacing={1.5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {offer.company}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {FOOD_LABELS[offer.foodType]} · {offer.quantityKg} kg
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {offer.pickupWindow}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {match ? `Demanda sugerida: ${match.request.institution}` : 'Sem demanda sugerida ainda'}
                            </Typography>
                          </Stack>
                        </Box>
                      )
                    })
                  : isInstitution
                  ? requests.map((request) => {
                      const match = matches.find((item) => item.request.id === request.id) ?? null
                      return (
                        <Box key={request.id} className="delivery-card">
                          <Stack spacing={1.5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {request.institution}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {request.location}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {FOOD_LABELS[request.foodType]} · {request.neededKg} kg
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {match ? `Oferta sugerida: ${match.offer.company}` : 'Sem oferta sugerida ainda'}
                            </Typography>
                          </Stack>
                        </Box>
                      )
                    })
                  : offers.map((offer) => {
                      const match = matches.find((item) => item.offer.id === offer.id) ?? null
                      return (
                        <Box key={offer.id} className="delivery-card">
                          <Stack spacing={1.5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {offer.company}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {offer.location}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {FOOD_LABELS[offer.foodType]} · {offer.quantityKg} kg
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {match ? `Destino sugerido: ${match.request.institution}` : 'Sem destino sugerido para esta oferta'}
                            </Typography>
                          </Stack>
                        </Box>
                      )
                    })}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    )
  }

  function renderMatches() {
    return (
      <Stack spacing={3}>
        <SectionHeader eyebrow="Conexões" title="Emparelhamentos sugeridos" description="Combinações propostas por tipo de recurso, distância, urgência e volume compatível." />
        <Card sx={(theme) => surfaceSx(theme)}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2.2}>
              {matches.map((match) => (
                <Box key={match.id} className="match-card">
                  <Box className="match-card__main">
                    <Stack spacing={0.7}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {match.offer.company}
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Chip size="small" icon={<PlaceOutlinedIcon />} label={match.offer.location} />
                        <Chip size="small" label={FOOD_LABELS[match.offer.foodType]} />
                      </Stack>
                    </Stack>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Destino
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>
                        {match.request.institution}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {match.request.location}
                      </Typography>
                    </Box>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Score {match.score}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {match.distanceKm} km de distancia
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Coleta: {match.suggestedPickup}
                      </Typography>
                    </Stack>
                  </Box>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {scheduled[match.id] ?? 'Aguardando confirmação da coleta'}
                    </Typography>
                    <Button variant="contained" onClick={() => scheduleMatch(match)}>
                      Agendar coleta
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    )
  }

  function renderContent() {
    switch (selectedScreen) {
      case 'doacoes':
        return renderDonations()
      case 'necessidades':
        return renderNeeds()
      case 'entregadores':
        return renderCouriers()
      case 'matchs':
        return renderMatches()
      case 'dashboard':
      default:
        return renderDashboard()
    }
  }

  if (!session) {
    return <Login onLogin={handleLogin} mode={mode} onToggleTheme={onToggleTheme} />
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { lg: `${DRAWER_WIDTH}px` },
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: mode === 'dark' ? 'rgba(79, 72, 236, 0.18)' : 'rgba(79, 72, 236, 0.08)',
          color: 'text.primary',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ minHeight: 80, px: { xs: 2, md: 4 } }}>
          {!isDesktop ? (
            <IconButton onClick={() => setMobileOpen(true)} edge="start" sx={{ mr: 1 }}>
              <MenuOutlinedIcon />
            </IconButton>
          ) : null}

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {pageMeta.description}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {pageMeta.label}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={onToggleTheme} color="primary">
              {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
            <Chip label={session.userType} variant="outlined" />
            <Chip label={session.name ? session.name : session.email} color="primary" />
            <IconButton onClick={handleLogout} color="primary">
              <LogoutOutlinedIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        <Toolbar sx={{ minHeight: 80 }} />
        <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
          <Card sx={(theme) => ({ ...surfaceSx(theme), p: { xs: 2.5, md: 4 }, bgcolor: 'background.default' })}>
            {renderContent()}
          </Card>
        </Box>
      </Box>
    </Box>
  )
}

export default App
