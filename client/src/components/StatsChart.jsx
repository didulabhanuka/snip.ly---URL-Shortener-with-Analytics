import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
)

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#34d399', '#f87171', '#a78bfa']

const baseOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
  },
}

export function ClicksOverTimeChart({ data }) {
  const labels = Object.keys(data)
  const values = Object.values(data)

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        fill: true,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.12)',
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  }

  return <Line data={chartData} options={baseOptions} />
}

export function BreakdownBarChart({ data, label }) {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 8)

  const chartData = {
    labels: entries.map(([k]) => k),
    datasets: [
      {
        label,
        data: entries.map(([, v]) => v),
        backgroundColor: COLORS,
        borderRadius: 4,
      },
    ],
  }

  return (
    <Bar
      data={chartData}
      options={{ ...baseOptions, plugins: { legend: { display: false } } }}
    />
  )
}

export function DeviceDoughnut({ data }) {
  const entries = Object.entries(data)

  const chartData = {
    labels: entries.map(([k]) => k),
    datasets: [
      {
        data: entries.map(([, v]) => v),
        backgroundColor: COLORS,
        borderWidth: 0,
      },
    ],
  }

  return (
    <Doughnut
      data={chartData}
      options={{
        responsive: true,
        cutout: '65%',
        plugins: { legend: { position: 'bottom' } },
      }}
    />
  )
}