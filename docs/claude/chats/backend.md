# Backend Patterns

## Supabase Client Usage

There are two Supabase clients and they must never be confused:

### Browser Client (`src/lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(URL, ANON_KEY)
}
```

**Use when:**
- Setting up Realtime subscriptions (`supabase.channel(...)`)
- Auth operations triggered by user interaction (magic link send, sign out)
- Client Components that need to re-fetch after user actions

**Never use for:**
- Initial page data fetching (use Server Component + server client instead)
- Anything involving the service role key

### Server Client (`src/lib/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(URL, ANON_KEY, { cookies: { ... } })
}
```

**Use when:**
- Server Components fetching data
- Server Actions performing mutations
- Middleware session refresh
- API Routes (if any)

The server client reads the session from the HTTP cookie, which is set/refreshed by the middleware on every request.

## RLS Policy Philosophy

Every table has RLS enabled. The policies follow these rules:

### Public Read, Own Write
For `user_cards`: all users can see all cards for trade browsing, but only the owner can mutate.
```sql
create policy "user_cards_select" on public.user_cards for select using (true);
create policy "user_cards_insert" on public.user_cards for insert with check (auth.uid() = user_id);
```

### Participant-Only Access
For `trades` and `battles`: only the two parties involved can see the record.
```sql
create policy "trades_select" on public.trades for select using (
  auth.uid() = initiator_id or auth.uid() = receiver_id
);
```

### Never Trust the Client with Money
The `coins` column in `user_profiles` should **never** be updated directly from the browser. Coin deductions/additions happen via Server Actions that:
1. Verify the user is authenticated
2. Verify the operation is valid (enough coins, valid pack ID)
3. Run the deduction inside a Supabase RPC function (or transaction)

```sql
-- Future: create a stored procedure for atomic pack opening
create or replace function public.open_pack(
  p_user_id uuid,
  p_pack_id uuid,
  p_card_ids uuid[]
) returns void language plpgsql security definer as $$
declare
  v_price integer;
  v_coins integer;
begin
  select price_coins into v_price from packs where id = p_pack_id;
  select coins into v_coins from user_profiles where id = p_user_id;
  if v_coins < v_price then raise exception 'insufficient_coins'; end if;
  update user_profiles set coins = coins - v_price where id = p_user_id;
  insert into user_cards (user_id, card_id)
    select p_user_id, unnest(p_card_ids);
end;
$$;
```

## API Routes in Next.js

Most operations use Server Actions (co-located with the page). The rule is:

| Operation | Method | Reason |
|-----------|--------|--------|
| Open pack | Server Action | Randomness must be server-side |
| Accept trade | Server Action | Multi-row transaction (swap ownership) |
| Resolve battle | Server Action | Score calculation is authoritative |
| Read cards | RSC (no action) | Simple SELECT, RLS handles auth |
| Send magic link | Browser Supabase client | Supabase handles this natively |

### Server Action Template
```typescript
// src/app/packs/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function openPack(packId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  // ... pack opening logic
  revalidatePath('/collection')
  revalidatePath('/packs')
  return { cards: newCards }
}
```

## Realtime Subscriptions for Trades

When a trade's status changes, both parties should know immediately.

**Pattern:** Subscribe to `postgres_changes` on `trades` filtered to the current user's IDs.

```typescript
// In TradeList client component
useEffect(() => {
  const channel = supabase
    .channel('trade-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'trades',
        filter: `initiator_id=eq.${userId}`,
      },
      handleTradeUpdate
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'trades',
        filter: `receiver_id=eq.${userId}`,
      },
      handleNewTrade
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [userId, supabase])
```

**Note:** Supabase Realtime `postgres_changes` requires the row to be accessible via RLS. Since our `trades` policy allows `initiator_id OR receiver_id`, both parties will receive the event.

## Service Role Key Usage

The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. It is used **only** in:
- `sync-job/seed-cards.ts` (local script, never deployed to Vercel)
- Future: admin operations

The service role key is **never** set as a `NEXT_PUBLIC_` variable and never referenced in any `src/` code.
