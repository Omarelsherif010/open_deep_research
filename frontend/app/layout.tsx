import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { APP_CONFIG } from '../lib/config';

export const metadata: Metadata = {
  title: `${APP_CONFIG.APP_NAME} - TDD Platform`,
  description: APP_CONFIG.APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-xl font-bold">{APP_CONFIG.APP_NAME}</div>
            <nav>
              <ul className="flex space-x-4">
                <li><Link href="/" className="hover:text-blue-300">Home</Link></li>
                <li><Link href="/projects" className="hover:text-blue-300">Projects</Link></li>
              </ul>
            </nav>
          </div>
        </header>
        {children}
        <footer className="bg-gray-800 text-white p-4 mt-8">
          <div className="container mx-auto text-center">
            <p>© {new Date().getFullYear()} {APP_CONFIG.APP_NAME}. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
