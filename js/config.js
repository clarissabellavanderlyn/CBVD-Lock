// Central configuration. Replace placeholder URLs with production assets/integrations.
export const APP_CONFIG = {
  name: "CBVD Lock",
  version: "3.0.6",
  currency: "USD",
  environment: "production",
  storageKey: "cbvd-lock-state-v5",
  locale: "en-US",
  adminWhatsApp: "6285706800428",
};

export const ASSETS = {
  // Replace these temporary online placeholders with the real product assets.
  productLogo: "assets/images/logo.jpeg",
  productPreviews: [
  "assets/images/preview_1.jpg",
  "assets/images/preview_2.jpg",
  "assets/images/preview_3.jpg",
  "assets/images/preview_4.jpg",
  "assets/images/preview_5.jpg",
  "assets/images/preview_6.jpg",
  "assets/images/preview_7.jpg",
  "assets/images/preview_8.jpg",
  "assets/images/preview_9.jpg",
  "assets/images/preview_10.jpg",
  "assets/images/preview_11.jpg",
  "assets/images/preview_12.jpg",
  "assets/images/preview_13.jpg",
  "assets/images/preview_14.jpg",
  "assets/images/preview_15.jpg",
  "assets/images/preview_16.jpg",
  "assets/images/preview_17.jpg",
  "assets/images/preview_18.jpg",
  "assets/images/preview_19.jpg",
  "assets/images/preview_20.jpg",
  "assets/images/preview_21.jpg",
  "assets/images/preview_22.jpg",
  "assets/images/preview_23.jpg",
  "assets/images/preview_24.jpg",
  "assets/images/preview_25.jpg",
  "assets/images/preview_26.jpg",
  "assets/images/preview_27.jpg",
  "assets/images/preview_28.jpg",
  "assets/images/preview_29.jpg",
  "assets/images/preview_30.jpg",
  "assets/images/preview_31.jpg",
  "assets/images/preview_32.jpg",
  "assets/images/preview_33.jpg",
  "assets/images/preview_34.jpg",
  "assets/images/preview_35.jpg",
  "assets/images/preview_36.jpg",
  "assets/images/preview_37.jpg",
  "assets/images/preview_38.jpg",
  "assets/images/preview_39.jpg",
  "assets/images/preview_40.jpg",
  "assets/images/preview_41.jpg",
  "assets/images/preview_42.jpg",
  "assets/images/preview_43.jpg",
  "assets/images/preview_44.jpg",
  "assets/images/preview_45.jpg",
  "assets/images/preview_46.jpg",
  "assets/images/preview_47.jpg",
  "assets/images/preview_48.jpg",
  "assets/images/preview_49.jpg",
  "assets/images/preview_50.jpg",
  "assets/images/preview_51.jpg"
],
  pwaIcon192: "assets/icons/icon-192.png",
  pwaIcon512: "assets/icons/icon-512.png",
  ogImage: "assets/images/og-image.svg"
};

// ==========================================================================
// FREE ACCOUNT CONFIGURATION
// ==========================================================================

export const FREE_ACCOUNT = {
  name: "Free Account",

  status: "Free Access",

  description:
    "A complimentary access package that gives you essential account guidance, support resources, and a clear overview of what is available in the Sultan Account.",

  /*
   * These are the capabilities available without purchasing
   * the Sultan Account.
   *
   * They are intentionally derived from the same product ecosystem,
   * but do not expose premium in-game content or premium ownership.
   */
  includedFeatures: [
    "Basic account access",
    "Account information overview",
    "Instant access guidance",
    "Simple access instructions",
    "Easy account setup guidance",
    "Device compatibility guidance",
    "Platform linking assistance",
    "Getting started guide",
    "Account usage guidance",
    "Account issue reporting",
    "Basic technical guidance",
    "Security information",
    "Account status information",
    "Customer service follow-up",
    "Premium feature overview",
    "Activity history"
  ],

  /*
   * Capabilities that belong to the paid Sultan Account.
   *
   * These are rendered dynamically from PRODUCT / FEATURE_CATEGORIES
   * so the Free Account page always reflects the current Premium
   * feature catalog.
   */
  premiumCategories: [
    "account-content",
    "currencies-resources",
    "progression-gameplay",
    "account-features",
    "account-access",
    "delivery-handover",
    "purchase-transaction",
    "support-assistance",
    "security-assurance"
  ],

  /*
   * Features that should remain available as free-access
   * capabilities even though they originate from the broader
   * Sultan Account feature catalog.
   */
  freeFeatureOverrides: [
    "Instant Account Access",
    "Easy Account Setup",
    "Simple Access Instructions",
    "Device Compatibility Guidance",
    "Platform Linking Assistance",
    "Getting Started Guide",
    "Account Usage Guidance",
    "Account Issue Reporting",
    "Technical Troubleshooting Support",
    "Account Access Support",
    "Customer Service Follow-Up",
    "Account Status Verification",
    "Linked Account Status Information",
    "Account Security Configuration Check"
  ],

  /*
   * The real download package is not available yet.
   * Keep this empty until the actual file exists.
   */
  downloadUrl: "",

  /*
   * Existing Premium product section.
   */
  premiumTarget: "#product"
};

