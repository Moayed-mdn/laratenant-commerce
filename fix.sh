#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# LaraTenant Commerce — Marketing i18n Fix
#
# Root cause:
#   Project uses src/locales/{locale}/*.json (not messages/).
#   The marketing namespace was written to messages/ which is never loaded.
#
# Fix:
#   1. Write src/locales/en/marketing.json
#   2. Write src/locales/ar/marketing.json
#   3. Detect and update the i18n request config to load all JSON files
#      from src/locales/{locale}/ as named namespaces — if not already doing so.
# =============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCALES="$PROJECT_ROOT/src/locales"

echo "→ Writing marketing translation files into src/locales/..."

mkdir -p "$LOCALES/en"
mkdir -p "$LOCALES/ar"

# =============================================================================
# src/locales/en/marketing.json
# =============================================================================

cat > "$LOCALES/en/marketing.json" << 'EOF'
{
  "meta": {
    "home": {
      "title": "Multi-Tenant Ecommerce Platform",
      "description": "Launch and manage your ecommerce business with a scalable multi-tenant commerce platform built for modern brands and merchants."
    },
    "pricing": {
      "title": "Simple, Transparent Pricing",
      "description": "Choose a plan that fits your business. Scale your stores, products, and orders as you grow."
    },
    "features": {
      "title": "Platform Features",
      "description": "Explore the tools that help merchants manage stores, products, orders, and growth from a unified dashboard."
    },
    "enterprise": {
      "title": "Enterprise Commerce Solutions",
      "description": "Scalable commerce infrastructure for large brands, agencies, and multi-brand operators."
    },
    "templates": {
      "title": "Store Templates",
      "description": "Launch faster with professionally designed store templates built for modern ecommerce."
    }
  },

  "home": {
    "hero": {
      "badge": "Multi-Tenant Commerce Platform",
      "headline": "Run Multiple Stores From One Platform",
      "subtext": "Manage products, orders, and stores from a unified commerce dashboard. Built for merchants who operate at scale.",
      "primaryCta": "Start Selling",
      "secondaryCta": "View Demo",
      "previewAlt": "LaraTenant Commerce admin dashboard showing store overview, recent orders, and analytics"
    },

    "logos": {
      "label": "Trusted by merchants worldwide"
    },

    "features": {
      "eyebrow": "Platform Capabilities",
      "heading": "Everything You Need to Operate at Scale",
      "subtitle": "A complete commerce platform for merchants managing multiple stores, brands, and markets.",
      "items": {
        "multi-store": {
          "title": "Multi-Store Management",
          "description": "Operate multiple storefronts from a single dashboard. Each store is independently configurable with its own products, orders, and settings."
        },
        "orders": {
          "title": "Order Management",
          "description": "Track, process, and fulfill orders across all your stores. Centralized order workflows reduce operational overhead."
        },
        "products": {
          "title": "Product Catalog",
          "description": "Manage products, variants, inventory, and pricing across your entire catalog with structured, scalable tooling."
        },
        "analytics": {
          "title": "Analytics Dashboard",
          "description": "Understand store performance, sales trends, and merchant activity through clear, actionable data."
        },
        "localization": {
          "title": "Localization Support",
          "description": "Operate across markets with built-in multi-language and multi-currency support. RTL layouts included."
        },
        "permissions": {
          "title": "Role-Based Permissions",
          "description": "Control access at a granular level. Assign roles to team members and define exactly what they can see and do."
        },
        "performance": {
          "title": "Performance First",
          "description": "Built on modern infrastructure with fast load times, optimized rendering, and reliable uptime at every scale."
        },
        "api": {
          "title": "API Access",
          "description": "Integrate your existing tools and workflows through a structured API. Extend the platform without friction."
        }
      }
    },

    "showcase": {
      "heading": "A Dashboard Built for Merchant Productivity",
      "subtext": "Every workflow in LaraTenant Commerce is designed to reduce friction. From store setup to order fulfillment, your team works faster from day one.",
      "cta": "Start Selling",
      "previewAlt": "LaraTenant Commerce dashboard showing product management and order processing workflow"
    },

    "testimonials": {
      "eyebrow": "Merchant Stories",
      "heading": "Merchants Who Operate Smarter",
      "items": {
        "merchant-a": {
          "quote": "Managing three stores used to mean three separate systems. LaraTenant Commerce brought everything into one place and cut our operational time significantly.",
          "authorName": "Sara Al-Mansouri",
          "authorRole": "Head of Ecommerce",
          "authorCompany": "Retail Operations"
        },
        "merchant-b": {
          "quote": "The multi-currency and localization support was the deciding factor for us. We operate across four markets and needed a platform that could handle that from day one.",
          "authorName": "James Okafor",
          "authorRole": "Founder",
          "authorCompany": "Cross-Border Commerce"
        },
        "merchant-c": {
          "quote": "The permissions system is exactly what we needed. Different team members have access to exactly what they need — nothing more, nothing less.",
          "authorName": "Layla Hassan",
          "authorRole": "Operations Manager",
          "authorCompany": "Multi-Brand Group"
        },
        "merchant-d": {
          "quote": "Setup was straightforward and the dashboard is clean. Our team was fully operational within a day.",
          "authorName": "Carlos Mendez",
          "authorRole": "Store Owner",
          "authorCompany": "Independent Brand"
        },
        "merchant-e": {
          "quote": "Order management across multiple stores is where this platform really shines. Everything is centralized and the workflows make sense.",
          "authorName": "Priya Nair",
          "authorRole": "Ecommerce Director",
          "authorCompany": "D2C Brands"
        },
        "merchant-f": {
          "quote": "We evaluated several platforms. LaraTenant Commerce was the only one that handled multi-store operations without requiring custom development.",
          "authorName": "Ahmed Al-Rashid",
          "authorRole": "CTO",
          "authorCompany": "Commerce Group"
        }
      }
    },

    "pricing": {
      "eyebrow": "Pricing",
      "heading": "Simple Pricing. Serious Scale.",
      "subtitle": "Start with what you need. Upgrade as your business grows."
    },

    "faq": {
      "eyebrow": "FAQ",
      "heading": "Common Questions",
      "items": {
        "what-is-laratenant": {
          "question": "What is LaraTenant Commerce?",
          "answer": "LaraTenant Commerce is a multi-tenant ecommerce platform that lets merchants manage multiple stores, products, orders, and teams from a single unified dashboard. It is built for growing brands that need operational control without operational complexity."
        },
        "multi-store-support": {
          "question": "Can I manage multiple stores from one account?",
          "answer": "Yes. Multi-store management is a core feature of the platform. Each store is independently configurable with its own product catalog, order management, settings, and team permissions — all accessible from one dashboard."
        },
        "localization-support": {
          "question": "Does the platform support multiple languages and currencies?",
          "answer": "Yes. LaraTenant Commerce includes built-in localization support with multi-language interfaces, multi-currency pricing, and RTL layout support for Arabic and other right-to-left languages."
        },
        "how-to-get-started": {
          "question": "How do I get started?",
          "answer": "Create your account, set up your first store, and start adding products. The onboarding flow is designed to get merchants operational quickly without requiring technical knowledge."
        },
        "enterprise-options": {
          "question": "Do you offer enterprise or custom plans?",
          "answer": "Yes. Contact our team to discuss custom plans for large brands, agencies, and enterprise operators that need dedicated infrastructure, SLAs, or bespoke integrations."
        },
        "data-security": {
          "question": "How is merchant data protected?",
          "answer": "All data is stored securely with strict tenant isolation. Each store operates within its own boundary — data from one store is never accessible to another tenant on the platform."
        }
      }
    },

    "cta": {
      "title": "Ready to Manage Your Stores Smarter?",
      "description": "Join merchants who manage products, orders, and storefronts from a single, unified commerce platform.",
      "primaryCta": "Start Selling",
      "secondaryCta": "View Demo"
    }
  },

  "pricing": {
    "eyebrow": "Pricing",
    "heading": "Simple, Transparent Pricing",
    "subtitle": "No hidden fees. No lock-in. Scale your plan as your business grows.",

    "toggle": {
      "monthly": "Monthly",
      "annual": "Annual",
      "badge": "Save 17%"
    },

    "plans": {
      "starter": {
        "name": "Starter",
        "description": "For merchants launching their first store and getting started with online selling.",
        "cta": "Start Selling"
      },
      "growth": {
        "name": "Growth",
        "description": "For growing brands managing multiple stores and scaling their operations.",
        "cta": "Start Selling"
      },
      "enterprise": {
        "name": "Enterprise",
        "description": "For large brands and agencies that need custom infrastructure and dedicated support.",
        "cta": "Contact Sales"
      }
    },

    "features": {
      "stores1": "1 store",
      "stores5": "Up to 5 stores",
      "storesUnlimited": "Unlimited stores",
      "products500": "Up to 500 products",
      "productsUnlimited": "Unlimited products",
      "orders1k": "Up to 1,000 orders/month",
      "orders10k": "Up to 10,000 orders/month",
      "ordersUnlimited": "Unlimited orders",
      "analytics": "Analytics dashboard",
      "localization": "Localization and RTL support",
      "multiCurrency": "Multi-currency pricing",
      "apiAccess": "API access",
      "prioritySupport": "Priority support"
    },

    "faq": {
      "eyebrow": "Pricing FAQ",
      "heading": "Questions About Pricing",
      "items": {
        "free-trial": {
          "question": "Is there a free trial?",
          "answer": "Yes. You can explore the platform before committing to a paid plan. No credit card is required to start."
        },
        "change-plan": {
          "question": "Can I change my plan later?",
          "answer": "Yes. You can upgrade or downgrade your plan at any time. Changes take effect at the start of the next billing cycle."
        },
        "annual-discount": {
          "question": "What is included in the annual discount?",
          "answer": "Annual plans are billed once per year at a reduced rate equivalent to approximately two months free compared to monthly billing."
        },
        "cancel-anytime": {
          "question": "Can I cancel at any time?",
          "answer": "Yes. There are no long-term contracts. Cancel your subscription at any time from your account settings."
        },
        "payment-methods": {
          "question": "What payment methods are accepted?",
          "answer": "We accept major credit and debit cards. Enterprise customers can arrange invoiced billing with their account manager."
        },
        "enterprise-custom": {
          "question": "Can enterprise plans be customized?",
          "answer": "Yes. Enterprise plans are tailored to your requirements. Contact our team to discuss store limits, order volumes, SLAs, and custom integrations."
        }
      }
    },

    "cta": {
      "title": "Start Selling Today",
      "description": "Create your store and start managing products, orders, and growth from a unified platform.",
      "primaryCta": "Create Your Store",
      "secondaryCta": "Talk to Sales"
    }
  },

  "nav": {
    "features": "Features",
    "pricing": "Pricing",
    "enterprise": "Enterprise",
    "templates": "Templates",
    "blog": "Blog",
    "docs": "Docs"
  },

  "footer": {
    "groups": {
      "product": "Product",
      "resources": "Resources",
      "company": "Company"
    },
    "links": {
      "features": "Features",
      "pricing": "Pricing",
      "templates": "Templates",
      "enterprise": "Enterprise",
      "docs": "Documentation",
      "blog": "Blog",
      "about": "About",
      "contact": "Contact"
    }
  },

  "cta": {
    "startSelling": "Start Selling",
    "viewDemo": "View Demo",
    "exploreFeatures": "Explore Features",
    "viewPricing": "View Pricing",
    "contactSales": "Contact Sales",
    "login": "Sign In",
    "getStarted": "Get Started"
  }
}
EOF

