import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ONIX AI — Buy & Sell Businesses Globally',
  description: 'AI-Powered M&A Marketplace. Discover, evaluate, and acquire exceptional businesses worldwide.',
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Landing page styles — scoped to this route group only */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Didact+Gothic&family=Montserrat:wght@300;400;500;600;700;800&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap"
      />
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/style.css" />
      {children}
    </>
  );
}
