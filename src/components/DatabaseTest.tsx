import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import type { Trip } from '../types/database';

export function DatabaseTest() {
  const { user, profile, signIn, signOut } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Test database connection by fetching trips
  const testConnection = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTrips(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Create a test trip
  const createTestTrip = async () => {
    if (!user) {
      setError('Must be logged in to create trips');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('trips')
        .insert({
          title: 'Test Trip',
          destination: 'Portland, OR',
          description: 'Testing database connection',
          budget_amount: 800,
          status: 'planning',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTrips(prev => [data, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  useEffect(() => {
    if (user) {
      testConnection();
    }
  }, [user]);

  if (!user) {
    return (
      <div className='max-w-md mx-auto mt-8 p-6 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl'>
        <h2 className='text-heading-2 mb-4'>Sign In to Test Database</h2>
        <form onSubmit={handleSignIn} className='space-y-4'>
          <div>
            <label className='block text-body-secondary mb-2'>Email</label>
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='w-full p-3 bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg text-white focus:border-[#FF6B35] focus:outline-none'
              required
            />
          </div>
          <div>
            <label className='block text-body-secondary mb-2'>Password</label>
            <input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='w-full p-3 bg-[#0A0A0A] border border-[#2C2C2E] rounded-lg text-white focus:border-[#FF6B35] focus:outline-none'
              required
            />
          </div>
          <button
            type='submit'
            className='w-full bg-[#FF6B35] text-white py-3 rounded-lg font-semibold hover:bg-[#FF6B35]/90 transition-colors'
          >
            Sign In
          </button>
        </form>
        {error && (
          <div className='mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg'>
            <p className='text-red-400 text-sm'>{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto mt-8 p-6'>
      <div className='bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-6 mb-6'>
        <h2 className='text-heading-2 mb-4'>Database Connection Test</h2>

        {/* User Info */}
        <div className='mb-6 p-4 bg-[#0A0A0A] rounded-lg'>
          <h3 className='text-heading-3 mb-2'>User Information</h3>
          <p className='text-body-secondary'>Email: {user.email}</p>
          <p className='text-body-secondary'>User ID: {user.id}</p>
          {profile && (
            <p className='text-body-secondary'>
              Profile Name: {profile.full_name}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className='flex gap-4 mb-6'>
          <button
            onClick={testConnection}
            disabled={loading}
            className='bg-[#FF6B35] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#FF6B35]/90 transition-colors disabled:opacity-50'
          >
            {loading ? 'Loading...' : 'Test Connection'}
          </button>
          <button
            onClick={createTestTrip}
            disabled={loading}
            className='bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600/90 transition-colors disabled:opacity-50'
          >
            Create Test Trip
          </button>
          <button
            onClick={signOut}
            className='bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600/90 transition-colors'
          >
            Sign Out
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className='mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg'>
            <p className='text-red-400 text-sm'>{error}</p>
          </div>
        )}

        {/* Trips Display */}
        <div>
          <h3 className='text-heading-3 mb-4'>Trips ({trips.length})</h3>
          {trips.length === 0 ? (
            <p className='text-body-secondary'>
              No trips found. Try creating a test trip!
            </p>
          ) : (
            <div className='space-y-3'>
              {trips.map(trip => (
                <div key={trip.id} className='p-4 bg-[#0A0A0A] rounded-lg'>
                  <h4 className='text-body font-semibold'>{trip.title}</h4>
                  <p className='text-body-secondary'>{trip.destination}</p>
                  <div className='flex gap-4 mt-2 text-caption'>
                    <span>Status: {trip.status}</span>
                    {trip.budget_amount && (
                      <span>Budget: ${trip.budget_amount}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
