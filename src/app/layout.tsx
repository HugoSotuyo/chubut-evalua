

import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/auth-context';
import { UsersProvider } from '@/context/users-context';
import { SchoolsProvider } from '@/context/schools-context';
import { SearchProvider } from '@/context/search-context';
import { ExamsProvider } from '@/context/exams-context';
import { StudentsProvider } from '@/context/students-context';
import { ResultsProvider } from '@/context/results-context';
import { AuditLogProvider } from '@/context/audit-log-context';
import { SettingsProvider } from '@/context/settings-context';

export const metadata: Metadata = {
  title: 'Chubut evalúa',
  description: 'Plataforma de evaluación y análisis de resultados para la provincia de Chubut.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AuditLogProvider>
            <UsersProvider>
                <SchoolsProvider>
                    <SearchProvider>
                      <SettingsProvider>
                        <ExamsProvider>
                            <StudentsProvider>
                                <ResultsProvider>
                                    {children}
                                    <Toaster />
                                </ResultsProvider>
                            </StudentsProvider>
                        </ExamsProvider>
                      </SettingsProvider>
                    </SearchProvider>
                </SchoolsProvider>
            </UsersProvider>
          </AuditLogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
