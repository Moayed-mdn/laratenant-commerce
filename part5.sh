#!/usr/bin/env bash

# =============================================================================
# PART 5 — i18n: English + Arabic locale files
# =============================================================================

set -e

BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$BASE/src"

echo "🚀 Part 5: i18n — English + Arabic locale files..."
echo "📁 Base path: $BASE"

# =============================================================================
# HELPER
# =============================================================================

write_file() {
    local path="$1"
    local content="$2"
    mkdir -p "$(dirname "$path")"
    printf '%s' "$content" > "$path"
    echo "  ✅ $path"
}

# =============================================================================
# 1. ENGLISH — common.json (full file, categories + brands added)
# =============================================================================

echo ""
echo "📦 [1/2] English locale..."

write_file "$SRC/locales/en/common.json" \
'{
  "save": "Save",
  "cancel": "Cancel",
  "saving": "Saving...",
  "loading": "Loading...",
  "confirm": "Confirm",
  "delete": "Delete",
  "edit": "Edit",
  "create": "Create",
  "search": "Search",
  "filter": "Filter",
  "actions": "Actions",
  "login": {
    "pageTitle": "Login — Admin Dashboard",
    "pageDescription": "Sign in to your admin dashboard",
    "appName": "Admin Dashboard",
    "title": "Sign in to your account",
    "subtitle": "Enter your credentials below to continue",
    "emailLabel": "Email address",
    "emailPlaceholder": "you@example.com",
    "passwordLabel": "Password",
    "passwordPlaceholder": "Enter your password",
    "submitButton": "Sign in",
    "signingIn": "Signing in...",
    "togglePassword": "Toggle password visibility",
    "errors": {
      "invalidEmail": "Please enter a valid email address",
      "passwordTooShort": "Password must be at least 8 characters",
      "noStoreAssigned": "Your account has no store assigned. Contact support.",
      "genericError": "Something went wrong. Please try again."
    },
    "success": {
      "loggedIn": "Welcome back!"
    }
  },
  "nav": {
    "appName": "Admin Dashboard",
    "dashboard": "Dashboard",
    "users": "Customers",
    "products": "Products",
    "orders": "Orders",
    "stores": "Stores",
    "categories": "Categories",
    "brands": "Brands",
    "mainNav": "Main navigation",
    "toggleSidebar": "Toggle sidebar",
    "toggleMenu": "Toggle menu"
  },
  "auth": {
    "logout": "Sign out",
    "loggingOut": "Signing out...",
    "loggedOut": "You have been signed out"
  },
  "theme": {
    "toggle": "Toggle theme",
    "light": "Light",
    "dark": "Dark"
  },
  "locale": {
    "toggle": "Toggle language",
    "switchToArabic": "Switch to Arabic",
    "switchToEnglish": "Switch to English"
  },
  "dashboard": {
    "title": "Dashboard",
    "subtitle": "Welcome back. Here'\''s what'\''s happening in your store.",
    "error": "Failed to load dashboard data. Please refresh.",
    "stats": {
      "revenue": "Total Revenue",
      "orders": "Total Orders",
      "customers": "Total Customers",
      "products": "Total Products"
    },
    "recentOrders": {
      "title": "Recent Orders",
      "empty": "No orders yet",
      "order": "Order",
      "customer": "Customer",
      "status": "Status",
      "total": "Total",
      "date": "Date"
    },
    "topProducts": {
      "title": "Top Products",
      "empty": "No products yet",
      "sold": "sold"
    },
    "orderStatus": {
      "pending": "Pending",
      "processing": "Processing",
      "shipped": "Shipped",
      "delivered": "Delivered",
      "cancelled": "Cancelled",
      "refunded": "Refunded"
    },
    "paymentStatus": {
      "pending": "Pending",
      "paid": "Paid",
      "failed": "Failed",
      "refunded": "Refunded",
      "partially_refunded": "Partially Refunded"
    },
    "productStatus": {
      "active": "Active",
      "draft": "Draft",
      "inactive": "Inactive"
    }
  },
  "users": {
    "title": "Customers",
    "subtitle": "Manage your store customers",
    "loading": "Loading...",
    "filters": {
      "search": "Search",
      "searchPlaceholder": "Search by name or email...",
      "role": "Role",
      "allRoles": "All roles",
      "status": "Status",
      "allStatuses": "All statuses"
    },
    "roles": {
      "store_admin": "Store Admin",
      "staff": "Staff",
      "super_admin": "Super Admin",
      "customer": "Customer",
      "unknown": "Unknown"
    },
    "status": {
      "active": "Active",
      "inactive": "Inactive",
      "verified": "Verified",
      "unverified": "Unverified"
    },
    "table": {
      "name": "Name",
      "email": "Email",
      "role": "Role",
      "status": "Status",
      "created": "Created",
      "actions": "Actions",
      "view": "View",
      "empty": "No customers found",
      "of": "of",
      "perPage": "Per page",
      "previous": "Previous",
      "next": "Next",
      "page": "Page {current} of {total}"
    },
    "detail": {
      "title": "Customer Details",
      "back": "Back to customers",
      "info": "Information",
      "timestamps": "Timestamps",
      "emailVerified": "Email verified",
      "emailNotVerified": "Email not verified",
      "joined": "Joined",
      "lastUpdated": "Last updated",
      "delete": "Delete customer",
      "deleteConfirm": "Are you sure you want to delete this customer? This action cannot be undone.",
      "deleteSuccess": "Customer deleted",
      "deleteError": "Failed to delete customer"
    },
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "stores": {
    "noStores": "You don'\''t have any stores yet.",
    "welcome": "Welcome!",
    "createFirst": "Create your first store"
  },
  "products": {
    "title": "Products",
    "subtitle": "Manage your store products",
    "new": "New product",
    "loading": "Loading...",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "actions": "Actions",
    "save": "Save",
    "saving": "Saving...",
    "discard": "Discard",
    "filters": {
      "search": "Search",
      "searchPlaceholder": "Search by name or SKU...",
      "status": "Status",
      "allStatuses": "All statuses"
    },
    "table": {
      "image": "Image",
      "name": "Name",
      "status": "Status",
      "price": "Price",
      "inventory": "Inventory",
      "sku": "SKU",
      "created": "Created",
      "actions": "Actions",
      "edit": "Edit",
      "empty": "No products found",
      "inStock": "{count} in stock",
      "noSku": "—",
      "of": "of",
      "perPage": "Per page",
      "previous": "Previous",
      "next": "Next",
      "page": "Page {current} of {total}"
    },
    "form": {
      "createTitle": "New Product",
      "editTitle": "Edit Product",
      "sections": {
        "basic": "Basic Information",
        "pricing": "Pricing",
        "inventory": "Inventory",
        "shipping": "Shipping",
        "status": "Product Status"
      },
      "fields": {
        "name": "Product name",
        "namePlaceholder": "e.g. Blue T-Shirt",
        "description": "Description",
        "descriptionPlaceholder": "Describe the product...",
        "price": "Price",
        "compareAtPrice": "Compare at price",
        "costPerItem": "Cost per item",
        "sku": "SKU",
        "skuPlaceholder": "e.g. SHIRT-BLUE-M",
        "barcode": "Barcode",
        "quantity": "Quantity",
        "trackQuantity": "Track quantity",
        "weight": "Weight",
        "weightUnit": "Unit",
        "status": "Status",
        "category": "Category",
        "categoryPlaceholder": "Select a category",
        "noCategoryOption": "No category",
        "brand": "Brand",
        "brandPlaceholder": "Select a brand",
        "noBrandOption": "No brand",
        "isFeatured": "Featured product",
        "isFeaturedHint": "Featured products are highlighted in the storefront.",
        "loading": "Loading..."
      },
      "status": {
        "active": "Active",
        "draft": "Draft",
        "inactive": "Inactive"
      },
      "weightUnits": {
        "kg": "kg",
        "g": "g",
        "lb": "lb",
        "oz": "oz"
      },
      "errors": {
        "nameRequired": "Product name is required",
        "priceMin": "Price must be 0 or greater",
        "quantityMin": "Quantity must be 0 or greater"
      },
      "validation": {
        "translationMissingRequired": "Please fill in the required translation fields (name and slug).",
        "variantSkuRequired": "Variant SKU is required.",
        "variantPriceInvalid": "Variant price must be 0 or greater.",
        "variantQuantityInvalid": "Variant quantity must be 0 or greater."
      },
      "validationError": "Please fix the validation errors before saving.",
      "validationErrorsTitle": "Validation Errors:",
      "submit": {
        "create": "Create product",
        "update": "Save changes",
        "creating": "Creating...",
        "updating": "Saving..."
      },
      "createSuccess": "Product created",
      "updateSuccess": "Product saved",
      "deleteSuccess": "Product deleted",
      "deleteError": "Failed to delete product",
      "deleteConfirm": "Are you sure you want to delete this product? This cannot be undone.",
      "delete": "Delete product"
    },
    "variantEditor": {
      "tabs": {
        "general": "General",
        "variants": "Variants",
        "attributes": "Attributes",
        "seo": "SEO"
      },
      "unsavedChanges": "You have unsaved changes.",
      "seoPlaceholder": "SEO section will be added in a later phase.",
      "shared": {
        "yes": "Yes",
        "no": "No",
        "duplicate": "Duplicate",
        "copy": "Copy"
      },
      "general": {
        "featured": "Featured"
      },
      "variants": {
        "variant": "Variant",
        "label": "Variant label",
        "sku": "SKU",
        "price": "Price",
        "quantity": "Quantity",
        "editVariant": "Edit variant",
        "searchVariants": "Search variants...",
        "addVariant": "Add variant"
      },
      "attributes": {
        "attributeName": "Attribute name",
        "value": "Value",
        "addValue": "Add value",
        "addAttribute": "Add attribute",
        "generateCombinations": "Generate combinations"
      },
      "options": {
        "optionName": "Option name",
        "addValue": "Add value",
        "addOption": "Add option",
        "noOptions": "No options defined yet. Add an option to create variants.",
        "noValues": "No values defined yet.",
        "valuesCount": "{count, plural, one {# value} other {# values}}"
      }
    },
    "editor": {
      "tabs": {
        "content": "Content",
        "structure": "Structure",
        "options": "Options",
        "media": "Media"
      },
      "translationStatus": {
        "complete": "Complete",
        "incomplete": "Incomplete"
      },
      "translation": {
        "fields": {
          "name": "Name",
          "slug": "Slug",
          "description": "Description",
          "seoTitle": "SEO title",
          "seoDescription": "SEO description"
        }
      },
      "media": {
        "imagesTitle": "Images",
        "imagesHint": "Manage images, ordering, and alt text.",
        "altText": "Alt text",
        "moveUp": "Move up",
        "moveDown": "Move down"
      }
    },
    "detail": {
      "back": "Back to products"
    },
    "create": {
      "back": "Back",
      "next": "Next",
      "steps": {
        "content": "Content",
        "structure": "Structure",
        "review": "Review"
      },
      "review": {
        "title": "Ready to create",
        "subtitle": "Review your product before creating it.",
        "status": "Status",
        "translationsCount": "{count, plural, one {# translation} other {# translations}}",
        "optionsCount": "{count, plural, one {# option} other {# options}}",
        "variantsCount": "{count, plural, one {# variant} other {# variants}}",
        "noVariants": "No variants defined — a default variant will be created.",
        "noOptions": "No options defined — product has a single default variant.",
        "noTranslations": "No translations defined."
      }
    }
  },
  "orders": {
    "title": "Orders",
    "subtitle": "Manage your store orders",
    "filters": {
      "search": "Search",
      "searchPlaceholder": "Search by order number or customer...",
      "status": "Status",
      "allStatuses": "All statuses",
      "paymentStatus": "Payment status",
      "allPaymentStatuses": "All payment statuses"
    },
    "table": {
      "order": "Order",
      "customer": "Customer",
      "status": "Status",
      "payment": "Payment",
      "items": "Items",
      "total": "Total",
      "date": "Date",
      "view": "View",
      "empty": "No orders found",
      "itemCount": "{count} item",
      "itemCountPlural": "{count} items",
      "previous": "Previous",
      "page": "Page {current} of {total}",
      "next": "Next"
    },
    "status": {
      "pending": "Pending",
      "processing": "Processing",
      "shipped": "Shipped",
      "cancelled": "Cancelled",
      "delivered": "Delivered",
      "refunded": "Refunded"
    },
    "paymentStatus": {
      "pending": "Pending",
      "paid": "Paid",
      "failed": "Failed",
      "refunded": "Refunded",
      "partially_refunded": "Partially Refunded"
    },
    "fulfillmentStatus": {
      "unfulfilled": "Unfulfilled",
      "partial": "Partially fulfilled",
      "fulfilled": "Fulfilled"
    },
    "detail": {
      "title": "Order",
      "back": "Back to orders",
      "customer": "Customer",
      "phone": "Phone",
      "notes": "Notes",
      "lineItems": "Items",
      "summary": "Order summary",
      "subtotal": "Subtotal",
      "tax": "Tax",
      "shipping": "Shipping",
      "total": "Total",
      "statusLabel": "Order status",
      "statusUpdated": "Order status updated",
      "updating": "Updating...",
      "error": "Failed to load order"
    },
    "lineItems": {
      "product": "Product",
      "sku": "SKU",
      "quantity": "Qty",
      "price": "Price",
      "total": "Total"
    }
  },
  "categories": {
    "title": "Categories",
    "subtitle": "Manage your store categories",
    "new": "New category",
    "loading": "Loading...",
    "filters": {
      "allStatuses": "All statuses"
    },
    "status": {
      "active": "Active",
      "inactive": "Inactive",
      "deleted": "Deleted"
    },
    "table": {
      "name": "Name",
      "slug": "Slug",
      "parent": "Parent",
      "products": "Products",
      "status": "Status",
      "sortOrder": "Order",
      "created": "Created",
      "actions": "Actions",
      "edit": "Edit",
      "empty": "No categories found",
      "of": "of",
      "perPage": "Per page",
      "previous": "Previous",
      "next": "Next",
      "page": "Page {current} of {total}"
    },
    "form": {
      "createTitle": "New Category",
      "createSubtitle": "Create a new product category",
      "editTitle": "Edit Category",
      "translations": "Translations",
      "settings": "Settings",
      "parentCategory": "Parent Category",
      "dangerZone": "Danger Zone",
      "deleteDescription": "Permanently remove this category from your store. Products in this category will be unaffected.",
      "restoreDescription": "Restore this category to make it available again.",
      "fields": {
        "name": "Name",
        "namePlaceholder": "e.g. Clothing",
        "slug": "Global slug",
        "translationSlug": "URL slug",
        "slugPlaceholder": "e.g. clothing",
        "sortOrder": "Sort order",
        "isActive": "Active"
      },
      "create": "Create category",
      "creating": "Creating...",
      "save": "Save changes",
      "saving": "Saving...",
      "delete": "Delete category",
      "deleting": "Deleting...",
      "restore": "Restore category",
      "restoring": "Restoring...",
      "cancel": "Cancel",
      "deleteTitle": "Delete Category",
      "deleteConfirm": "Are you sure you want to delete this category? Categories with subcategories or products cannot be deleted.",
      "createSuccess": "Category created",
      "createError": "Failed to create category",
      "updateSuccess": "Category saved",
      "updateError": "Failed to update category",
      "deleteSuccess": "Category deleted",
      "deleteError": "Failed to delete category",
      "restoreSuccess": "Category restored",
      "restoreError": "Failed to restore category"
    },
    "detail": {
      "error": "Failed to load category"
    }
  },
  "brands": {
    "title": "Brands",
    "subtitle": "Manage your store brands",
    "new": "New brand",
    "loading": "Loading...",
    "filters": {
      "allStatuses": "All statuses"
    },
    "status": {
      "active": "Active",
      "inactive": "Inactive",
      "deleted": "Deleted"
    },
    "table": {
      "logo": "Logo",
      "name": "Name",
      "slug": "Slug",
      "products": "Products",
      "status": "Status",
      "sortOrder": "Order",
      "created": "Created",
      "actions": "Actions",
      "edit": "Edit",
      "empty": "No brands found",
      "of": "of",
      "perPage": "Per page",
      "previous": "Previous",
      "next": "Next",
      "page": "Page {current} of {total}"
    },
    "form": {
      "createTitle": "New Brand",
      "createSubtitle": "Create a new product brand",
      "editTitle": "Edit Brand",
      "details": "Details",
      "settings": "Settings",
      "stats": "Statistics",
      "dangerZone": "Danger Zone",
      "deleteDescription": "Permanently remove this brand from your store. Products linked to this brand will be unaffected.",
      "restoreDescription": "Restore this brand to make it available again.",
      "fields": {
        "name": "Name",
        "namePlaceholder": "e.g. Nike",
        "slug": "Slug",
        "slugPlaceholder": "e.g. nike",
        "description": "Description",
        "descriptionPlaceholder": "Describe the brand...",
        "logoUrl": "Logo URL",
        "logoUrlPlaceholder": "https://example.com/logo.png",
        "sortOrder": "Sort order",
        "isActive": "Active",
        "productsCount": "Products",
        "updatedAt": "Last updated"
      },
      "create": "Create brand",
      "creating": "Creating...",
      "save": "Save changes",
      "saving": "Saving...",
      "delete": "Delete brand",
      "deleting": "Deleting...",
      "restore": "Restore brand",
      "restoring": "Restoring...",
      "cancel": "Cancel",
      "deleteTitle": "Delete Brand",
      "deleteConfirm": "Are you sure you want to delete this brand? Brands with products cannot be deleted.",
      "createSuccess": "Brand created",
      "createError": "Failed to create brand",
      "updateSuccess": "Brand saved",
      "updateError": "Failed to update brand",
      "deleteSuccess": "Brand deleted",
      "deleteError": "Failed to delete brand",
      "restoreSuccess": "Brand restored",
      "restoreError": "Failed to restore brand"
    },
    "detail": {
      "error": "Failed to load brand"
    }
  }
}
'

