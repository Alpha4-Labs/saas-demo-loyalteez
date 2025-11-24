# SaaS Demo - Loyalteez Integration

A modern Next.js SaaS demonstration showing how to integrate the **Loyalteez Reward API** to boost user engagement, retention, and conversion.

## Features

This demo implements three key reward hooks common in SaaS applications:

1.  **Newsletter Signup** (Acquisition)
    *   Users earn LTZ tokens for subscribing to the newsletter.
    *   *Integration:* Landing page form submission.
2.  **Profile Completion** (Activation)
    *   Users earn LTZ for filling out their profile details.
    *   *Integration:* Profile settings form.
3.  **Subscription Upgrade** (Revenue)
    *   Users earn a significant LTZ bonus for upgrading to a paid plan.
    *   *Integration:* Pricing page "Buy" action.

## Tech Stack

*   **Framework**: Next.js 14 (App Router)
*   **Styling**: Tailwind CSS
*   **Language**: TypeScript
*   **Deployment**: Cloudflare Pages / Vercel
*   **Rewards**: Loyalteez API

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── events/       # Proxy route for Loyalteez API calls
│   │   └── auth/         # Example NextAuth integration point
│   ├── pricing/          # Pricing page (Upgrade hook)
│   ├── profile/          # Profile page (Completion hook)
│   └── page.tsx          # Landing page (Newsletter hook)
├── lib/
│   └── loyalteez.ts      # Loyalteez API wrapper service
```

## Getting Started

1.  **Clone the repository**
    ```bash
    git clone <repo-url>
    cd saas-demo-loyalteez
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env.local` file with your Loyalteez Brand ID:
    ```env
    NEXT_PUBLIC_BRAND_ID=your_brand_id_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## Integration Guide

### 1. The Service Wrapper (`src/lib/loyalteez.ts`)

We use a singleton service class to handle all communication with the Loyalteez API. This ensures consistent error handling and type safety.

```typescript
// Usage example
import { loyalteez } from '@/lib/loyalteez';

await loyalteez.trackEvent('event_name', 'user@example.com', {
    metadata_key: 'value'
});
```

### 2. Client-Side Integration

For user-initiated actions (like clicking a button), we call our own API route `/api/events` which then securely calls Loyalteez. This keeps your API logic centralized and secrets (if needed in future) secure.

### 3. Server-Side Integration

For webhooks (e.g., Stripe payment success) or auth callbacks (NextAuth), you can import the `loyalteez` helper directly and `await` the result.

---

*Built for the Loyalteez Ecosystem.*

