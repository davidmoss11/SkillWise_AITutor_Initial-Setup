import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export default function ProgressBar({ completed, total }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
  const data = [{ name: 'Progress', value: pct }]
  return (
    <div className="w-48 h-24">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip formatter={(v) => v + '%'} />
          <Bar dataKey="value" fill="#2563eb" isAnimationActive>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="text-center text-xs mt-1 font-medium">{pct}%</div>
    </div>
  )
}
