export default function ChallengeCard({ challenge, onToggleComplete }) {
  const done = challenge.status === 'done'
  return (
    <div className="border rounded p-3 space-y-2 bg-white shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{challenge.title}</h3>
        <span className={`text-xs px-2 py-1 rounded ${done ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{challenge.status}</span>
      </div>
      <p className="text-sm text-gray-600">{challenge.description}</p>
      <button
        onClick={() => onToggleComplete(challenge)}
        className={`text-xs px-2 py-1 rounded border ${done ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}
      >
        {done ? 'Completed' : 'Mark Complete'}
      </button>
    </div>
  )
}
