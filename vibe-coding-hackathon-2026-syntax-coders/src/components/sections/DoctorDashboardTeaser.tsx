import React from 'react';

export default function DoctorDashboardTeaser() {
  return (
    <section id="dashboard" className="py-24 bg-brand-cream border-t border-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Dashboard Mockup */}
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-brand-primary/5 rounded-[3rem] blur-3xl transform -rotate-6" />
            <div className="relative bg-white rounded-3xl shadow-2xl border border-brand-light p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-light/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">
                    Dr
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-heading">Provider Workspace</h4>
                    <p className="text-xs text-brand-heading/50">LifeLink Verified</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-brand-mint/10 text-brand-mint text-sm font-bold rounded-full">
                  3 AI Pre-Screened
                </div>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-brand-background hover:bg-brand-light/20 transition-colors border border-transparent hover:border-brand-light cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-red-500 animate-pulse' : 'bg-brand-mint'}`} />
                      <div>
                        <p className="font-bold text-brand-heading text-sm">Patient #{1024 + i}</p>
                        <p className="text-xs text-brand-heading/60 mt-1">{i === 1 ? 'High Risk Assessment' : 'Routine Checkup'}</p>
                      </div>
                    </div>
                    <button className="text-brand-primary text-sm font-bold hover:underline">
                      Review AI Summary
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-heading mb-6 tracking-tight">
              A breath of fresh air for Providers.
            </h2>
            <p className="text-lg text-brand-heading/70 mb-8 leading-relaxed">
              We know administrative burden is overwhelming. LifeLink's Provider Dashboard presents AI-summarized patient histories and risk-prioritized queues, reducing admin time by up to 40%.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-brand-mint flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-brand-heading/80">Instantly view AI-extracted symptoms and timelines.</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-brand-mint flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-brand-heading/80">Access patient records only via verified blockchain consent.</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-brand-mint flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-brand-heading/80">Seamlessly integrate with existing EHR systems.</span>
              </li>
            </ul>
            <button className="bg-white border border-brand-light text-brand-heading px-8 py-3 rounded-full font-bold hover:bg-brand-light/30 transition-all shadow-sm">
              Join Provider Network
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
