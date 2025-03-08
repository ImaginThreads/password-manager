import { ClerkProvider } from '@clerk/nextjs';

import './globals.css'
import Navbar from './components/Navbar';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from "react-hot-toast";

const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
console.log("Clerk Publishable Key:", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <html lang="en">
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <Toaster position="top-center" reverseOrder={false} />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}