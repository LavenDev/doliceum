'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';

interface SearchParamsProviderProps {
  children: (params: {
    searchParams: ReadonlyURLSearchParams;
    router: { replace: (url: string, options?: { scroll?: boolean }) => void };
    pathname: string;
  }) => React.ReactNode;
}

function SearchParamsContent({ children }: SearchParamsProviderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  return <>{children({ searchParams, router: { replace: router.replace }, pathname })}</>;
}

export default function SearchParamsProvider({ children }: SearchParamsProviderProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    }>
      <SearchParamsContent>{children}</SearchParamsContent>
    </Suspense>
  );
}