# =============================================================================
# 2. ARABIC — common.json (full file, categories + brands added)
# =============================================================================

echo ""
echo "📦 [2/2] Arabic locale..."

write_file "$SRC/locales/ar/common.json" \
'{
  "save": "حفظ",
  "cancel": "إلغاء",
  "saving": "جارٍ الحفظ...",
  "loading": "جارٍ التحميل...",
  "confirm": "تأكيد",
  "delete": "حذف",
  "edit": "تعديل",
  "create": "إنشاء",
  "search": "بحث",
  "filter": "تصفية",
  "actions": "الإجراءات",
  "login": {
    "pageTitle": "تسجيل الدخول — لوحة التحكم",
    "pageDescription": "سجّل دخولك إلى لوحة التحكم",
    "appName": "لوحة التحكم",
    "title": "تسجيل الدخول إلى حسابك",
    "subtitle": "أدخل بيانات الاعتماد الخاصة بك للمتابعة",
    "emailLabel": "البريد الإلكتروني",
    "emailPlaceholder": "example@domain.com",
    "passwordLabel": "كلمة المرور",
    "passwordPlaceholder": "أدخل كلمة المرور",
    "submitButton": "تسجيل الدخول",
    "signingIn": "جارٍ تسجيل الدخول...",
    "togglePassword": "إظهار أو إخفاء كلمة المرور",
    "errors": {
      "invalidEmail": "يرجى إدخال بريد إلكتروني صحيح",
      "passwordTooShort": "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل",
      "noStoreAssigned": "حسابك غير مرتبط بأي متجر. يرجى التواصل مع الدعم.",
      "genericError": "حدث خطأ ما. يرجى المحاولة مرة أخرى."
    },
    "success": {
      "loggedIn": "مرحباً بعودتك!"
    }
  },
  "nav": {
    "appName": "لوحة التحكم",
    "dashboard": "الرئيسية",
    "users": "العملاء",
    "products": "المنتجات",
    "orders": "الطلبات",
    "stores": "المتاجر",
    "categories": "التصنيفات",
    "brands": "العلامات التجارية",
    "mainNav": "التنقل الرئيسي",
    "toggleSidebar": "تبديل الشريط الجانبي",
    "toggleMenu": "تبديل القائمة"
  },
  "auth": {
    "logout": "تسجيل الخروج",
    "loggingOut": "جارٍ تسجيل الخروج...",
    "loggedOut": "تم تسجيل خروجك"
  },
  "theme": {
    "toggle": "تبديل السمة",
    "light": "فاتح",
    "dark": "داكن"
  },
  "locale": {
    "toggle": "تبديل اللغة",
    "switchToArabic": "التبديل إلى العربية",
    "switchToEnglish": "التبديل إلى الإنجليزية"
  },
  "dashboard": {
    "title": "الرئيسية",
    "subtitle": "مرحباً بعودتك. إليك ما يحدث في متجرك.",
    "error": "فشل تحميل بيانات لوحة التحكم. يرجى تحديث الصفحة.",
    "stats": {
      "revenue": "إجمالي الإيرادات",
      "orders": "إجمالي الطلبات",
      "customers": "إجمالي العملاء",
      "products": "إجمالي المنتجات"
    },
    "recentOrders": {
      "title": "الطلبات الأخيرة",
      "empty": "لا توجد طلبات بعد",
      "order": "الطلب",
      "customer": "العميل",
      "status": "الحالة",
      "total": "الإجمالي",
      "date": "التاريخ"
    },
    "topProducts": {
      "title": "أفضل المنتجات",
      "empty": "لا توجد منتجات بعد",
      "sold": "مبيع"
    },
    "orderStatus": {
      "pending": "قيد الانتظار",
      "processing": "قيد المعالجة",
      "shipped": "تم الشحن",
      "delivered": "تم التوصيل",
      "cancelled": "ملغي",
      "refunded": "مسترد"
    },
    "paymentStatus": {
      "pending": "قيد الانتظار",
      "paid": "مدفوع",
      "failed": "فشل",
      "refunded": "مسترد",
      "partially_refunded": "مسترد جزئياً"
    },
    "productStatus": {
      "active": "نشط",
      "draft": "مسودة",
      "inactive": "غير نشط"
    }
  },
  "users": {
    "title": "العملاء",
    "subtitle": "إدارة عملاء متجرك",
    "loading": "جارٍ التحميل...",
    "filters": {
      "search": "بحث",
      "searchPlaceholder": "البحث بالاسم أو البريد الإلكتروني...",
      "role": "الدور",
      "allRoles": "جميع الأدوار",
      "status": "الحالة",
      "allStatuses": "جميع الحالات"
    },
    "roles": {
      "store_admin": "مدير المتجر",
      "staff": "موظف",
      "super_admin": "مدير أعلى",
      "customer": "عميل",
      "unknown": "غير معروف"
    },
    "status": {
      "active": "نشط",
      "inactive": "غير نشط",
      "verified": "موثّق",
      "unverified": "غير موثّق"
    },
    "table": {
      "name": "الاسم",
      "email": "البريد الإلكتروني",
      "role": "الدور",
      "status": "الحالة",
      "created": "تاريخ الإنشاء",
      "actions": "الإجراءات",
      "view": "عرض",
      "empty": "لم يتم العثور على عملاء",
      "of": "من",
      "perPage": "لكل صفحة",
      "previous": "السابق",
      "next": "التالي",
      "page": "صفحة {current} من {total}"
    },
    "detail": {
      "title": "تفاصيل العميل",
      "back": "العودة إلى العملاء",
      "info": "المعلومات",
      "timestamps": "الطوابع الزمنية",
      "emailVerified": "تم التحقق من البريد الإلكتروني",
      "emailNotVerified": "لم يتم التحقق من البريد الإلكتروني",
      "joined": "تاريخ الانضمام",
      "lastUpdated": "آخر تحديث",
      "delete": "حذف العميل",
      "deleteConfirm": "هل أنت متأكد من رغبتك في حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.",
      "deleteSuccess": "تم حذف العميل",
      "deleteError": "فشل حذف العميل"
    },
    "cancel": "إلغاء",
    "delete": "حذف"
  },
  "stores": {
    "noStores": "ليس لديك أي متاجر حتى الآن.",
    "welcome": "أهلاً بك!",
    "createFirst": "أنشئ متجرك الأول"
  },
  "products": {
    "title": "المنتجات",
    "subtitle": "إدارة منتجات متجرك",
    "new": "منتج جديد",
    "loading": "جارٍ التحميل...",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "actions": "الإجراءات",
    "save": "حفظ",
    "saving": "جارٍ الحفظ...",
    "discard": "تجاهل",
    "filters": {
      "search": "بحث",
      "searchPlaceholder": "البحث بالاسم أو SKU...",
      "status": "الحالة",
      "allStatuses": "جميع الحالات"
    },
    "table": {
      "image": "الصورة",
      "name": "الاسم",
      "status": "الحالة",
      "price": "السعر",
      "inventory": "المخزون",
      "sku": "SKU",
      "created": "تاريخ الإنشاء",
      "actions": "الإجراءات",
      "edit": "تعديل",
      "empty": "لم يتم العثور على منتجات",
      "inStock": "{count} في المخزون",
      "noSku": "—",
      "of": "من",
      "perPage": "لكل صفحة",
      "previous": "السابق",
      "next": "التالي",
      "page": "صفحة {current} من {total}"
    },
    "form": {
      "createTitle": "منتج جديد",
      "editTitle": "تعديل المنتج",
      "sections": {
        "basic": "المعلومات الأساسية",
        "pricing": "التسعير",
        "inventory": "المخزون",
        "shipping": "الشحن",
        "status": "حالة المنتج"
      },
      "fields": {
        "name": "اسم المنتج",
        "namePlaceholder": "مثال: تيشيرت أزرق",
        "description": "الوصف",
        "descriptionPlaceholder": "صف المنتج...",
        "price": "السعر",
        "compareAtPrice": "سعر المقارنة",
        "costPerItem": "التكلفة لكل قطعة",
        "sku": "SKU",
        "skuPlaceholder": "مثال: SHIRT-BLUE-M",
        "barcode": "الباركود",
        "quantity": "الكمية",
        "trackQuantity": "تتبع الكمية",
        "weight": "الوزن",
        "weightUnit": "الوحدة",
        "status": "الحالة",
        "category": "الفئة",
        "categoryPlaceholder": "اختر فئة",
        "noCategoryOption": "بدون فئة",
        "brand": "العلامة التجارية",
        "brandPlaceholder": "اختر علامة تجارية",
        "noBrandOption": "بدون علامة تجارية",
        "isFeatured": "منتج مميز",
        "isFeaturedHint": "تُعرض المنتجات المميزة بشكل بارز في الواجهة.",
        "loading": "جارٍ التحميل..."
      },
      "status": {
        "active": "نشط",
        "draft": "مسودة",
        "inactive": "غير نشط"
      },
      "weightUnits": {
        "kg": "كجم",
        "g": "جم",
        "lb": "رطل",
        "oz": "أوقية"
      },
      "errors": {
        "nameRequired": "اسم المنتج مطلوب",
        "priceMin": "يجب أن يكون السعر 0 أو أكبر",
        "quantityMin": "يجب أن تكون الكمية 0 أو أكبر"
      },
      "validation": {
        "translationMissingRequired": "يرجى تعبئة حقول الترجمة المطلوبة (الاسم والمعرّف).",
        "variantSkuRequired": "رمز SKU للمتغير مطلوب.",
        "variantPriceInvalid": "يجب أن يكون سعر المتغير 0 أو أكبر.",
        "variantQuantityInvalid": "يجب أن تكون كمية المتغير 0 أو أكبر."
      },
      "validationError": "يرجى إصلاح أخطاء التحقق من الصحة قبل الحفظ.",
      "validationErrorsTitle": "أخطاء التحقق:",
      "submit": {
        "create": "إنشاء منتج",
        "update": "حفظ التغييرات",
        "creating": "جارٍ الإنشاء...",
        "updating": "جارٍ الحفظ..."
      },
      "createSuccess": "تم إنشاء المنتج",
      "updateSuccess": "تم حفظ المنتج",
      "deleteSuccess": "تم حذف المنتج",
      "deleteError": "فشل حذف المنتج",
      "deleteConfirm": "هل أنت متأكد من رغبتك في حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.",
      "delete": "حذف المنتج"
    },
    "variantEditor": {
      "tabs": {
        "general": "عام",
        "variants": "المتغيرات",
        "attributes": "الخصائص",
        "seo": "SEO"
      },
      "unsavedChanges": "لديك تغييرات غير محفوظة.",
      "seoPlaceholder": "سيتم إضافة قسم SEO في مرحلة لاحقة.",
      "shared": {
        "yes": "نعم",
        "no": "لا",
        "duplicate": "نسخ",
        "copy": "نسخة"
      },
      "general": {
        "featured": "مميز"
      },
      "variants": {
        "variant": "متغير",
        "label": "اسم المتغير",
        "sku": "SKU",
        "price": "السعر",
        "quantity": "الكمية",
        "editVariant": "تعديل المتغير",
        "searchVariants": "ابحث في المتغيرات...",
        "addVariant": "إضافة متغير"
      },
      "attributes": {
        "attributeName": "اسم الخاصية",
        "value": "القيمة",
        "addValue": "إضافة قيمة",
        "addAttribute": "إضافة خاصية",
        "generateCombinations": "توليد التركيبات"
      },
      "options": {
        "optionName": "اسم الخيار",
        "addValue": "إضافة قيمة",
        "addOption": "إضافة خيار",
        "noOptions": "لم يتم تحديد خيارات بعد. أضف خيارًا لإنشاء المتغيرات.",
        "noValues": "لم يتم تحديد قيم بعد.",
        "valuesCount": "{count, plural, =0 {لا توجد قيم} =1 {قيمة واحدة} =2 {قيمتان} few {# قيم} many {# قيمة} other {# قيمة}}"
      }
    },
    "editor": {
      "tabs": {
        "content": "المحتوى",
        "structure": "البنية",
        "options": "الخيارات",
        "media": "الوسائط"
      },
      "translationStatus": {
        "complete": "مكتمل",
        "incomplete": "غير مكتمل"
      },
      "translation": {
        "fields": {
          "name": "الاسم",
          "slug": "المعرّف",
          "description": "الوصف",
          "seoTitle": "عنوان SEO",
          "seoDescription": "وصف SEO"
        }
      },
      "media": {
        "imagesTitle": "الصور",
        "imagesHint": "إدارة الصور والترتيب ونصوص البديل.",
        "altText": "نص بديل",
        "moveUp": "تحريك للأعلى",
        "moveDown": "تحريك للأسفل"
      }
    },
    "detail": {
      "back": "العودة إلى المنتجات"
    },
    "create": {
      "back": "السابق",
      "next": "التالي",
      "steps": {
        "content": "المحتوى",
        "structure": "البنية",
        "review": "المراجعة"
      },
      "review": {
        "title": "جاهز للإنشاء",
        "subtitle": "راجع المنتج قبل إنشائه.",
        "status": "الحالة",
        "translationsCount": "{count, plural, =0 {لا توجد ترجمات} =1 {ترجمة واحدة} =2 {ترجمتان} few {# ترجمات} many {# ترجمة} other {# ترجمة}}",
        "optionsCount": "{count, plural, =0 {لا توجد خيارات} =1 {خيار واحد} =2 {خياران} few {# خيارات} many {# خيار} other {# خيار}}",
        "variantsCount": "{count, plural, =0 {لا توجد متغيرات} =1 {متغير واحد} =2 {متغيران} few {# متغيرات} many {# متغير} other {# متغير}}",
        "noVariants": "لم يتم تحديد متغيرات — سيتم إنشاء متغير افتراضي.",
        "noOptions": "لم يتم تحديد خيارات — المنتج له متغير افتراضي واحد.",
        "noTranslations": "لم يتم تحديد ترجمات."
      }
    }
  },
  "orders": {
    "title": "الطلبات",
    "subtitle": "إدارة طلبات متجرك",
    "filters": {
      "search": "بحث",
      "searchPlaceholder": "البحث برقم الطلب أو اسم العميل...",
      "status": "الحالة",
      "allStatuses": "جميع الحالات",
      "paymentStatus": "حالة الدفع",
      "allPaymentStatuses": "جميع حالات الدفع"
    },
    "table": {
      "order": "الطلب",
      "customer": "العميل",
      "status": "الحالة",
      "payment": "الدفع",
      "items": "المنتجات",
      "total": "الإجمالي",
      "date": "التاريخ",
      "view": "عرض",
      "empty": "لا توجد طلبات",
      "itemCount": "{count} منتج",
      "itemCountPlural": "{count} منتجات",
      "previous": "السابق",
      "page": "صفحة {current} من {total}",
      "next": "التالي"
    },
    "status": {
      "pending": "قيد الانتظار",
      "processing": "قيد المعالجة",
      "shipped": "تم الشحن",
      "cancelled": "ملغي",
      "delivered": "تم التوصيل",
      "refunded": "مسترد"
    },
    "paymentStatus": {
      "pending": "قيد الانتظار",
      "paid": "مدفوع",
      "failed": "فشل",
      "refunded": "مسترد",
      "partially_refunded": "مسترد جزئياً"
    },
    "fulfillmentStatus": {
      "unfulfilled": "غير مُنجز",
      "partial": "مُنجز جزئياً",
      "fulfilled": "مُنجز"
    },
    "detail": {
      "title": "الطلب",
      "back": "العودة إلى الطلبات",
      "customer": "العميل",
      "phone": "الهاتف",
      "notes": "ملاحظات",
      "lineItems": "المنتجات",
      "summary": "ملخص الطلب",
      "subtotal": "المجموع الفرعي",
      "tax": "الضريبة",
      "shipping": "الشحن",
      "total": "الإجمالي",
      "statusLabel": "حالة الطلب",
      "statusUpdated": "تم تحديث حالة الطلب",
      "updating": "جارٍ التحديث...",
      "error": "فشل تحميل الطلب"
    },
    "lineItems": {
      "product": "المنتج",
      "sku": "رمز المنتج",
      "quantity": "الكمية",
      "price": "السعر",
      "total": "الإجمالي"
    }
  },
  "categories": {
    "title": "التصنيفات",
    "subtitle": "إدارة تصنيفات متجرك",
    "new": "تصنيف جديد",
    "loading": "جارٍ التحميل...",
    "filters": {
      "allStatuses": "جميع الحالات"
    },
    "status": {
      "active": "نشط",
      "inactive": "غير نشط",
      "deleted": "محذوف"
    },
    "table": {
      "name": "الاسم",
      "slug": "المعرّف",
      "parent": "التصنيف الأب",
      "products": "المنتجات",
      "status": "الحالة",
      "sortOrder": "الترتيب",
      "created": "تاريخ الإنشاء",
      "actions": "الإجراءات",
      "edit": "تعديل",
      "empty": "لم يتم العثور على تصنيفات",
      "of": "من",
      "perPage": "لكل صفحة",
      "previous": "السابق",
      "next": "التالي",
      "page": "صفحة {current} من {total}"
    },
    "form": {
      "createTitle": "تصنيف جديد",
      "createSubtitle": "إنشاء تصنيف منتج جديد",
      "editTitle": "تعديل التصنيف",
      "translations": "الترجمات",
      "settings": "الإعدادات",
      "parentCategory": "التصنيف الأب",
      "dangerZone": "منطقة الخطر",
      "deleteDescription": "إزالة هذا التصنيف نهائياً من متجرك. لن تتأثر المنتجات الموجودة في هذا التصنيف.",
      "restoreDescription": "استعادة هذا التصنيف لجعله متاحاً مرة أخرى.",
      "fields": {
        "name": "الاسم",
        "namePlaceholder": "مثال: الملابس",
        "slug": "المعرّف العام",
        "translationSlug": "معرّف الرابط",
        "slugPlaceholder": "مثال: clothing",
        "sortOrder": "ترتيب العرض",
        "isActive": "نشط"
      },
      "create": "إنشاء تصنيف",
      "creating": "جارٍ الإنشاء...",
      "save": "حفظ التغييرات",
      "saving": "جارٍ الحفظ...",
      "delete": "حذف التصنيف",
      "deleting": "جارٍ الحذف...",
      "restore": "استعادة التصنيف",
      "restoring": "جارٍ الاستعادة...",
      "cancel": "إلغاء",
      "deleteTitle": "حذف التصنيف",
      "deleteConfirm": "هل أنت متأكد من رغبتك في حذف هذا التصنيف؟ لا يمكن حذف التصنيفات التي تحتوي على تصنيفات فرعية أو منتجات.",
      "createSuccess": "تم إنشاء التصنيف",
      "createError": "فشل إنشاء التصنيف",
      "updateSuccess": "تم حفظ التصنيف",
      "updateError": "فشل حفظ التصنيف",
      "deleteSuccess": "تم حذف التصنيف",
      "deleteError": "فشل حذف التصنيف",
      "restoreSuccess": "تمت استعادة التصنيف",
      "restoreError": "فشل استعادة التصنيف"
    },
    "detail": {
      "error": "فشل تحميل التصنيف"
    }
  },
  "brands": {
    "title": "العلامات التجارية",
    "subtitle": "إدارة علامات متجرك التجارية",
    "new": "علامة تجارية جديدة",
    "loading": "جارٍ التحميل...",
    "filters": {
      "allStatuses": "جميع الحالات"
    },
    "status": {
      "active": "نشط",
      "inactive": "غير نشط",
      "deleted": "محذوف"
    },
    "table": {
      "logo": "الشعار",
      "name": "الاسم",
      "slug": "المعرّف",
      "products": "المنتجات",
      "status": "الحالة",
      "sortOrder": "الترتيب",
      "created": "تاريخ الإنشاء",
      "actions": "الإجراءات",
      "edit": "تعديل",
      "empty": "لم يتم العثور على علامات تجارية",
      "of": "من",
      "perPage": "لكل صفحة",
      "previous": "السابق",
      "next": "التالي",
      "page": "صفحة {current} من {total}"
    },
    "form": {
      "createTitle": "علامة تجارية جديدة",
      "createSubtitle": "إنشاء علامة تجارية جديدة للمنتجات",
      "editTitle": "تعديل العلامة التجارية",
      "details": "التفاصيل",
      "settings": "الإعدادات",
      "stats": "الإحصائيات",
      "dangerZone": "منطقة الخطر",
      "deleteDescription": "إزالة هذه العلامة التجارية نهائياً من متجرك. لن تتأثر المنتجات المرتبطة بها.",
      "restoreDescription": "استعادة هذه العلامة التجارية لجعلها متاحة مرة أخرى.",
      "fields": {
        "name": "الاسم",
        "namePlaceholder": "مثال: نايكي",
        "slug": "المعرّف",
        "slugPlaceholder": "مثال: nike",
        "description": "الوصف",
        "descriptionPlaceholder": "صف العلامة التجارية...",
        "logoUrl": "رابط الشعار",
        "logoUrlPlaceholder": "https://example.com/logo.png",
        "sortOrder": "ترتيب العرض",
        "isActive": "نشط",
        "productsCount": "المنتجات",
        "updatedAt": "آخر تحديث"
      },
      "create": "إنشاء علامة تجارية",
      "creating": "جارٍ الإنشاء...",
      "save": "حفظ التغييرات",
      "saving": "جارٍ الحفظ...",
      "delete": "حذف العلامة التجارية",
      "deleting": "جارٍ الحذف...",
      "restore": "استعادة العلامة التجارية",
      "restoring": "جارٍ الاستعادة...",
      "cancel": "إلغاء",
      "deleteTitle": "حذف العلامة التجارية",
      "deleteConfirm": "هل أنت متأكد من رغبتك في حذف هذه العلامة التجارية؟ لا يمكن حذف العلامات التجارية التي تحتوي على منتجات.",
      "createSuccess": "تم إنشاء العلامة التجارية",
      "createError": "فشل إنشاء العلامة التجارية",
      "updateSuccess": "تم حفظ العلامة التجارية",
      "updateError": "فشل حفظ العلامة التجارية",
      "deleteSuccess": "تم حذف العلامة التجارية",
      "deleteError": "فشل حذف العلامة التجارية",
      "restoreSuccess": "تمت استعادة العلامة التجارية",
      "restoreError": "فشل استعادة العلامة التجارية"
    },
    "detail": {
      "error": "فشل تحميل العلامة التجارية"
    }
  }
}
'

