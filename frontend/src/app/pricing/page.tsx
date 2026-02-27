"use client";

import { motion } from "framer-motion";
import { Shield, CheckCircle, Zap, Users, Building2, Star, ArrowRight, Lock, Key } from "lucide-react";
import Link from "next/link";

const container: any = { hidden:{opacity:0}, show:{opacity:1,transition:{staggerChildren:0.1}} };
const item: any = { hidden:{y:24,opacity:0}, show:{y:0,opacity:1,transition:{type:"spring",stiffness:100}} };

const PLANS = [
  {
    id: "free",
    name: "Personal",
    tagline: "For the privacy-conscious individual",
    price: "Free",
    period: "forever",
    icon: Shield,
    highlight: false,
    features: [
      "5 GB Encrypted Storage",
      "Hot + Warm Storage Tiers",
      "Unlimited E2E Messages",
      "RSA-2048 Key Pair",
      "AES-256 File Encryption",
      "Audit Log (30 days)",
      "Basic Burn-After-Read",
    ],
    cta: "Get Started Free",
    href: "/auth?mode=register",
  },
  {
    id: "pro",
    name: "Vault Pro",
    tagline: "For power users and professionals",
    price: "$12",
    period: "per month",
    icon: Zap,
    highlight: true,
    features: [
      "100 GB Encrypted Storage",
      "All 3 Storage Tiers (incl. Cold)",
      "Unlimited E2E Messages",
      "Vault Sharing with Contacts",
      "Steganography (Hidden Volumes)",
      "Dead Man's Switch",
      "Audit Log (1 year)",
      "Priority Decryption Queue",
      "Advanced Burn-After-Read",
    ],
    cta: "Start Pro Trial",
    href: "/auth?mode=register",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For teams requiring compliance",
    price: "Custom",
    period: "contact us",
    icon: Building2,
    highlight: false,
    features: [
      "Unlimited Storage",
      "Team Vault Management",
      "Hierarchical Key Authority",
      "Custom PBKDF2 Iteration Count",
      "HIPAA / SOC2 Compliance Tools",
      "Dedicated MongoDB Cluster",
      "SLA + Uptime Guarantee",
      "Immutable Audit Log (unlimited)",
      "On-premise deployment option",
      "Dedicated Support + SLA",
    ],
    cta: "Contact Sales",
    href: "mailto:enterprise@securevault.io",
  },
];

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-primary-100/65">
      <CheckCircle className="w-4 h-4 text-accent-500/80 flex-shrink-0 mt-0.5" />
      {text}
    </li>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb-top-left" />
        <div className="orb-bottom-right" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-500/70 mb-3 font-code">
            Transparent Pricing
          </p>
          <h1 className="font-display font-extrabold text-5xl md:text-6xl text-primary-100 mb-4">
            Privacy Shouldn&apos;t Cost{" "}
            <span className="text-accent-500 glow-text">a Fortune</span>
          </h1>
          <p className="text-primary-100/50 text-lg max-w-2xl mx-auto">
            Start free. Upgrade when you need more storage or advanced features.
            Enterprise plans for teams with compliance requirements.
          </p>
        </motion.div>

        {/* Plans */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {PLANS.map(({ id, name, tagline, price, period, icon: Icon, highlight, features, cta, href }) => (
            <motion.div
              key={id}
              variants={item}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 250 }}
              className={`glass-card rounded-2xl p-7 relative flex flex-col ${
                highlight ? "border-2 border-accent-500/40" : ""
              }`}
            >
              {highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-accent-500 text-primary-900 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap">
                    <Star className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                highlight ? "bg-accent-900/40 border border-accent-800/50" : "bg-secondary-800/50 border border-secondary-500/30"
              }`}>
                <Icon className={`w-6 h-6 ${highlight ? "text-accent-500" : "text-primary-100/50"}`} />
              </div>

              <h2 className="font-display font-extrabold text-2xl text-primary-100 mb-1">{name}</h2>
              <p className="text-primary-100/40 text-sm mb-6">{tagline}</p>

              <div className="mb-6">
                <span className={`font-display font-extrabold text-4xl ${highlight ? "text-accent-500 glow-text" : "text-primary-100"}`}>
                  {price}
                </span>
                <span className="text-primary-100/40 text-sm ml-2 font-code">{period}</span>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {features.map(f => <CheckItem key={f} text={f} />)}
              </ul>

              <Link href={href}>
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-xl ${
                    highlight
                      ? "btn-primary"
                      : "btn-ghost"
                  }`}
                >
                  {cta}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Security guarantee */}
        <motion.div
          initial={{ opacity:0, y:20 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          className="glass-ultra rounded-2xl p-8 text-center"
        >
          <h3 className="font-display font-bold text-2xl text-primary-100 mb-4">
            Zero-Knowledge Guarantee — Across All Plans
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Lock,   label:"AES-256",            sub:"All tiers" },
              { icon: Key,    label:"RSA-2048",            sub:"All tiers" },
              { icon: Shield, label:"PBKDF2 Key Deriv.",  sub:"All tiers" },
              { icon: Users,  label:"No Plaintext Access", sub:"Guaranteed" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="glass rounded-xl p-4 text-center">
                <Icon className="w-5 h-5 text-accent-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-primary-100">{label}</p>
                <p className="text-[10px] text-primary-100/30 font-code mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}