export const FEATURE_CATEGORIES = [
  { id: 'account-content', title: 'Account Content', description: 'Everything included in the account itself.', icon: 'package-check', features: ["Sultan Account access", "Premium-ready account setup", "Unlock All Items", "Unlock All Gadgets", "Unlock All Shapes", "Unlock All Mojis", "Unlock All Coachicons", "Unlock All Cups", "Unlock All Events", "Unlock VIP Lockers", "Exclusive collection access", "Full Content Access", "Complete Premium Unlocks", "All Available Content Included"] },
  { id: 'currencies-resources', title: 'Currencies & Resources', description: 'Currencies, fortunes, gems, golds, and tickets.', icon: 'coins', features: ["Massive Amount of Currency", "Massive Amount of Fortunes", "Massive Amount of Gems", "Massive Amount of Golds", "Massive Amount of Tickets", "Massive Amount of Power Grind Tickets", "Massive Amount of Stadium", "Massive Amount of Legendaring Collection Draw Tokens", "Massive Amount of Human Collection Draw Tokens", "Massive Amount of Yummy Collection Draw Tokens", "Massive Amount of Spooky Collection Draw Tokens", "Massive Amount of Technomek Collection Draw Tokens", "Massive Amount of Footprint", "Massive Amount of Vulcano", "Massive Amount of Squadpower", "Massive Amount of Leaf", "Massive Amount of Jungle", "Massive Amount of Interstitial", "Massive Amount of Referral Friends", "Massive Amount of Zeni", "Massive Amount of Books", "Massive Amount of XP", "Massive Amount of Gadget Asset Tickets", "Massive Amount of Candy Canes", "Massive Amount of Dollars", "Massive Amount of Stars", "Massive Amount of Gauge Wheels", "Massive Amount of Rare Wild Cards", "Massive Amount of Epic Wild Cards", "Massive Amount of Legendary Wild Cards"] },
  { id: 'progression-gameplay', title: 'Progression & Gameplay', description: 'Ready-to-play progression and long-term gameplay value.', icon: 'trophy', features: ["High-value in-game progression", "High-value in-game trophy progression", "High-value in-game power progression", "High-value in-game abilities progression", "High-value in-game abilities head start run progression", "High-value in-game abilities head start swim progression", "High-value in-game abilities head start climb progression", "High-value in-game abilities head start fly progression", "High-value in-game abilities final dash run progression", "High-value in-game abilities final dash swim progression", "High-value in-game abilities final dash climb progression", "High-value in-game abilities final dash fly progression", "High-value in-game power run progression", "High-value in-game power swim progression", "High-value in-game power climb progression", "High-value in-game power fly progression", "Head start run maximum", "Head start swim maximum", "Head start climb maximum", "Head start fly maximum", "Ready for immediate use", "Maximum Gameplay Progression", "Ready-to-Play Experience", "No Additional Unlocking Required", "Premium Gameplay Experience", "Long-Term Progress Support", "A large amount of Trophy", "A large amount of Pulse Cup", "A large amount of Legend Cup", "A large amount of Boo Cup", "A large amount of Techno Cup", "A large amount of Yummy Cup"] },
  { id: 'account-features', title: 'Account Features', description: 'Platform saves, device support, and useful account capabilities.', icon: 'sliders-horizontal', features: ["Save Progress with Game Center", "Save Progress with Google Play", "Save Progress with Facebook", "All ads permanently removed", "Cross-Platform Progress Support", "Multiple Device Login Support", "Device Compatibility Guidance", "Platform Linking Assistance"] },
  { id: 'account-access', title: 'Account & Access', description: 'Access details, ownership, setup, recovery, and login guidance.', icon: 'key-round', features: ["Instant Account Access", "Account Details Provided After Purchase", "Easy Account Setup", "Simple Access Instructions", "Account Login Credentials Included", "Personal Account Ownership", "Account Recovery Information", "Password Change Capability", "Account Transfer Guidance"] },
  { id: 'delivery-handover', title: 'Delivery & Handover', description: 'Clear digital delivery and account handover workflow.', icon: 'package-open', features: ["Digital delivery workflow", "Customer support handoff", "Secure Account Handover", "Digital Account Delivery", "Verified Account Before Delivery", "Delivery Status Updates", "Pre-Delivery Account Verification"] },
  { id: 'purchase-transaction', title: 'Purchase & Transaction', description: 'Purchase records, confirmation, receipts, and order status.', icon: 'receipt-text', features: ["Order reference tracking", "One-time purchase", "Clear purchase status", "Purchase Confirmation", "Purchase Receipt", "Transaction Record", "Order History Access", "Purchase Verification"] },
  { id: 'support-assistance', title: 'Support & Assistance', description: 'Post-purchase help, troubleshooting, and customer support.', icon: 'headset', features: ["Post-Purchase Assistance", "Dedicated Customer Support", "Account Issue Reporting", "Technical Troubleshooting Support", "Account Access Support", "Getting Started Guide", "Account Usage Guidance", "Customer Service Follow-Up"] },
  { id: 'security-assurance', title: 'Security & Assurance', description: 'Safety and assurance information for the account.', icon: 'shield-check', features: ["Account safety assurance — 100% safe and not banned", "Account Status Verification", "Linked Account Status Information", "Account Ownership Verification", "Account Access & Login Verification", "Account Security Configuration Check", "Account Restriction & Suspension Check", "Account Recovery Information"] }
];

