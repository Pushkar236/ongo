import type { LucideIcon } from "lucide-react";
import {
  Globe,
  ShoppingCart,
  Code2,
  LayoutTemplate,
  Paintbrush,
  Wrench,
  Rocket,
  Smartphone,
  Search,
  Sparkles,
  Star,
  Headset,
  Timer,
  ShieldCheck,
} from "lucide-react";

export type NavLink = { label: string; href: string };

export const navLinks: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export type Feature = { title: string; description: string; icon: LucideIcon };

export const aboutFeatures: Feature[] = [
  {
    title: "Fast Delivery",
    description: "Launch-ready sites shipped in days, not months.",
    icon: Rocket,
  },
  {
    title: "Mobile Responsive",
    description: "Pixel-perfect on every screen, from phone to 4K.",
    icon: Smartphone,
  },
  {
    title: "SEO Optimized",
    description: "Built to rank — clean markup, speed, and structure.",
    icon: Search,
  },
  {
    title: "Modern Design",
    description: "Premium, future-facing interfaces that convert.",
    icon: Sparkles,
  },
];

export type Service = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: "blue" | "cyan" | "purple";
};

export const services: Service[] = [
  {
    title: "Business Websites",
    description:
      "Polished, conversion-driven corporate sites that build instant trust with your audience.",
    icon: Globe,
    accent: "blue",
  },
  {
    title: "E-Commerce Development",
    description:
      "Fast, secure online stores with seamless checkout that turn browsers into buyers.",
    icon: ShoppingCart,
    accent: "cyan",
  },
  {
    title: "Custom Web Applications",
    description:
      "Tailored web apps and dashboards engineered around your unique business logic.",
    icon: Code2,
    accent: "purple",
  },
  {
    title: "Landing Pages",
    description:
      "High-converting, campaign-ready landing pages designed to capture leads and sales.",
    icon: LayoutTemplate,
    accent: "blue",
  },
  {
    title: "Website Redesign",
    description:
      "Transform dated sites into modern, high-performance digital experiences.",
    icon: Paintbrush,
    accent: "cyan",
  },
  {
    title: "Website Maintenance",
    description:
      "Ongoing updates, security, and optimization to keep you running flawlessly.",
    icon: Wrench,
    accent: "purple",
  },
];

export type Stat = {
  value: number;
  suffix: string;
  label: string;
  icon: LucideIcon;
  isText?: boolean;
  text?: string;
};

export const stats: Stat[] = [
  { value: 50, suffix: "+", label: "Projects Delivered", icon: Rocket },
  { value: 100, suffix: "%", label: "Client Satisfaction", icon: Star },
  {
    value: 0,
    suffix: "",
    label: "Turnaround",
    icon: Timer,
    isText: true,
    text: "Fast",
  },
  {
    value: 0,
    suffix: "",
    label: "Support",
    icon: Headset,
    isText: true,
    text: "Ongoing",
  },
];

export type Plan = {
  name: string;
  price: string;
  blurb: string;
  features: string[];
  popular?: boolean;
  accent: "blue" | "cyan" | "purple";
};

export const plans: Plan[] = [
  {
    name: "Starter Package",
    price: "₹19,999",
    blurb: "Perfect for getting your business online, fast.",
    features: ["Up to 5 Pages", "Mobile Responsive", "Contact Form", "SEO Setup"],
    accent: "cyan",
  },
  {
    name: "Business Package",
    price: "₹39,999",
    blurb: "Our most popular plan for growing businesses.",
    features: [
      "Up to 10 Pages",
      "Custom Design",
      "CMS Integration",
      "Advanced SEO",
    ],
    popular: true,
    accent: "blue",
  },
  {
    name: "Professional Package",
    price: "₹69,999",
    blurb: "Everything you need to scale and stand out.",
    features: [
      "Premium Design",
      "Booking System",
      "Advanced Features",
      "Priority Support",
    ],
    accent: "purple",
  },
];

