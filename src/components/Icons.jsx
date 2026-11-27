import React from "react";
import {
  FaExternalLinkAlt,
  FaDownload,
  FaGem,
  FaArrowRight,
  FaRegFileAlt,
  FaPaperPlane,
  FaRocket,
  FaLink,
  FaNetworkWired,
  FaAws,
  FaSalesforce,
  FaCreditCard,
  FaLock,
  FaUserShield,
  FaCogs,
  FaHdd,
  FaVial,
  FaCss3Alt,
  FaBolt,
  FaExchangeAlt,
  FaKey,
  FaReceipt,
  FaTasks,
  FaLinkedin,
  FaPhoneAlt,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaGlobeAmericas,
} from "react-icons/fa";
import {
  SiRubyonrails,
  SiRuby,
  SiReact,
  SiNextdotjs,
  SiSidekiq,
  SiVite,
  SiMui,
  SiTailwindcss,
  SiRedux,
  SiPostgresql,
  SiRedis,
  SiDocker,
  SiGithubactions,
  SiGithub,
  SiHubspot,
  SiQuickbooks,
  SiMoodle,
  SiStripe,
  SiPaddle,
  SiGoogle,
  SiJest,
  SiJavascript,
  SiTypescript,
  SiHtml5,
  SiGraphql,
  SiNodedotjs,
  SiPython,
  SiDjango,
  SiHotwire,
  SiStimulus,
  SiWhatsapp,
} from "react-icons/si";
import { DiHeroku } from "react-icons/di";
import { AiOutlineStock } from "react-icons/ai";
import { MdArchitecture } from "react-icons/md";

const DEFAULT_SIZE = 18;

export const IconArrow = ({ size = DEFAULT_SIZE, rotate = 0 }) => (
  <FaArrowRight size={size} style={{ transform: `rotate(${rotate}deg)` }} />
);

export const IconExternal = ({ size = DEFAULT_SIZE }) => (
  <FaExternalLinkAlt size={size} />
);

export const IconDownload = ({ size = DEFAULT_SIZE }) => (
  <FaDownload size={size} />
);

export const IconLinkedIn = ({ size = DEFAULT_SIZE, color = "#0A66C2" }) => (
  <FaLinkedin size={size} color={color} />
);

export const IconGitHub = ({ size = DEFAULT_SIZE, color = "#E6EDF3" }) => (
  <SiGithub size={size} color={color} />
);

export const IconWhatsApp = ({ size = DEFAULT_SIZE, color = "#25D366" }) => (
  <SiWhatsapp size={size} color={color} />
);

export const IconPhone = ({ size = DEFAULT_SIZE, color = "#4CAF50" }) => (
  <FaPhoneAlt size={size} color={color} />
);

export const IconLocation = ({ size = DEFAULT_SIZE, color = "#E53935" }) => (
  <FaMapMarkerAlt size={size} color={color} />
);

export const IconGlobe = ({ size = DEFAULT_SIZE, color = "#2196F3" }) => (
  <FaGlobeAmericas size={size} color={color} />
);

export const IconEducation = ({ size = DEFAULT_SIZE, color = "#6E97C2" }) => (
  <FaGraduationCap size={size} color={color} />
);

export const IconGem = ({ size = DEFAULT_SIZE, color = "#E0115F" }) => (
  <UprightRubyGem size={size} color={color} />
);

