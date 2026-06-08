import Link from 'next/link';
import React from 'react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-brand-light/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Heart icon placeholder */}
          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <Link href="/" className="text-2xl font-bold tracking-tight text-brand-primary">
            LifeLink
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-8">
          <Link href="#features" className="text-brand-heading/70 hover:text-brand-primary transition-colors font-medium">Features</Link>
          <Link href="#vault" className="text-brand-heading/70 hover:text-brand-primary transition-colors font-medium">Secure Vault</Link>
          <Link href="#dashboard" className="text-brand-heading/70 hover:text-brand-primary transition-colors font-medium">For Doctors</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="#triage" 
            className="bg-brand-mint text-brand-heading px-6 py-2.5 rounded-full font-semibold hover:bg-opacity-90 transition-all shadow-sm"
          >
            Start Triage
          </Link>
        </div>
      </div>
    </nav>
  );
}
