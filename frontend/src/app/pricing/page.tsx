"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check, Shield, Zap, Users, Star, ArrowRight, Lock,
  HardDrive, MessageSquare, Activity, Eye, Globe, X, ChevronLeft
} from "lucide-react";
import Link from "next/link";

const container: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item: any = { hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 90 } } };

const PLANS = [
  {
    id: "free",
    name: "Free Vault",
    price: { monthly: 0, annual: 0 },
    description: "Full zero-knowledge encryption for individuals. No credit card, no commitment.",
    icon: Lock,
    highlight: false,
    badge: null,
    color: "text-primary-100/60",
    borderColor: "border-white/8",
    features: [
      { label: "Zero-knowledge encryption", included: true },
      { label: "2 GB Hot Storage", included: true },
      { label: "RSA-2048 keypair generation", included: true },
      { label: "AES-256-CBC file encryption", included: true },
      { label: "E2E Encrypted Messaging", included: true },
      { label: "Immutable Audit Log (30 days)", included: true },
      { label: "3-Tier Storage", included: false },
      { label: "Vault Sharing", included: false },
      { label: "API Access", included: false },
      { label: "Priority Support", included: false },
    ],
    cta: "Start Free",
    ctaHref: "/auth?mode=register",
    ctaClass: "btn-ghost",
  },
  {
    id: "pro",
    name: "Pro Shield",
    price: { monthly: 9, annual: 7 },
    description: "The complete privacy suite for power users and security professionals.",
    icon: Shield,
    highlight: true,
    badge: "Most Popular",
    color: "text-accent-300",
    borderColor: "border-accent-500/35",
    features: [
      { label: "Everything in Free", included: true },
      { label: "50 GB 3-Tier Storage", included: true },
      { label: "Full Vault Sharing", included: true },
      { label: "Burn-after-read messages", included: true },
      { label: "Immutable Audit Log (1 year)", included: true },
      { label: "LZMA Cold Archive", included: true },
      { label: "Dead Man's Switch (beta)", included: true },
      { label: "Steganography Vault (beta)", included: true },
      { label: "API Access", included: false },
      { label: "Priority Support", included: false },
    ],
    cta: "Start Pro Trial",
    ctaHref: "/auth?mode=register",
    ctaClass: "btn-primary",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: { monthly: null, annual: null },
    description: "Compliance-ready, team-scoped vaults with centralized key administration.",
    icon: Users,
    highlight: false,
    badge: null,
    color: "text-primary-100/60",
    borderColor: "border-white/8",
    features: [
      { label: "Everything in Pro", included: true },
      { label: "Unlimited Storage", included: true },
      { label: "Team Vault Management", included: true },
      { label: "Role-Based Key Distribution", included: true },
      { label: "SOC 2 / HIPAA audit export", included: true },
      { label: "Immutable Audit Log (unlimited)", included: true },
      { label: "Dedicated API & Webhooks", included: true },
      { label: "SLA-backed uptime", included: true },
      { label: "Custom deployment (self-hosted)", included: true },
      { label: "Dedicated support engineer", included: true },
    ],
    cta: "Contact Sales",
    ctaHref: "mailto:enterprise@securevault.io",
    ctaClass: "btn-ghost",
  },
];

const COMPARISON: { label: string; icon: any; free: string | boolean; pro: string | boolean; enterprise: string | boolean }[] = [
  { label: "Storage", icon: HardDrive, free: "2 GB", pro: "50 GB", enterprise: "Unlimited" },
  { label: "Encryption Standard", icon: Lock, free: true, pro: true, enterprise: true },
  { label: "Vault Sharing", icon: Globe, free: false, pro: true, enterprise: true },
  { label: "Messaging", icon: MessageSquare, free: "Basic", pro: "+ Burn timer", enterprise: "+ Webhooks" },
  { label: "Audit Log Retention", icon: Activity, free: "30 days", pro: "1 year", enterprise: "Unlimited" },
  { label: "Cold Archive (LZMA)", icon: HardDrive, free: false, pro: true, enterprise: true },
  { label: "Dead Man's Switch", icon: Zap, free: false, pro: "Beta", enterprise: true },
  { label: "Steganography", icon: Eye, free: false, pro: "Beta", enterprise: true },
  { label: "API Access", icon: Zap, free: false, pro: false, enterprise: true },
  { label: "Team Vaults", icon: Users, free: false, pro: false, enterprise: true },
];

