'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [reward, setReward] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const brandId = process.env.NEXT_PUBLIC_BRAND_ID || '';
      
      if (!brandId) {
        setStatus('error');
        setErrorMessage('Brand ID not configured');
        return;
      }

      // In a real app, you'd get the user's email from auth context
      // For demo purposes, we'll use a placeholder
      const userEmail = 'user@example.com'; // Replace with actual user email

      const payload = {
        brandId: brandId.toLowerCase(),
        eventType: 'profile_completed',
        userEmail: userEmail,
        userIdentifier: userEmail,
        domain: 'saas-demo.loyalteez.app',
        sourceUrl: 'https://saas-demo.loyalteez.app/profile',
        metadata: { ...formData }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch('https://api.loyalteez.app/loyalteez-api/manual-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        setStatus('error');
        setErrorMessage(`Server error: ${res.status} ${res.statusText}`);
        return;
      }

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setReward(data.ltzDistributed || data.rewardAmount || 50);
      } else {
        setStatus('error');
        setErrorMessage(data.error || data.message || 'Failed to save profile');
      }
    } catch (err) {
      setStatus('error');
      if (err instanceof DOMException && err.name === 'AbortError') {
        setErrorMessage('Request timed out. Please try again.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="space-y-10 divide-y divide-gray-900/10">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Profile</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              This information will be displayed publicly so be careful what you share.
              <br/><br/>
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                Reward: 50 LTZ
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                
                <div className="sm:col-span-4">
                  <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Full Name</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">Job Title</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label htmlFor="bio" className="block text-sm font-medium leading-6 text-gray-900">Bio</label>
                  <div className="mt-2">
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-x-6 border-t border-gray-900/5 px-4 py-4 sm:px-8">
              {status === 'success' && (
                <p className="text-sm text-green-600 font-medium">
                  Profile saved! You earned <strong>{reward || 50} LTZ</strong> points.
                </p>
              )}
              {status === 'error' && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {status === 'loading' ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
