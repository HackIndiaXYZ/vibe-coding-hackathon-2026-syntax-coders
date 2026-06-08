import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-gradient-to-b from-brand-light/30 to-background">
      {/* Ambient background blur elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-mint/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center">
        <div className="max-w-2xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-mint animate-pulse" />
            AI-Powered Healthcare Coordination
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-brand-heading mb-6 leading-[1.1]">
            Healthcare that feels like a <span className="text-brand-primary">warm hug.</span>
          </h1>
          <p className="text-xl text-brand-heading/70 mb-8 leading-relaxed max-w-xl">
            Compassionate AI triage, immutable records, and instant emergency access. LifeLink coordinates your care seamlessly, giving you peace of mind when you need it most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-brand-primary text-white px-8 py-4 rounded-full font-bold hover:bg-brand-primary/90 transition-all shadow-lg hover:shadow-brand-primary/25 text-lg">
              Start AI Triage
            </button>
            <button className="bg-red-50 text-red-600 border border-red-100 px-8 py-4 rounded-full font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Emergency Beacon
            </button>
          </div>
        </div>

        <div className="relative h-[600px] hidden lg:block">
          {/* Floating UI Mockups in pure CSS */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md animate-float">
            <div className="bg-white rounded-[2rem] shadow-2xl p-6 border border-brand-light">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-brand-light/50">
                <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-bold text-brand-heading">LifeLink Assistant</h3>
                  <p className="text-sm text-brand-heading/60">Online • Ready to help</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-brand-light/40 rounded-2xl rounded-tl-none p-4 w-[85%]">
                  <p className="text-brand-heading/80 text-sm">Hi there! I'm here to help. Could you tell me a little bit about what you're experiencing today?</p>
                </div>
                <div className="bg-brand-mint/20 rounded-2xl rounded-tr-none p-4 w-[80%] ml-auto">
                  <p className="text-brand-heading/80 text-sm">I've been having a slight fever and a headache since yesterday evening.</p>
                </div>
                <div className="bg-brand-light/40 rounded-2xl rounded-tl-none p-4 w-[90%]">
                  <p className="text-brand-heading/80 text-sm">I'm sorry to hear that. I can help you evaluate those symptoms and find the right care. Just a few quick questions...</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-brand-light/50">
                <div className="bg-brand-background rounded-full p-3 flex items-center justify-between border border-brand-light">
                  <span className="text-brand-heading/40 text-sm pl-2">Type your symptoms...</span>
                  <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-10 -right-4 w-64 bg-white rounded-2xl shadow-xl p-4 border border-brand-light animate-float-delayed">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-brand-mint/20 flex items-center justify-center text-brand-mint">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-brand-heading/50 font-bold uppercase tracking-wider">Vault Status</p>
                <p className="font-bold text-brand-heading">Records Secured</p>
              </div>
            </div>
            <div className="h-2 w-full bg-brand-light rounded-full overflow-hidden">
              <div className="h-full bg-brand-mint w-[100%]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
