"use client";

import React, { Suspense } from 'react';

// Este componente permite envolver a otros componentes que usan hooks como
// useSearchParams en un límite de Suspense, como requiere Next.js para la
// renderización estática.
export function SuspenseWrapper({ children }: { children: React.ReactNode }) {
    return <Suspense fallback={<div>Cargando...</div>}>{children}</Suspense>;
}