echo "✓ src/locales/en/marketing.json"

# =============================================================================
# src/locales/ar/marketing.json
# =============================================================================

cat > "$LOCALES/ar/marketing.json" << 'EOF'
{
  "meta": {
    "home": {
      "title": "منصة تجارة إلكترونية متعددة المستأجرين",
      "description": "أطلق وأدر أعمالك التجارية الإلكترونية عبر منصة تجارة متطورة قابلة للتوسع، مصممة للعلامات التجارية والتجار المعاصرين."
    },
    "pricing": {
      "title": "أسعار واضحة وشفافة",
      "description": "اختر الخطة التي تناسب عملك. وسّع متاجرك ومنتجاتك وطلباتك مع نمو أعمالك."
    },
    "features": {
      "title": "مميزات المنصة",
      "description": "اكتشف الأدوات التي تساعد التجار على إدارة المتاجر والمنتجات والطلبات والنمو من لوحة تحكم موحدة."
    },
    "enterprise": {
      "title": "حلول تجارة المؤسسات",
      "description": "بنية تحتية تجارية قابلة للتوسع للعلامات التجارية الكبيرة والوكالات ومشغلي العلامات المتعددة."
    },
    "templates": {
      "title": "قوالب المتجر",
      "description": "أطلق متجرك بسرعة أكبر باستخدام قوالب متجر مصممة باحترافية لتجارة إلكترونية عصرية."
    }
  },

  "home": {
    "hero": {
      "badge": "منصة تجارة متعددة المستأجرين",
      "headline": "أدر متاجرك المتعددة من منصة واحدة",
      "subtext": "أدر المنتجات والطلبات والمتاجر من لوحة تحكم تجارية موحدة. مبنية للتجار الذين يعملون على نطاق واسع.",
      "primaryCta": "ابدأ البيع",
      "secondaryCta": "عرض تجريبي",
      "previewAlt": "لوحة تحكم LaraTenant Commerce تعرض نظرة عامة على المتجر والطلبات الأخيرة والتحليلات"
    },

    "logos": {
      "label": "موثوق به من قبل التجار حول العالم"
    },

    "features": {
      "eyebrow": "إمكانيات المنصة",
      "heading": "كل ما تحتاجه للعمل على نطاق واسع",
      "subtitle": "منصة تجارة متكاملة للتجار الذين يديرون متاجر وعلامات تجارية وأسواقاً متعددة.",
      "items": {
        "multi-store": {
          "title": "إدارة متعددة المتاجر",
          "description": "أدر واجهات متجر متعددة من لوحة تحكم واحدة. كل متجر قابل للتهيئة بشكل مستقل بمنتجاته وطلباته وإعداداته الخاصة."
        },
        "orders": {
          "title": "إدارة الطلبات",
          "description": "تتبع الطلبات ومعالجتها وتنفيذها عبر جميع متاجرك. تقلل سير عمل الطلبات المركزية من التكاليف التشغيلية."
        },
        "products": {
          "title": "كتالوج المنتجات",
          "description": "أدر المنتجات والمتغيرات والمخزون والتسعير عبر الكتالوج بأكمله بأدوات منظمة وقابلة للتطوير."
        },
        "analytics": {
          "title": "لوحة التحليلات",
          "description": "افهم أداء المتجر واتجاهات المبيعات ونشاط التاجر من خلال بيانات واضحة وقابلة للتنفيذ."
        },
        "localization": {
          "title": "دعم التوطين",
          "description": "العمل عبر الأسواق بدعم مدمج متعدد اللغات ومتعدد العملات. تشمل تخطيطات RTL."
        },
        "permissions": {
          "title": "الأذونات القائمة على الأدوار",
          "description": "تحكم في الوصول بمستوى دقيق. قم بتعيين أدوار لأعضاء الفريق وحدد بالضبط ما يمكنهم رؤيته وفعله."
        },
        "performance": {
          "title": "الأداء أولاً",
          "description": "مبني على بنية تحتية حديثة بأوقات تحميل سريعة وعرض محسّن وموثوقية عالية على كل مستوى."
        },
        "api": {
          "title": "وصول API",
          "description": "دمج أدواتك وسير عملك الحالية من خلال API منظم. وسّع المنصة دون احتكاك."
        }
      }
    },

    "showcase": {
      "heading": "لوحة تحكم مبنية لإنتاجية التاجر",
      "subtext": "كل سير عمل في LaraTenant Commerce مصمم لتقليل الاحتكاك. من إعداد المتجر إلى تنفيذ الطلبات، يعمل فريقك بشكل أسرع منذ اليوم الأول.",
      "cta": "ابدأ البيع",
      "previewAlt": "لوحة تحكم LaraTenant Commerce تعرض إدارة المنتجات وسير عمل معالجة الطلبات"
    },

    "testimonials": {
      "eyebrow": "قصص التجار",
      "heading": "تجار يعملون بذكاء أكبر",
      "items": {
        "merchant-a": {
          "quote": "إدارة ثلاثة متاجر كانت تعني ثلاثة أنظمة منفصلة. LaraTenant Commerce جمع كل شيء في مكان واحد وقلل وقتنا التشغيلي بشكل ملحوظ.",
          "authorName": "سارة المنصوري",
          "authorRole": "رئيسة التجارة الإلكترونية",
          "authorCompany": "عمليات التجزئة"
        },
        "merchant-b": {
          "quote": "دعم متعدد العملات والتوطين كان عامل الحسم بالنسبة لنا. نعمل في أربعة أسواق ونحتاج منصة يمكنها التعامل مع ذلك منذ البداية.",
          "authorName": "جيمس أوكافور",
          "authorRole": "مؤسس",
          "authorCompany": "تجارة عابرة للحدود"
        },
        "merchant-c": {
          "quote": "نظام الأذونات هو بالضبط ما احتجناه. أعضاء الفريق المختلفون لديهم وصول إلى ما يحتاجونه تماماً — لا أقل ولا أكثر.",
          "authorName": "ليلى حسن",
          "authorRole": "مدير العمليات",
          "authorCompany": "مجموعة العلامات التجارية المتعددة"
        },
        "merchant-d": {
          "quote": "الإعداد كان واضحاً ولوحة التحكم نظيفة. كان فريقنا يعمل بكفاءة كاملة خلال يوم واحد.",
          "authorName": "كارلوس مينديز",
          "authorRole": "صاحب المتجر",
          "authorCompany": "علامة تجارية مستقلة"
        },
        "merchant-e": {
          "quote": "إدارة الطلبات عبر متاجر متعددة هو المكان الذي تتألق فيه هذه المنصة حقاً. كل شيء مركزي وسير العمل منطقي.",
          "authorName": "بريا نير",
          "authorRole": "مدير التجارة الإلكترونية",
          "authorCompany": "علامات D2C"
        },
        "merchant-f": {
          "quote": "قيّمنا عدة منصات. LaraTenant Commerce كانت الوحيدة التي تعاملت مع عمليات متعددة المتاجر دون الحاجة إلى تطوير مخصص.",
          "authorName": "أحمد الراشد",
          "authorRole": "مدير تقني",
          "authorCompany": "مجموعة التجارة"
        }
      }
    },

    "pricing": {
      "eyebrow": "الأسعار",
      "heading": "أسعار بسيطة. توسع جاد.",
      "subtitle": "ابدأ بما تحتاجه. رقّ خطتك مع نمو أعمالك."
    },

    "faq": {
      "eyebrow": "الأسئلة الشائعة",
      "heading": "أسئلة شائعة",
      "items": {
        "what-is-laratenant": {
          "question": "ما هو LaraTenant Commerce؟",
          "answer": "LaraTenant Commerce هو منصة تجارة إلكترونية متعددة المستأجرين تتيح للتجار إدارة متاجر وفرق ومنتجات وطلبات متعددة من لوحة تحكم موحدة واحدة. مبنية للعلامات التجارية النامية التي تحتاج إلى سيطرة تشغيلية دون تعقيد تشغيلي."
        },
        "multi-store-support": {
          "question": "هل يمكنني إدارة متاجر متعددة من حساب واحد؟",
          "answer": "نعم. إدارة متعددة المتاجر هي ميزة أساسية في المنصة. كل متجر قابل للتهيئة بشكل مستقل بكتالوج منتجاته الخاص وإدارة الطلبات والإعدادات وأذونات الفريق — كل ذلك من لوحة تحكم واحدة."
        },
        "localization-support": {
          "question": "هل تدعم المنصة لغات وعملات متعددة؟",
          "answer": "نعم. يتضمن LaraTenant Commerce دعماً مدمجاً للتوطين مع واجهات متعددة اللغات وتسعير متعدد العملات ودعم تخطيط RTL للعربية وغيرها من اللغات التي تُكتب من اليمين إلى اليسار."
        },
        "how-to-get-started": {
          "question": "كيف أبدأ؟",
          "answer": "أنشئ حسابك، وقم بإعداد متجرك الأول، وابدأ في إضافة المنتجات. تدفق الإعداد مصمم لتشغيل التجار بسرعة دون الحاجة إلى معرفة تقنية."
        },
        "enterprise-options": {
          "question": "هل تقدمون خططاً للمؤسسات أو مخصصة؟",
          "answer": "نعم. تواصل مع فريقنا لمناقشة الخطط المخصصة للعلامات التجارية الكبيرة والوكالات ومشغلي المؤسسات الذين يحتاجون إلى بنية تحتية مخصصة أو اتفاقيات مستوى خدمة أو تكاملات خاصة."
        },
        "data-security": {
          "question": "كيف تتم حماية بيانات التاجر؟",
          "answer": "يتم تخزين جميع البيانات بشكل آمن مع عزل صارم للمستأجرين. كل متجر يعمل ضمن حدوده الخاصة — لا يمكن لمستأجر آخر على المنصة الوصول إلى بيانات متجر آخر."
        }
      }
    },

    "cta": {
      "title": "هل أنت مستعد لإدارة متاجرك بذكاء أكبر؟",
      "description": "انضم إلى التجار الذين يديرون المنتجات والطلبات والواجهات التجارية من منصة تجارة موحدة واحدة.",
      "primaryCta": "ابدأ البيع",
      "secondaryCta": "عرض تجريبي"
    }
  },

  "pricing": {
    "eyebrow": "الأسعار",
    "heading": "أسعار بسيطة وشفافة",
    "subtitle": "لا رسوم خفية. لا قيود. طوّر خطتك مع نمو أعمالك.",

    "toggle": {
      "monthly": "شهري",
      "annual": "سنوي",
      "badge": "وفر 17٪"
    },

    "plans": {
      "starter": {
        "name": "المبتدئ",
        "description": "للتجار الذين يطلقون متجرهم الأول ويبدأون رحلة البيع عبر الإنترنت.",
        "cta": "ابدأ البيع"
      },
      "growth": {
        "name": "النمو",
        "description": "للعلامات التجارية النامية التي تدير متاجر متعددة وتوسع عملياتها.",
        "cta": "ابدأ البيع"
      },
      "enterprise": {
        "name": "المؤسسات",
        "description": "للعلامات التجارية الكبيرة والوكالات التي تحتاج إلى بنية تحتية مخصصة ودعم متميز.",
        "cta": "تواصل مع المبيعات"
      }
    },

    "features": {
      "stores1": "متجر واحد",
      "stores5": "حتى 5 متاجر",
      "storesUnlimited": "متاجر غير محدودة",
      "products500": "حتى 500 منتج",
      "productsUnlimited": "منتجات غير محدودة",
      "orders1k": "حتى 1,000 طلب شهرياً",
      "orders10k": "حتى 10,000 طلب شهرياً",
      "ordersUnlimited": "طلبات غير محدودة",
      "analytics": "لوحة التحليلات",
      "localization": "دعم التوطين وRTL",
      "multiCurrency": "تسعير متعدد العملات",
      "apiAccess": "وصول API",
      "prioritySupport": "دعم ذو أولوية"
    },

    "faq": {
      "eyebrow": "أسئلة الأسعار",
      "heading": "أسئلة حول الأسعار",
      "items": {
        "free-trial": {
          "question": "هل هناك فترة تجريبية مجانية؟",
          "answer": "نعم. يمكنك استكشاف المنصة قبل الالتزام بخطة مدفوعة. لا يلزم إدخال بيانات بطاقة ائتمانية للبدء."
        },
        "change-plan": {
          "question": "هل يمكنني تغيير خطتي لاحقاً؟",
          "answer": "نعم. يمكنك الترقية أو التخفيض في أي وقت. تسري التغييرات في بداية دورة الفوترة التالية."
        },
        "annual-discount": {
          "question": "ما الذي يتضمنه الخصم السنوي؟",
          "answer": "تُفوتر الخطط السنوية مرة واحدة سنوياً بسعر مخفض يعادل تقريباً شهرين مجاناً مقارنةً بالفوترة الشهرية."
        },
        "cancel-anytime": {
          "question": "هل يمكنني الإلغاء في أي وقت؟",
          "answer": "نعم. لا توجد عقود طويلة الأمد. قم بإلغاء اشتراكك في أي وقت من إعدادات حسابك."
        },
        "payment-methods": {
          "question": "ما طرق الدفع المقبولة؟",
          "answer": "نقبل بطاقات الائتمان والخصم الرئيسية. يمكن لعملاء المؤسسات ترتيب الفوترة عبر الفاتورة مع مدير حساباتهم."
        },
        "enterprise-custom": {
          "question": "هل يمكن تخصيص خطط المؤسسات؟",
          "answer": "نعم. خطط المؤسسات مصممة وفق متطلباتك. تواصل مع فريقنا لمناقشة حدود المتاجر وأحجام الطلبات واتفاقيات مستوى الخدمة والتكاملات المخصصة."
        }
      }
    },

    "cta": {
      "title": "ابدأ البيع اليوم",
      "description": "أنشئ متجرك وابدأ في إدارة المنتجات والطلبات والنمو من منصة موحدة.",
      "primaryCta": "أنشئ متجرك",
      "secondaryCta": "تحدث مع المبيعات"
    }
  },

  "nav": {
    "features": "المميزات",
    "pricing": "الأسعار",
    "enterprise": "المؤسسات",
    "templates": "القوالب",
    "blog": "المدونة",
    "docs": "التوثيق"
  },

  "footer": {
    "groups": {
      "product": "المنتج",
      "resources": "الموارد",
      "company": "الشركة"
    },
    "links": {
      "features": "المميزات",
      "pricing": "الأسعار",
      "templates": "القوالب",
      "enterprise": "المؤسسات",
      "docs": "التوثيق",
      "blog": "المدونة",
      "about": "من نحن",
      "contact": "تواصل معنا"
    }
  },

  "cta": {
    "startSelling": "ابدأ البيع",
    "viewDemo": "عرض تجريبي",
    "exploreFeatures": "استكشف المميزات",
    "viewPricing": "عرض الأسعار",
    "contactSales": "تواصل مع المبيعات",
    "login": "تسجيل الدخول",
    "getStarted": "ابدأ الآن"
  }
}
EOF

