import { useForm } from 'react-hook-form'
import { api } from '../lib/api'

export default function GoalForm({ onCreated }) {
  const { register, handleSubmit, reset } = useForm()
  const onSubmit = async (data) => {
    try {
      await api.post('/goals', {
        title: data.title,
        description: data.description,
        targetDate: data.targetDate
      })
      reset()
      onCreated && onCreated()
    } catch (e) {
      // basic error surfacing
      alert(e?.response?.data?.error || 'Failed to create goal')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <input className="border p-2 w-full" placeholder="Goal title" {...register('title', { required: true })} />
      <textarea className="border p-2 w-full" placeholder="Description" {...register('description', { required: true })} />
      <input className="border p-2 w-full" type="date" {...register('targetDate', { required: true })} />
      <button className="bg-green-600 text-white px-3 py-2 rounded" type="submit">Add Goal</button>
    </form>
  )
}
