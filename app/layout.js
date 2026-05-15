import ToasterProvider from '@/components/providers/ToasterProvider';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'FitNest - Your Fitness Journey',
  description: 'Track your fitness journey with precision and ease',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${jetbrainsMono.variable} antialiased`}>
        <ToasterProvider />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