/** Custom Upright Red Ruby Gem SVG (standing straight, not tilted) */
export const UprightRubyGem = ({ size = DEFAULT_SIZE, color = "#CC0000" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path
      d="M6 3H18L22 9L12 21L2 9L6 3Z"
      fill={color}
      stroke={color}
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <path d="M6 3L12 9L18 3" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" />
    <path d="M12 9V21" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.5" />
    <path d="M2 9H22" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" />
    <path d="M6 3L2 9L12 9" fill="#FFFFFF" opacity="0.15" />
    <path d="M18 3L22 9L12 9" fill="#000000" opacity="0.15" />
  </svg>
);

// GitHub's and Next.js's marks are monochrome (no real "brand color" the way
// LinkedIn blue is one), so a single hardcoded hex reads fine on one theme and
// vanishes on the other — near-white is invisible on a light background,
// near-black is invisible on a dark one. Pick per the live theme instead.
function monochromeMarkColor() {
  const isLight = typeof document !== "undefined" && document.documentElement.classList.contains("light");
  return isLight ? "#181717" : "#E6EDF3";
}

/** Helper to retrieve standard authentic brand colors for technologies */
export function getTechColor(name = "") {
  if (!name) return "#6E97C2";
  const n = name.toLowerCase();
  if (n.includes("linkedin")) return "#0A66C2";
  if (n.includes("github")) return monochromeMarkColor();
  if (n.includes("whatsapp")) return "#25D366";
  if (n.includes("phone")) return "#4CAF50";
  if (n.includes("rails") || n.includes("ruby")) return "#CC0000";
  if (n.includes("next")) return monochromeMarkColor();
  if (n.includes("react")) return "#61DAFB";
  if (n.includes("sidekiq")) return "#D32F2F";
  if (n.includes("vite")) return "#646CFF";
  if (n.includes("material") || n.includes("mui")) return "#007FFF";
  if (n.includes("tailwind")) return "#06B6D4";
  if (n.includes("redux")) return "#764ABC";
  if (n.includes("postgres")) return "#4169E1";
  if (n.includes("redis")) return "#DC382D";
  if (n.includes("activejob")) return "#FF9800";
  if (n.includes("activestorage") || n.includes("s3")) return "#FF9900";
  if (n.includes("aws") || n.includes("amazon")) return "#FF9900";
  if (n.includes("docker")) return "#2496ED";
  if (n.includes("actions")) return "#2088FF";
  if (n.includes("heroku")) return "#6762A6";
  if (n.includes("hubspot")) return "#FF7A59";
  if (n.includes("salesforce")) return "#00A1E0";
  if (n.includes("quickbooks") || n.includes("qbo")) return "#2CA01C";
  if (n.includes("moodle")) return "#F7931E";
  if (n.includes("stripe")) return "#635BFF";
  if (n.includes("paddle")) return "#0066FF";
  if (n.includes("chargebee")) return "#FF6B00";
  if (n.includes("devise")) return "#E53935";
  if (n.includes("pundit")) return "#4CAF50";
  if (n.includes("oauth") || n.includes("google")) return "#4285F4";
  if (n.includes("rspec")) return "#C2185B";
  if (n.includes("jest")) return "#C21325";
  if (n.includes("javascript") || n.includes("js")) return "#F7DF1E";
  if (n.includes("typescript") || n.includes("ts")) return "#3178C6";
  if (n.includes("html")) return "#E34F26";
  if (n.includes("css")) return "#1572B6";
  if (n.includes("graphql")) return "#E10098";
  if (n.includes("node")) return "#5FA04E";
  if (n.includes("python")) return "#3776AB";
  if (n.includes("django")) return "#2BA977";
  if (n.includes("hotwire")) return "#F06292";
  if (n.includes("stimulus")) return "#4DB6AC";
  if (n.includes("websocket") || n.includes("cable")) return "#FFC107";
  if (n.includes("architecture")) return "#6E97C2";
  if (n.includes("integration")) return "#00BCD4";
  if (n.includes("payment")) return "#4CAF50";
  if (n.includes("auth")) return "#9C27B0";
  return "#6E97C2";
}

/** Render authentic, vibrant, brand-colored icons for any tech name */
export function IconForTech({ name = "", size = DEFAULT_SIZE, colored = true, colorOverride = null }) {
  if (!name) return <FaExternalLinkAlt size={size} />;
  const n = name.toLowerCase();

  const brandColor = colorOverride || (colored ? getTechColor(name) : "currentColor");

  if (n.includes("linkedin")) return <FaLinkedin size={size} color={brandColor} />;
  if (n.includes("github")) return <SiGithub size={size} color={brandColor} />;
  if (n.includes("whatsapp")) return <SiWhatsapp size={size} color={brandColor} />;
  if (n.includes("phone")) return <FaPhoneAlt size={size} color={brandColor} />;

  // Specific brand & tech mapping
  if (n.includes("rails 7") || n.includes("ruby on rails")) return <SiRubyonrails size={size} color={brandColor} />;
  if (n.includes("ruby")) return <UprightRubyGem size={size} color={brandColor} />;
  if (n.includes("next")) return <SiNextdotjs size={size} color={brandColor} />;
  if (n.includes("react")) return <SiReact size={size} color={brandColor} />;
  if (n.includes("sidekiq")) return <SiSidekiq size={size} color={brandColor} />;
  if (n.includes("vite")) return <SiVite size={size} color={brandColor} />;
  if (n.includes("material") || n.includes("mui")) return <SiMui size={size} color={brandColor} />;
  if (n.includes("tailwind")) return <SiTailwindcss size={size} color={brandColor} />;
  if (n.includes("redux")) return <SiRedux size={size} color={brandColor} />;
  if (n.includes("postgres")) return <SiPostgresql size={size} color={brandColor} />;
  if (n.includes("redis")) return <SiRedis size={size} color={brandColor} />;
  if (n.includes("activejob")) return <FaCogs size={size} color={brandColor} />;
  if (n.includes("activestorage") || n.includes("s3")) return <FaHdd size={size} color={brandColor} />;
  if (n.includes("aws") || n.includes("amazon") || n.includes("cloud")) return <FaAws size={size} color={brandColor} />;
  if (n.includes("docker")) return <SiDocker size={size} color={brandColor} />;
  if (n.includes("actions")) return <SiGithubactions size={size} color={brandColor} />;
  if (n.includes("heroku")) return <DiHeroku size={size} color={brandColor} />;
  if (n.includes("hubspot")) return <SiHubspot size={size} color={brandColor} />;
  if (n.includes("salesforce")) return <FaSalesforce size={size} color={brandColor} />;
  if (n.includes("quickbooks") || n.includes("qbo")) return <SiQuickbooks size={size} color={brandColor} />;
  if (n.includes("moodle")) return <SiMoodle size={size} color={brandColor} />;
  if (n.includes("stripe")) return <SiStripe size={size} color={brandColor} />;
  if (n.includes("paddle")) return <SiPaddle size={size} color={brandColor} />;
  if (n.includes("chargebee")) return <FaReceipt size={size} color={brandColor} />;
  if (n.includes("devise")) return <FaLock size={size} color={brandColor} />;
  if (n.includes("pundit")) return <FaUserShield size={size} color={brandColor} />;
  if (n.includes("oauth") || n.includes("google")) return <SiGoogle size={size} color={brandColor} />;
  if (n.includes("rspec")) return <FaVial size={size} color={brandColor} />;
  if (n.includes("jest")) return <SiJest size={size} color={brandColor} />;
  if (n.includes("javascript") || n.includes("js")) return <SiJavascript size={size} color={brandColor} />;
  if (n.includes("typescript") || n.includes("ts")) return <SiTypescript size={size} color={brandColor} />;
  if (n.includes("html")) return <SiHtml5 size={size} color={brandColor} />;
  if (n.includes("css")) return <FaCss3Alt size={size} color={brandColor} />;
  if (n.includes("graphql")) return <SiGraphql size={size} color={brandColor} />;
  if (n.includes("node")) return <SiNodedotjs size={size} color={brandColor} />;
  if (n.includes("python")) return <SiPython size={size} color={brandColor} />;
  if (n.includes("django")) return <SiDjango size={size} color={brandColor} />;
  if (n.includes("hotwire")) return <SiHotwire size={size} color={brandColor} />;
  if (n.includes("stimulus")) return <SiStimulus size={size} color={brandColor} />;
  if (n.includes("websocket") || n.includes("cable") || n.includes("actioncable")) return <FaBolt size={size} color={brandColor} />;

  // Section icons
  if (n === "architecture") return <MdArchitecture size={size} color={brandColor} />;
  if (n === "integrations" || n.includes("data & integrations")) return <FaNetworkWired size={size} color={brandColor} />;
  if (n === "payments" || n.includes("payments & billing")) return <FaCreditCard size={size} color={brandColor} />;
  if (n === "auth" || n.includes("auth & security")) return <FaUserShield size={size} color={brandColor} />;

  // Process / Workflow icons
  if (n.includes("doc") || n.includes("proposal") || n.includes("file")) return <FaRegFileAlt size={size} color={brandColor} />;
  if (n.includes("chat") || n.includes("discovery")) return <FaPaperPlane size={size} color={brandColor} />;
  if (n.includes("rocket") || n.includes("execution")) return <FaRocket size={size} color={brandColor} />;
  if (n.includes("link") || n.includes("handoff")) return <FaLink size={size} color={brandColor} />;
  if (n.includes("learning")) return <AiOutlineStock size={size} color={brandColor} />;

  // Fallback to upright Ruby gem icon
  return <UprightRubyGem size={size} color={brandColor} />;
}

export default IconForTech;
