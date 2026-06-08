'use client';
import React, { useEffect, useRef } from 'react';

const features = [
  {
    id: 'ai-triage',
    title: 'AI Health Triage',
    description: 'A compassionate conversational interface that listens to your symptoms. Get real-time risk assessments and personalized recommendations without the clinical jargon.',
    icon: '💬',
    color: 'bg-brand-primary/10 text-brand-primary',
  },
  {
    id: 'vault',
    title: 'Secure Medical Vault',
    description: 'Your records are 100% yours. Stored safely on decentralized networks, accessible only by you, and shareable with doctors via verified blockchain consent.',
    icon: '🔐',
    color: 'bg-brand-mint/10 text-brand-mint',
  },
  {
    id: 'beacon',
    title: 'Emergency Beacon',
    description: 'A life-saving, one-tap broadcast. First responders instantly receive your critical health info, allergies, and contacts—no app login required.',
    icon: '🚨',
    color: 'bg-red-100 text-red-500',
  }
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('opacity-0');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.feature-card');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-brand-heading mb-6 tracking-tight">
            Designed for <span className="text-brand-primary">You</span>, not just the system.
          </h2>
          <p className="text-lg text-brand-heading/70">
            We removed the cold, sterile feeling of traditional medical apps. LifeLink focuses on warmth, privacy, and immediate support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={feature.id}
              className="feature-card opacity-0 bg-brand-background rounded-3xl p-8 border border-brand-light hover:border-brand-primary/30 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-brand-heading mb-4">{feature.title}</h3>
              <p className="text-brand-heading/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