echo "✓ src/locales/ar/marketing.json"

# =============================================================================
# Detect and update the i18n request config
# =============================================================================

echo ""
echo "→ Locating next-intl request config..."

REQUEST_CONFIG=""
for candidate in \
  "src/i18n/request.ts" \
  "src/i18n.ts" \
  "i18n.ts" \
  "src/i18n/index.ts" \
  "src/lib/i18n.ts"
do
  if [ -f "$PROJECT_ROOT/$candidate" ]; then
    REQUEST_CONFIG="$PROJECT_ROOT/$candidate"
    echo "  Found: $candidate"
    break
  fi
done

if [ -z "$REQUEST_CONFIG" ]; then
  echo "  ⚠ No request config found. Writing src/i18n/request.ts..."
  mkdir -p "$PROJECT_ROOT/src/i18n"
  REQUEST_CONFIG="$PROJECT_ROOT/src/i18n/request.ts"
fi

# -----------------------------------------------------------------------------
# Read current config to understand what it does
# -----------------------------------------------------------------------------

echo ""
echo "→ Current request config content:"
echo "---"
cat "$REQUEST_CONFIG" 2>/dev/null || echo "(empty or not found)"
echo "---"
echo ""

# -----------------------------------------------------------------------------
# Write updated request config that:
#   1. Reads from src/locales/{locale}/*.json
#   2. Merges all files — filename becomes namespace key
#   3. Preserves existing common.json under 'common' namespace
#   4. Loads marketing.json under 'marketing' namespace
#   5. Any future *.json file is automatically included
# -----------------------------------------------------------------------------