export type Project = {
  title: string;
  category: string;
  description: string;
  // Tailwind gradient classes drive the lightweight, dependency-free preview.
  gradient: string;
  icon: LucideIcon;
};

export const projects: Project[] = [
  {
    title: "Restaurant Website",
    category: "Hospitality",
    description: "Menu, reservations & online ordering for a fine-dining brand.",
    gradient: "from-orange-500 via-rose-500 to-purple-600",
    icon: Globe,
  },
  {
    title: "Real Estate Website",
    category: "Property",
    description: "Listings, virtual tours & lead capture for a realty firm.",
    gradient: "from-blue-500 via-indigo-500 to-violet-600",
    icon: LayoutTemplate,
  },
  {
    title: "Fitness Website",
    category: "Health & Wellness",
    description: "Class booking & membership portal for a boutique gym.",
    gradient: "from-emerald-400 via-cyan-500 to-blue-600",
    icon: Rocket,
  },
  {
    title: "E-Commerce Store",
    category: "Retail",
    description: "Full storefront with cart, payments & inventory sync.",
    gradient: "from-cyan-400 via-sky-500 to-blue-600",
    icon: ShoppingCart,
  },
  {
    title: "SaaS Dashboard",
    category: "Web App",
    description: "Analytics dashboard with real-time data & role access.",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
    icon: Code2,
  },
  {
    title: "Educational Platform",
    category: "EdTech",
    description: "Courses, quizzes & progress tracking for online learning.",
    gradient: "from-sky-400 via-blue-500 to-indigo-600",
    icon: ShieldCheck,
  },
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  rating: number;
  initials: string;
  accent: "blue" | "cyan" | "purple";
};

export const testimonials: Testimonial[] = [
  {
    name: "Priya Sharma",
    role: "Founder, Spice Route Bistro",
    quote:
      "OnGo delivered our restaurant site in under a week. Online orders jumped 40% in the first month. Incredible team.",
    rating: 5,
    initials: "PS",
    accent: "blue",
  },
  {
    name: "Arjun Mehta",
    role: "CEO, NovaProp Realty",
    quote:
      "The website they built feels like a million-dollar brand. Our lead quality and volume have never been better.",
    rating: 5,
    initials: "AM",
    accent: "cyan",
  },
  {
    name: "Sara Khan",
    role: "Director, FitForge Studio",
    quote:
      "From design to launch, OnGo was fast, professional, and detail-obsessed. The booking system works flawlessly.",
    rating: 5,
    initials: "SK",
    accent: "purple",
  },
];

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "How much does a website cost?",
    answer:
      "Our website packages start at ₹19,999 for a clean 5-page business site and go up to ₹69,999 for a premium build with custom design, a booking system, and advanced features. Every package is customizable — tell us your goals and we'll give you a clear, fixed quote with no hidden costs.",
  },
  {
    question: "How long does it take to build a website?",
    answer:
      "Most websites are designed, built, and launched within 1–2 weeks. Simple landing pages can go live in just a few days, while larger e-commerce stores or custom web applications may take a little longer. We'll share a realistic timeline before we start.",
  },
  {
    question: "Do you build e-commerce stores and online shops?",
    answer:
      "Yes. We build fast, secure e-commerce websites with seamless checkout, payment integration, and inventory management — everything you need to start selling online and turn visitors into paying customers.",
  },
  {
    question: "Will my website be mobile-friendly and SEO-optimized?",
    answer:
      "Absolutely. Every OnGo website is fully responsive across phones, tablets, and desktops, and is built on a fast, SEO-ready foundation — clean code, proper structure, and quick load times — so your business can be found on Google.",
  },
  {
    question: "Do you offer website maintenance and support?",
    answer:
      "Yes. We provide ongoing maintenance, security updates, and performance optimization to keep your website running smoothly. You'll always have a team to call when you need a change or have a question.",
  },
  {
    question: "Can you redesign my existing website?",
    answer:
      "Definitely. We transform dated or underperforming websites into modern, high-converting experiences — keeping what works, fixing what doesn't, and giving your brand a premium new look that drives results.",
  },
];
