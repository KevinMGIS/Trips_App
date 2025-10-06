import { DatabaseTest } from './components/DatabaseTest';
import { AuthProvider } from './contexts/AuthContext';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <div className='min-h-screen bg-[#0A0A0A] text-white'>
        <header className='p-6'>
          <h1 className='text-heading-1'>Trips</h1>
          <p className='text-body-secondary mt-2'>
            Weekend Getaway Planner - Database Test
          </p>
        </header>
        <main className='flex-1 p-6'>
          <DatabaseTest />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