echo "→ Updating request config to load all locale files from src/locales/..."

cat > "$REQUEST_CONFIG" << 'EOF'
// =============================================================================
// next-intl Request Configuration
//
// Loads all JSON files from src/locales/{locale}/ and merges them into
// a single messages object. Each filename becomes the namespace key.
//
// Examples:
//   src/locales/en/common.json     → namespace 'common'
//   src/locales/en/marketing.json  → namespace 'marketing'
//   src/locales/ar/common.json     → namespace 'common'
//   src/locales/ar/marketing.json  → namespace 'marketing'
//
// Adding a new namespace:
//   1. Create src/locales/en/my-namespace.json
//   2. Create src/locales/ar/my-namespace.json
//   3. Use: getTranslations({ locale, namespace: 'my-namespace' })
//   No config changes required.
//
// Rules:
//   - locale directory must exist for all supported locales
//   - all locale directories must have key parity
//   - do not add locale logic inside components — use this loader
// =============================================================================

import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'

const SUPPORTED_LOCALES = ['en', 'ar'] as const
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale)
}

/**
 * Loads and merges all JSON files from src/locales/{locale}/.
 * Each file's basename (without .json) becomes the top-level namespace key.
 *
 * src/locales/en/common.json    → { common: { ... } }
 * src/locales/en/marketing.json → { marketing: { ... } }
 * Merged result:                  { common: { ... }, marketing: { ... } }
 */