export const PRODUCT = {
  id: "pocket-champs-sultan-account",
  title: "Pocket Champs Sultan Account",
  price: 8.90,
  currency: "USD",
  description: "Step into a more exclusive Pocket Champs experience with the Sultan Account — thoughtfully curated with premium features and ready for your next race.",
  features: FEATURE_CATEGORIES.flatMap(category => category.features),
  checkoutUrl: "#",
  accessUrl: "#",
  payment: {
    status: "Awaiting payment",
    method: "Payment confirmation via WhatsApp Admin",
    adminLabel: "Admin CBVD Lock",
    adminWhatsAppDisplay: "Official Support",
    note: "Bank account or e-wallet details will be provided by the admin during confirmation. Do not transfer to any other number or account."
  }
};

export const unlockRequirements = [
  {
    id: "youtube-subscribe",
    title: "Subscribe to YouTube Channel",
    description: "Open the YouTube channel, subscribe, then return here to verify this step.",
    icon: "play-circle",
    actionLabel: "Open Channel",
    url: "https://www.youtube.com/@ClarissaBellaVanDerlyn",
    required: true
  },
  {
    id: "youtube-like-comment",
    title: "Like & Comment on Video",
    description: "Open the video, like it and leave a comment, then return here to verify this step.",
    icon: "message-circle",
    actionLabel: "Open Video",
    url: "https://youtu.be/WfKxR41jQhk?si=RIZFa01VaNd2FtqP",
    required: true
  },
  {
    id: "youtube-like-share",
    title: "Like & Share Video",
    description: "Open the video, like it and share it, then return here to verify this step.",
    icon: "share-2",
    actionLabel: "Open Video",
    url: "https://youtu.be/WfKxR41jQhk?si=RIZFa01VaNd2FtqP",
    required: true
  }
];
