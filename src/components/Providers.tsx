'use client';

import { authClient } from '@/lib/auth-client';
import { usePresence } from '@/lib/hooks/usePresence';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  const session = authClient.useSession();
  const userId = session.data?.user.id || null;

  usePresence(userId);

  return <>{children}</>;
}
