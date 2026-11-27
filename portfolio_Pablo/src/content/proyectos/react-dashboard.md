# Dashboard en React con Vite

## Qué problema resuelve

Muchas aplicaciones necesitan mostrar datos en tiempo real: métricas, gráficos, alertas. Este proyecto es un dashboard interactivo que demuestra cómo construir una interfaz responsiva y performante con React, Vite y TypeScript.

## Stack técnico

- **React 19** con Hooks para estado y efectos
- **Vite** como bundler (HMR ultrarrápido en desarrollo)
- **TypeScript** para type-safety en la lógica
- **TailwindCSS** para estilos (sin escribir CSS manual)
- **Recharts** para gráficos dinámicos
- **Zustand** para state management ligero

## Componentes principales

### estructura de carpetas

```
frontend/
├── src/
│   ├── components/
│   │   ├── MetricCard.tsx
│   │   ├── Chart.tsx
│   │   └── Layout.tsx
│   ├── hooks/
│   │   └── useMetrics.ts    # Fetches de API + caching
│   ├── store/
│   │   └── dashboard.ts      # Zustand store
│   └── pages/
│       └── Dashboard.tsx
├── tailwind.config.js
└── vite.config.ts
```

### Hook personalizado para métricas

```typescript
// hooks/useMetrics.ts
import { useEffect, useState } from 'react'

interface Metric {
  id: string
  name: string
  value: number
  trend: 'up' | 'down'
  percentage: number
}

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/metrics')
        if (!res.ok) throw new Error('Failed to fetch metrics')
        const data = await res.json()
        setMetrics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    // Polling cada 30 segundos
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000)

    return () => clearInterval(interval)
  }, [])

  return { metrics, loading, error }
}
```

### Componente MetricCard

```typescript
// components/MetricCard.tsx
interface MetricCardProps {
  name: string
  value: number
  trend: 'up' | 'down'
  percentage: number
}

export function MetricCard({ name, value, trend, percentage }: MetricCardProps) {
  const isPositive = trend === 'up'

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-gray-400 text-sm font-medium">{name}</h3>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value.toLocaleString()}</span>
        <span className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '↑' : '↓'} {percentage}%
        </span>
      </div>
    </div>
  )
}
```

## Optimizaciones de rendimiento

### Code Splitting con React.lazy

```typescript
const ChartSection = lazy(() => import('./sections/ChartSection'))
const AlertsSection = lazy(() => import('./sections/AlertsSection'))

export function Dashboard() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ChartSection />
      <AlertsSection />
    </Suspense>
  )
}
```

### Memoización de componentes

```typescript
import { memo } from 'react'

const MetricCard = memo(function MetricCard({ metric }: Props) {
  return <div>{metric.value}</div>
}, (prev, next) => {
  // Solo re-renderizar si el valor cambió
  return prev.metric.value === next.metric.value
})
```

## Gráficos con Recharts

Recharts es ligero y declarativo:

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const data = [
  { time: '00:00', requests: 120 },
  { time: '04:00', requests: 240 },
  { time: '08:00', requests: 220 },
  { time: '12:00', requests: 450 },
]

export function RequestsChart() {
  return (
    <LineChart width={800} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="requests" stroke="#6366f1" />
    </LineChart>
  )
}
```

## Desarrollo vs Producción

**En desarrollo**, Vite sirve el código sin empaquetar (HMR en <100ms).  
**En producción**, se genera un bundle optimizado:

```bash
npm run build
# Genera: dist/ con assets minificados, chunks separados, y sourcemaps
```

## Qué aprendí

- **Vite es revolucionario**: el HMR es tan rápido que sientes que editas en tiempo real.
- **TypeScript previene muchos bugs**: type-checking en componentes y hooks evita errores en runtime.
- **Zustand es minimalista**: 2KB gzipped, sin boilerplate a diferencia de Redux.
- **Recharts es declarativo**: los gráficos se escriben como componentes React.

## Próximos pasos

- Autenticación y autorización
- Websockets para datos en tiempo real
- Testing con Vitest y React Testing Library
- PWA (service worker para offline mode)
