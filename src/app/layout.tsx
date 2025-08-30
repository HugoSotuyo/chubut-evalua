import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { UsersProvider } from '@/context/users-context';
import { ExamsProvider } from '@/context/exams-context';
import { SearchProvider } from '@/context/search-context';

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SearchProvider>
          <ExamsProvider>
            <UsersProvider>
              {children}
              <Toaster />
            </UsersProvider>
          </ExamsProvider>
        </SearchProvider>
      </body>
    </html>
  );
}
