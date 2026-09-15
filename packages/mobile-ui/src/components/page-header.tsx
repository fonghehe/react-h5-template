'use client';

import { useRouter } from 'next/navigation';

import { useUi } from '../ui';

export function PageHeader({ title, back = true }: { title: string; back?: boolean }) {
  const router = useRouter();
  const { NavBar } = useUi();
  return (
    <header className="page-nav">
      <NavBar back={back} onBack={() => router.back()} title={title} />
    </header>
  );
}