# =============================================================================
# FINAL SUMMARY — ALL PARTS
# =============================================================================

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ PART 5 COMPLETE"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "  ✅ src/locales/en/common.json  (updated — categories + brands)"
echo "  ✅ src/locales/ar/common.json  (updated — categories + brands)"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "🎉 ALL 5 PARTS COMPLETE"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📋 Post-run checklist:"
echo ""
echo "  1. Add categories + brands links to your sidebar:"
echo "     SidebarNav.tsx → add nav items using ROUTES.store(storeId)"
echo "     Use t('nav.categories') and t('nav.brands') for labels"
echo ""
echo "  2. Verify API_ROUTES proxy allowlist (if any):"
echo "     /api/proxy/route.ts — ensure /api/v1/admin/stores/* is forwarded"
echo ""
echo "  3. Run type-check:"
echo "     npx tsc --noEmit"
echo ""
echo "  4. Run dev server and test:"
echo "     npm run dev"
echo ""
echo "  5. Verify routes are accessible:"
echo "     /{locale}/stores/{storeId}/categories"
echo "     /{locale}/stores/{storeId}/categories/new"
echo "     /{locale}/stores/{storeId}/categories/{id}/edit"
echo "     /{locale}/stores/{storeId}/brands"
echo "     /{locale}/stores/{storeId}/brands/new"
echo "     /{locale}/stores/{storeId}/brands/{id}/edit"
echo ""
echo "════════════════════════════════════════════════════════════"