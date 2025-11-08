import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import GoalForm from '../components/GoalForm'
import ChallengeCard from '../components/ChallengeCard'
import ProgressBar from '../components/ProgressBar'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'

export default function Dashboard() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [goals, setGoals] = useState([])
  const [creatingForGoal, setCreatingForGoal] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    if (!token) return
    api.get('/goals').then(r => setGoals(r.data.goals || r.data)).catch(() => setGoals([]))
  }, [token])

  async function refresh() {
    const r = await api.get('/goals')
    setGoals(r.data.goals || r.data)
  }

  async function toggleChallenge(ch) {
    const newStatus = ch.status === 'done' ? 'todo' : 'done'
    await api.put(`/challenges/${ch.id}`, { status: newStatus })
    await refresh()
  }

  function goalProgress(goal) {
    const total = goal.challenges?.length || 0
    const completed = goal.challenges?.filter(c => c.status === 'done').length || 0
    return { completed, total }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button className="text-sm" onClick={() => { logout(); navigate('/login') }}>Logout</button>
      </div>

      <section className="bg-white p-4 rounded border">
        <h2 className="font-medium mb-3">Create a Goal</h2>
        <GoalForm onCreated={refresh} />
      </section>

      <section className="space-y-4">
        {goals.length === 0 && <p className="text-gray-600">No goals yet. Create your first one above.</p>}
        {goals.map(goal => {
          const { completed, total } = goalProgress(goal)
          return (
            <div key={goal.id} className="bg-white p-4 rounded border space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{goal.title}</h3>
                  <p className="text-sm text-gray-600">{goal.description}</p>
                </div>
                <ProgressBar completed={completed} total={total} />
              </div>
              <div>
                {creatingForGoal === goal.id ? (
                  <form
                    onSubmit={handleSubmit(async (data) => {
                      await api.post('/challenges', { title: data.title, description: data.description, goalId: goal.id })
                      reset()
                      setCreatingForGoal(null)
                      await refresh()
                    })}
                    className="flex gap-2 mb-3"
                  >
                    <input className="border p-2 flex-1" placeholder="Challenge title" {...register('title', { required: true })} />
                    <input className="border p-2 flex-1" placeholder="Description" {...register('description', { required: true })} />
                    <button className="bg-blue-600 text-white px-3 py-2 rounded" type="submit">Add</button>
                    <button className="px-3 py-2 rounded border" type="button" onClick={() => setCreatingForGoal(null)}>Cancel</button>
                  </form>
                ) : (
                  <button className="text-sm text-blue-700" onClick={() => setCreatingForGoal(goal.id)}>+ Add Challenge</button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(goal.challenges || []).map(ch => (
                  <ChallengeCard key={ch.id} challenge={ch} onToggleComplete={toggleChallenge} />
                ))}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