function loadMessages(locale: string): Record<string, unknown> {
  const localesDir = path.join(process.cwd(), 'src', 'locales', locale)

  if (!fs.existsSync(localesDir)) {
    console.error(`[i18n] Locale directory not found: ${localesDir}`)
    return {}
  }

  const files = fs
    .readdirSync(localesDir)
    .filter((f) => f.endsWith('.json'))

  if (files.length === 0) {
    console.warn(`[i18n] No JSON files found in ${localesDir}`)
    return {}
  }

  const merged: Record<string, unknown> = {}

  for (const file of files) {
    const namespace = file.replace(/\.json$/, '')
    const filePath = path.join(localesDir, file)

    try {
      const raw = fs.readFileSync(filePath, 'utf8')
      merged[namespace] = JSON.parse(raw)
    } catch (e) {
      console.error(`[i18n] Failed to load ${filePath}:`, e)
    }
  }

  return merged
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale

  if (!locale || !isSupportedLocale(locale)) {
    notFound()
  }

  return {
    locale,
    messages: loadMessages(locale),
  }
})
EOF

echo "✓ $REQUEST_CONFIG updated"

# =============================================================================
# Clean up the incorrectly placed messages/ directory if it exists
# and was created by previous scripts
# =============================================================================

WRONG_MESSAGES_DIR="$PROJECT_ROOT/messages"

