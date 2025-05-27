'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchDomains } from '../lib/api';
import { ApiError } from '../lib/api';
import { APP_CONFIG } from '../lib/config';

export default function Home() {
  const [domains, setDomains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDomains() {
      try {
        const data = await fetchDomains();
        setDomains(data.domains);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching domains:', err);
        if (err instanceof ApiError) {
          setError(`${err.message} (Status: ${err.statusCode})`);
        } else {
          setError('Failed to connect to API. Make sure the backend is running.');
        }
        setIsLoading(false);
      }
    }

    loadDomains();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Open Deep Research</h1>
        <h2 className="text-2xl mb-6">Technical Due Diligence Platform</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Available TDD Domains</h3>
          
          {isLoading ? (
            <p>Loading domains...</p>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <ul className="list-disc pl-5">
              {domains.map((domain) => (
                <li key={domain} className="mb-2 capitalize">
                  {domain.replace('_', ' ')}
                </li>
              ))}
            </ul>
          )}
          
          <div className="mt-6">
            <Link 
              href="/projects" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              View Projects
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