function CmpCell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-5 h-5 text-safe mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-primary-100/20 mx-auto" />;
  return <span className="text-sm text-primary-100/70 font-medium">{value}</span>;
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb-top-left" />
        <div className="orb-bottom-right" />
        <div className="absolute inset-0 dot-bg opacity-20" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Back nav */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-100/40 hover:text-primary-100/80 text-sm transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-accent-500/70 mb-4 font-code">
            Transparent Pricing
          </p>
          <h1 className="font-display font-extrabold text-5xl md:text-6xl text-primary-100 mb-5">
            Privacy That{" "}
            <span className="text-accent-500 glow-text">Scales With You</span>
          </h1>
          <p className="text-primary-100/48 text-lg max-w-xl mx-auto mb-8">
            Start free, stay private. All plans include full zero-knowledge encryption.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3">
            <span className={`text-sm font-medium transition-colors ${!annual ? "text-primary-100" : "text-primary-100/38"}`}>Monthly</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setAnnual(v => !v)}
              className={`relative w-12 h-6 rounded-full transition-all ${annual ? "bg-accent-500" : "bg-primary-300"}`}
            >
              <motion.div
                animate={{ x: annual ? 24 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
              />
            </motion.button>
            <span className={`text-sm font-medium transition-colors ${annual ? "text-primary-100" : "text-primary-100/38"}`}>
              Annual
              <span className="ml-2 bg-safe/15 text-safe text-xs font-bold px-2 py-0.5 rounded-full border border-safe/25">
                Save 22%
              </span>
            </span>
          </div>
        </motion.div>

        {/* Plans */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20"
        >
          {PLANS.map(plan => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                variants={item}
                whileHover={{ y: plan.highlight ? -8 : -4 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className={`relative glass-card rounded-2xl p-7 flex flex-col border-2 ${plan.borderColor} ${plan.highlight ? "shadow-lg shadow-accent-500/10" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="feature-badge feature-badge-core px-4 py-1.5 text-xs whitespace-nowrap bg-accent-500 text-primary-900 rounded-full font-bold">
                      <Star className="inline w-3 h-3 mr-1" />{plan.badge}
                    </div>
                  </div>
                )}

                {/* Icon & name */}
                <div className="flex items-start gap-3 mb-5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${plan.highlight ? "bg-accent-900/50 border border-accent-800/50" : "bg-primary-700/50 border border-white/8"}`}>
                    <Icon className={`w-5 h-5 ${plan.highlight ? "text-accent-500" : "text-primary-100/55"}`} />
                  </div>
                  <div>
                    <h2 className={`font-display font-bold text-lg ${plan.highlight ? "text-primary-100" : "text-primary-100/80"}`}>{plan.name}</h2>
                    <p className={`text-sm ${plan.highlight ? "text-primary-100/48" : "text-primary-100/35"}`}>{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.price.monthly === null ? (
                    <div>
                      <p className="font-display font-extrabold text-3xl text-primary-100">Custom</p>
                      <p className="text-primary-100/35 text-sm mt-0.5">Contact for quote</p>
                    </div>
                  ) : plan.price.monthly === 0 ? (
                    <div>
                      <p className="font-display font-extrabold text-4xl text-primary-100">Free</p>
                      <p className="text-primary-100/35 text-sm mt-0.5">Forever</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-end gap-1">
                        <p className="font-display font-extrabold text-4xl text-primary-100">
                          ${annual ? plan.price.annual : plan.price.monthly}
                        </p>
                        <span className="text-primary-100/35 text-sm mb-1">/month</span>
                      </div>
                      {annual && <p className="text-xs text-safe font-code mt-0.5">Billed annually — save ${((plan.price.monthly! - plan.price.annual!) * 12)}/year</p>}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Link href={plan.ctaHref}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full ${plan.ctaClass} flex items-center justify-center gap-2 py-3 font-bold rounded-xl text-sm mb-6`}
                  >
                    {plan.cta} <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map(f => (
                    <li key={f.label} className="flex items-center gap-2.5 text-sm">
                      {f.included
                        ? <Check className="w-4 h-4 text-safe flex-shrink-0" />
                        : <X className="w-3.5 h-3.5 text-primary-100/18 flex-shrink-0" />
                      }
                      <span className={f.included ? "text-primary-100/75" : "text-primary-100/28 line-through decoration-white/15"}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl overflow-hidden mb-16"
        >
          <div className="px-6 py-5 border-b border-white/5">
            <h2 className="font-display font-bold text-xl text-primary-100">Full Feature Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs text-primary-100/38 font-code uppercase tracking-widest w-2/5">Feature</th>
                  <th className="text-center px-4 py-4 text-xs text-primary-100/38 font-code uppercase tracking-widest">Free</th>
                  <th className="text-center px-4 py-4 text-xs text-accent-400 font-code uppercase tracking-widest">Pro</th>
                  <th className="text-center px-4 py-4 text-xs text-primary-100/38 font-code uppercase tracking-widest">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => {
                  const Icon = row.icon;
                  return (
                    <tr key={row.label} className={`border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-accent-500/55 flex-shrink-0" />
                          <span className="text-sm text-primary-100/70">{row.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center"><CmpCell value={row.free} /></td>
                      <td className="px-4 py-4 text-center"><CmpCell value={row.pro} /></td>
                      <td className="px-4 py-4 text-center"><CmpCell value={row.enterprise} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Enterprise CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-ultra rounded-3xl p-10 text-center"
        >
          <Users className="w-10 h-10 text-accent-500 mx-auto mb-4 glow-icon" />
          <h2 className="font-display font-extrabold text-3xl text-primary-100 mb-3">
            Need a custom deployment?
          </h2>
          <p className="text-primary-100/45 mb-6 max-w-md mx-auto">
            Self-hosted instances, HSM integration, custom encryption policies, and compliance reporting available for enterprise customers.
          </p>
          <a href="mailto:enterprise@securevault.io">
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="btn-primary flex items-center gap-2 px-9 py-4 font-bold rounded-xl mx-auto"
            >
              <Users className="w-5 h-5" />
              Talk to Enterprise Sales
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </a>
        </motion.div>
      </div>
    </div>
  );
}