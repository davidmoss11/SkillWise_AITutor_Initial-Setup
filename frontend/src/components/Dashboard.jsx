import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">SkillWise AI Tutor</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="px-4">Welcome, {user.firstName}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Goals Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Learning Goals</h2>
                <div className="space-y-4">
                  <p className="text-gray-500">No goals set yet.</p>
                </div>
              </div>
            </div>

            {/* Challenges Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Active Challenges
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-500">No active challenges.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
