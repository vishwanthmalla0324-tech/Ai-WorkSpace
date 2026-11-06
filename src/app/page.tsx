"use client";

import ChatWidget from "@/components/ChatWidget";
import { Sparkles, Clock, ShieldCheck, MapPin, PhoneCall } from "lucide-react";

const CLINIC_CONTEXT = `
You are the AI Front-Desk Concierge for Apex Dental & Implant Centre, a premier dental clinic located in Visakhapatnam.
Services & Pricing:
- Dental Cleaning & Polishing: Rs. 1,200
- Painless Root Canal Treatment (RCT): Rs. 4,500 - 6,500 (includes digital X-rays)
- Ceramic / Zirconia Crowns: Rs. 5,000 - 9,000
- Teeth Whitening (In-Office 1 hr): Rs. 7,000
- Consultation Fee: Rs. 400 (Adjusted against treatment if done on the same day)

Clinic Hours:
- Monday to Saturday: 9:30 AM - 1:30 PM, 5:00 PM - 9:00 PM
- Sunday: 10:00 AM - 1:00 PM (Emergency appointments only)

Doctors:
- Dr. Ananya Rao, MDS (Prosthodontist & Implantologist, 12+ yrs experience)
- Dr. K. Rajesh, BDS (Cosmetic Dental Surgeon)

Location: 2nd Floor, Sai Complex, Near Simhachalam Bus Stand, Visakhapatnam.

Tone: Warm, highly professional, polite, reassuring. 
Important: Whenever visitors ask about appointments, tooth pain, or pricing, answer briefly and gently encourage them to drop their contact number so our front desk can reserve their preferred slot.
`;

export default function DemoBusinessPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Top Banner */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-lg tracking-tight">Apex Dental & Implant Centre</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" /> Mon - Sat: 9:30 AM - 9:00 PM
            </span>
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-400" /> +91 98480 22334
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" /> Certified Advanced Implant & Laser Care
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
          Gentle, Precision Dental Care for Your Family
        </h1>
        <p className="text-zinc-400 text-base max-w-xl mx-auto leading-relaxed">
          From painless root canals to smile makeovers, our MDS specialists deliver modern dentistry with hospital-grade sterilization.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={() => {
              const widgetBtn = document.querySelector("button") as HTMLButtonElement | null;
              if (widgetBtn) widgetBtn.click();
            }}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-emerald-950/50"
          >
            Ask Questions & Check Pricing
          </button>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-zinc-900 grid sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2">
          <h3 className="font-semibold text-zinc-200">Painless Root Canal</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Single-sitting laser-assisted therapy with digital apex locators for total pain relief.
          </p>
          <p className="text-xs font-semibold text-emerald-400 pt-2">Starts at Rs. 4,500</p>
        </div>
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2">
          <h3 className="font-semibold text-zinc-200">Ceramic Crowns & Veneers</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Custom-matched German Zirconia crowns with 15-year warranty protection.
          </p>
          <p className="text-xs font-semibold text-emerald-400 pt-2">Starts at Rs. 5,000</p>
        </div>
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2">
          <h3 className="font-semibold text-zinc-200">Deep Cleaning & Polishing</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Ultrasonic plaque removal ensuring healthy gums and long-term tooth stability.
          </p>
          <p className="text-xs font-semibold text-emerald-400 pt-2">Starts at Rs. 1,200</p>
        </div>
      </section>

      {/* Footer / Location */}
      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-500">
        <p className="flex items-center justify-center gap-1.5 mb-1">
          <MapPin className="w-3.5 h-3.5 text-zinc-400" /> 2nd Floor, Sai Complex, Near Simhachalam Bus Stand, Visakhapatnam
        </p>
        <p>(c) 2026 Apex Dental Care. All rights reserved.</p>
      </footer>

      {/* Live AI Assistant Floating Widget */}
      <ChatWidget
        businessName="Apex Dental Concierge"
        businessContext={CLINIC_CONTEXT}
        suggestedQuestions={[
          "How much does a Root Canal cost?",
          "Are you open on Sundays?",
          "How do I schedule an appointment?"
        ]}
      />
    </div>
  );
}
