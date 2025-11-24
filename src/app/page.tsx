'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle, Zap } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [reward, setReward] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // Call Loyalteez API directly (api.loyalteez.app)
      const brandId = process.env.NEXT_PUBLIC_BRAND_ID || '';
      
      if (!brandId) {
        setStatus('error');
        setErrorMessage('Brand ID not configured. Please set NEXT_PUBLIC_BRAND_ID in Cloudflare Pages settings.');
        return;
      }

      const res = await fetch('https://api.loyalteez.app/loyalteez-api/manual-event', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandId: brandId,
          eventType: 'newsletter_subscribe',
          userEmail: email,
          userIdentifier: email,
          domain: 'saas-demo.loyalteez.app',
          sourceUrl: 'https://saas-demo.loyalteez.app',
          metadata: { 
            source: 'homepage_hero',
            timestamp: new Date().toISOString()
          }
        }),
      });

      // Handle non-JSON responses
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        setStatus('error');
        setErrorMessage(`Server error: ${res.status} ${res.statusText}`);
        return;
      }

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setReward(data.ltzDistributed || data.rewardAmount || 25);
      } else {
        console.error('Subscription failed:', data);
        setStatus('error');
        setErrorMessage(data.error || data.message || `Error: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setStatus('error');
      
      // Handle specific error types
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setErrorMessage('Network error: Could not reach the API. Please check your connection.');
      } else if (err instanceof SyntaxError) {
        setErrorMessage('Invalid response from server. Please try again.');
      } else {
        setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Data to enrich your online business
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat fugiat aliqua.
            </p>
            
            {/* Newsletter Hook */}
            <div className="mt-10 flex flex-col items-center gap-y-6">
              <div className="w-full max-w-md">
                <form onSubmit={handleSubscribe} className="flex gap-x-4">
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-w-0 flex-auto rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your email"
                    disabled={status === 'success'}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className="flex-none rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                  >
                    {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
                  </button>
                </form>
                
                {/* Reward Notification */}
                {status === 'success' && (
                  <div className="mt-4 rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Subscription confirmed</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Thanks for subscribing! You've earned <strong>{reward || 25} LTZ</strong> points.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {status === 'error' && (
                  <div className="mt-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{errorMessage}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Join our newsletter and earn LTZ rewards immediately.
              </p>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
        </div>
      </div>
    </div>
  );
}