if [ -d "$WRONG_MESSAGES_DIR" ]; then
  echo ""
  echo "→ Removing incorrectly placed messages/ directory..."
  echo "  (was created by previous phase scripts — not used by this project)"
  rm -rf "$WRONG_MESSAGES_DIR"
  echo "✓ messages/ removed"
fi

# =============================================================================
# Verify locale file structure
# =============================================================================

echo ""
echo "→ Verifying src/locales/ structure..."

for LOCALE in en ar; do
  DIR="$LOCALES/$LOCALE"
  if [ -d "$DIR" ]; then
    FILES=$(ls "$DIR"/*.json 2>/dev/null | xargs -I{} basename {} | tr '\n' ' ')
    echo "  src/locales/$LOCALE/: $FILES"
  else
    echo "  ⚠ src/locales/$LOCALE/ not found"
  fi
done

# =============================================================================
# Done
# =============================================================================

echo ""
echo "============================================="
echo " Fix Complete"
echo "============================================="
echo ""
echo " Translation files:"
echo "   src/locales/en/common.json     ← existing (untouched)"
echo "   src/locales/en/marketing.json  ← new"
echo "   src/locales/ar/common.json     ← existing (untouched)"
echo "   src/locales/ar/marketing.json  ← new"
echo ""
echo " Request config updated:"
echo "   Loads all *.json from src/locales/{locale}/"
echo "   Filename = namespace key (no manual registration needed)"
echo "   common.json    → namespace 'common'"
echo "   marketing.json → namespace 'marketing'"
echo ""
echo " Usage in pages:"
echo "   const t = await getTranslations({ locale, namespace: 'marketing' })"
echo "   t('home.hero.headline') → 'Run Multiple Stores From One Platform'"
echo ""
echo " Adding future namespaces:"
echo "   1. Create src/locales/en/my-namespace.json"
echo "   2. Create src/locales/ar/my-namespace.json"
echo "   3. Use namespace: 'my-namespace' — no config changes needed"
echo ""
echo " Restart the dev server after running this script."
echo "============================================="