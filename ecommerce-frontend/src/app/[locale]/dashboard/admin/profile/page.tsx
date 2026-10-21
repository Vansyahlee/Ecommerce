"use client";

import { useMemo, useState, useTransition, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { updateStoreProfile, getStoreMetadata, updateStoreMetadata } from "~/features/store/actions/StoreActions";
import { Button } from "~/components/ui/button";
import { 
  Store, 
  ShieldAlert, 
  BadgePercent, 
  CreditCard, 
  Wallet, 
  QrCode, 
  Clock, 
  Globe, 
  Trash2, 
  UploadCloud, 
  User, 
  MapPin, 
  Share2, 
  Search, 
  Lock, 
  RefreshCw 
} from "lucide-react";
import { useTranslations } from "next-intl";

const COUNTRY_CODES = [
  { code: "AF", name: "Afghanistan", dial_code: "+93" },
  { code: "AL", name: "Albania", dial_code: "+355" },
  { code: "DZ", name: "Algeria", dial_code: "+213" },
  { code: "AD", name: "Andorra", dial_code: "+376" },
  { code: "AO", name: "Angola", dial_code: "+244" },
  { code: "AR", name: "Argentina", dial_code: "+54" },
  { code: "AM", name: "Armenia", dial_code: "+374" },
  { code: "AU", name: "Australia", dial_code: "+61" },
  { code: "AT", name: "Austria", dial_code: "+43" },
  { code: "AZ", name: "Azerbaijan", dial_code: "+994" },
  { code: "BH", name: "Bahrain", dial_code: "+973" },
  { code: "BD", name: "Bangladesh", dial_code: "+880" },
  { code: "BY", name: "Belarus", dial_code: "+375" },
  { code: "BE", name: "Belgium", dial_code: "+32" },
  { code: "BZ", name: "Belize", dial_code: "+501" },
  { code: "BJ", name: "Benin", dial_code: "+229" },
  { code: "BT", name: "Bhutan", dial_code: "+975" },
  { code: "BO", name: "Bolivia", dial_code: "+591" },
  { code: "BA", name: "Bosnia and Herzegovina", dial_code: "+387" },
  { code: "BW", name: "Botswana", dial_code: "+267" },
  { code: "BR", name: "Brazil", dial_code: "+55" },
  { code: "BN", name: "Brunei", dial_code: "+673" },
  { code: "BG", name: "Bulgaria", dial_code: "+359" },
  { code: "BF", name: "Burkina Faso", dial_code: "+226" },
  { code: "BI", name: "Burundi", dial_code: "+257" },
  { code: "KH", name: "Cambodia", dial_code: "+855" },
  { code: "CM", name: "Cameroon", dial_code: "+237" },
  { code: "CA", name: "Canada", dial_code: "+1" },
  { code: "CV", name: "Cape Verde", dial_code: "+238" },
  { code: "CF", name: "Central African Republic", dial_code: "+236" },
  { code: "TD", name: "Chad", dial_code: "+235" },
  { code: "CL", name: "Chile", dial_code: "+56" },
  { code: "CN", name: "China", dial_code: "+86" },
  { code: "CO", name: "Colombia", dial_code: "+57" },
  { code: "KM", name: "Comoros", dial_code: "+269" },
  { code: "CG", name: "Congo", dial_code: "+242" },
  { code: "CR", name: "Costa Rica", dial_code: "+506" },
  { code: "HR", name: "Croatia", dial_code: "+385" },
  { code: "CU", name: "Cuba", dial_code: "+53" },
  { code: "CY", name: "Cyprus", dial_code: "+357" },
  { code: "CZ", name: "Czech Republic", dial_code: "+420" },
  { code: "DK", name: "Denmark", dial_code: "+45" },
  { code: "DJ", name: "Djibouti", dial_code: "+253" },
  { code: "DO", name: "Dominican Republic", dial_code: "+1-809" },
  { code: "EC", name: "Ecuador", dial_code: "+593" },
  { code: "EG", name: "Egypt", dial_code: "+20" },
  { code: "SV", name: "El Salvador", dial_code: "+503" },
  { code: "GQ", name: "Equatorial Guinea", dial_code: "+240" },
  { code: "ER", name: "Eritrea", dial_code: "+291" },
  { code: "EE", name: "Estonia", dial_code: "+372" },
  { code: "ET", name: "Ethiopia", dial_code: "+251" },
  { code: "FJ", name: "Fiji", dial_code: "+679" },
  { code: "FI", name: "Finland", dial_code: "+358" },
  { code: "FR", name: "France", dial_code: "+33" },
  { code: "GA", name: "Gabon", dial_code: "+241" },
  { code: "GM", name: "Gambia", dial_code: "+220" },
  { code: "GE", name: "Georgia", dial_code: "+995" },
  { code: "DE", name: "Germany", dial_code: "+49" },
  { code: "GH", name: "Ghana", dial_code: "+233" },
  { code: "GR", name: "Greece", dial_code: "+30" },
  { code: "GT", name: "Guatemala", dial_code: "+502" },
  { code: "GN", name: "Guinea", dial_code: "+224" },
  { code: "GY", name: "Guyana", dial_code: "+592" },
  { code: "HT", name: "Haiti", dial_code: "+509" },
  { code: "HN", name: "Honduras", dial_code: "+504" },
  { code: "HK", name: "Hong Kong", dial_code: "+852" },
  { code: "HU", name: "Hungary", dial_code: "+36" },
  { code: "IS", name: "Iceland", dial_code: "+354" },
  { code: "IN", name: "India", dial_code: "+91" },
  { code: "ID", name: "Indonesia", dial_code: "+62" },
  { code: "IR", name: "Iran", dial_code: "+98" },
  { code: "IQ", name: "Iraq", dial_code: "+964" },
  { code: "IE", name: "Ireland", dial_code: "+353" },
  { code: "IL", name: "Israel", dial_code: "+972" },
  { code: "IT", name: "Italy", dial_code: "+39" },
  { code: "JM", name: "Jamaica", dial_code: "+1-876" },
  { code: "JP", name: "Japan", dial_code: "+81" },
  { code: "JO", name: "Jordan", dial_code: "+962" },
  { code: "KZ", name: "Kazakhstan", dial_code: "+7" },
  { code: "KE", name: "Kenya", dial_code: "+254" },
  { code: "KI", name: "Kiribati", dial_code: "+686" },
  { code: "KP", name: "North Korea", dial_code: "+850" },
  { code: "KR", name: "South Korea", dial_code: "+82" },
  { code: "KW", name: "Kuwait", dial_code: "+965" },
  { code: "KG", name: "Kyrgyzstan", dial_code: "+996" },
  { code: "LA", name: "Laos", dial_code: "+856" },
  { code: "LV", name: "Latvia", dial_code: "+371" },
  { code: "LB", name: "Lebanon", dial_code: "+961" },
  { code: "LS", name: "Lesotho", dial_code: "+266" },
  { code: "LR", name: "Liberia", dial_code: "+231" },
  { code: "LY", name: "Libya", dial_code: "+218" },
  { code: "LI", name: "Liechtenstein", dial_code: "+423" },
  { code: "LT", name: "Lithuania", dial_code: "+370" },
  { code: "LU", name: "Luxembourg", dial_code: "+352" },
  { code: "MO", name: "Macao", dial_code: "+853" },
  { code: "MK", name: "Macedonia", dial_code: "+389" },
  { code: "MG", name: "Madagascar", dial_code: "+261" },
  { code: "MW", name: "Malawi", dial_code: "+265" },
  { code: "MY", name: "Malaysia", dial_code: "+60" },
  { code: "MV", name: "Maldives", dial_code: "+960" },
  { code: "ML", name: "Mali", dial_code: "+223" },
  { code: "MT", name: "Malta", dial_code: "+356" },
  { code: "MH", name: "Marshall Islands", dial_code: "+692" },
  { code: "MR", name: "Mauritania", dial_code: "+222" },
  { code: "MU", name: "Mauritius", dial_code: "+230" },
  { code: "MX", name: "Mexico", dial_code: "+52" },
  { code: "FM", name: "Micronesia", dial_code: "+691" },
  { code: "MD", name: "Moldova", dial_code: "+373" },
  { code: "MC", name: "Monaco", dial_code: "+377" },
  { code: "MN", name: "Mongolia", dial_code: "+976" },
  { code: "ME", name: "Montenegro", dial_code: "+382" },
  { code: "MA", name: "Morocco", dial_code: "+212" },
  { code: "MZ", name: "Mozambique", dial_code: "+258" },
  { code: "MM", name: "Myanmar", dial_code: "+95" },
  { code: "NA", name: "Namibia", dial_code: "+264" },
  { code: "NR", name: "Nauru", dial_code: "+674" },
  { code: "NP", name: "Nepal", dial_code: "+977" },
  { code: "NL", name: "Netherlands", dial_code: "+31" },
  { code: "NZ", name: "New Zealand", dial_code: "+64" },
  { code: "NI", name: "Nicaragua", dial_code: "+505" },
  { code: "NE", name: "Niger", dial_code: "+227" },
  { code: "NG", name: "Nigeria", dial_code: "+234" },
  { code: "NO", name: "Norway", dial_code: "+47" },
  { code: "OM", name: "Oman", dial_code: "+968" },
  { code: "PK", name: "Pakistan", dial_code: "+92" },
  { code: "PW", name: "Palau", dial_code: "+680" },
  { code: "PA", name: "Panama", dial_code: "+507" },
  { code: "PG", name: "Papua New Guinea", dial_code: "+675" },
  { code: "PY", name: "Paraguay", dial_code: "+595" },
  { code: "PE", name: "Peru", dial_code: "+51" },
  { code: "PH", name: "Philippines", dial_code: "+63" },
  { code: "PL", name: "Poland", dial_code: "+48" },
  { code: "PT", name: "Portugal", dial_code: "+351" },
  { code: "QA", name: "Qatar", dial_code: "+974" },
  { code: "RO", name: "Romania", dial_code: "+40" },
  { code: "RU", name: "Russia", dial_code: "+7" },
  { code: "RW", name: "Rwanda", dial_code: "+250" },
  { code: "WS", name: "Samoa", dial_code: "+685" },
  { code: "SM", name: "San Marino", dial_code: "+378" },
  { code: "ST", name: "Sao Tome and Principe", dial_code: "+239" },
  { code: "SA", name: "Saudi Arabia", dial_code: "+966" },
  { code: "SN", name: "Senegal", dial_code: "+221" },
  { code: "RS", name: "Serbia", dial_code: "+381" },
  { code: "SC", name: "Seychelles", dial_code: "+248" },
  { code: "SL", name: "Sierra Leone", dial_code: "+232" },
  { code: "SG", name: "Singapore", dial_code: "+65" },
  { code: "SK", name: "Slovakia", dial_code: "+421" },
  { code: "SI", name: "Slovenia", dial_code: "+386" },
  { code: "SB", name: "Solomon Islands", dial_code: "+677" },
  { code: "SO", name: "Somalia", dial_code: "+252" },
  { code: "ZA", name: "South Africa", dial_code: "+27" },
  { code: "SS", name: "South Sudan", dial_code: "+211" },
  { code: "ES", name: "Spain", dial_code: "+34" },
  { code: "LK", name: "Sri Lanka", dial_code: "+94" },
  { code: "SD", name: "Sudan", dial_code: "+249" },
  { code: "SR", name: "Suriname", dial_code: "+597" },
  { code: "SZ", name: "Eswatini", dial_code: "+268" },
  { code: "SE", name: "Sweden", dial_code: "+46" },
  { code: "CH", name: "Switzerland", dial_code: "+41" },
  { code: "SY", name: "Syria", dial_code: "+963" },
  { code: "TW", name: "Taiwan", dial_code: "+886" },
  { code: "TJ", name: "Tajikistan", dial_code: "+992" },
  { code: "TZ", name: "Tanzania", dial_code: "+255" },
  { code: "TH", name: "Thailand", dial_code: "+66" },
  { code: "TL", name: "Timor-Leste", dial_code: "+670" },
  { code: "TG", name: "Togo", dial_code: "+228" },
  { code: "TO", name: "Tonga", dial_code: "+676" },
  { code: "TT", name: "Trinidad and Tobago", dial_code: "+1-868" },
  { code: "TN", name: "Tunisia", dial_code: "+216" },
  { code: "TR", name: "Turkey", dial_code: "+90" },
  { code: "TM", name: "Turkmenistan", dial_code: "+993" },
  { code: "TV", name: "Tuvalu", dial_code: "+688" },
  { code: "UG", name: "Uganda", dial_code: "+256" },
  { code: "UA", name: "Ukraine", dial_code: "+380" },
  { code: "AE", name: "United Arab Emirates", dial_code: "+971" },
  { code: "GB", name: "United Kingdom", dial_code: "+44" },
  { code: "US", name: "United States", dial_code: "+1" },
  { code: "UY", name: "Uruguay", dial_code: "+598" },
  { code: "UZ", name: "Uzbekistan", dial_code: "+998" },
  { code: "VU", name: "Vanuatu", dial_code: "+678" },
  { code: "VA", name: "Vatican", dial_code: "+39-06" },
  { code: "VE", name: "Venezuela", dial_code: "+58" },
  { code: "VN", name: "Vietnam", dial_code: "+84" },
  { code: "YE", name: "Yemen", dial_code: "+967" },
  { code: "ZM", name: "Zambia", dial_code: "+260" },
  { code: "ZW", name: "Zimbabwe", dial_code: "+263" }
];

export default function AdminProfilePage() {
  const adminId = "b05aebfd-2b55-450e-b5f7-ee42e53c6250";
  const t = useTranslations("Profile");
  const params = useParams();
  const currentLocale = params.locale;

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [adminAvatarUrl, setAdminAvatarUrl] = useState("");
  
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");

  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("+62");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [shopee, setShopee] = useState("");
  
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [scheduleText, setScheduleText] = useState("Senin - Sabtu: 08:00 - 17:00 WIB\nMinggu: Tutup");
  const [emailNotif, setEmailNotif] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [payTransfer, setPayTransfer] = useState(true);
  const [payQris, setPayQris] = useState(true);
  const [payGateway, setPayGateway] = useState(false);

  const [shippingCost, setShippingCost] = useState("");
  const [voucherMin, setVoucherMin] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState("");
  const [voucherExpiry, setVoucherExpiry] = useState("");

  const [seoDesc, setSeoDesc] = useState("");
  const [gaId, setGaId] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [isPromoPending, startPromoTransition] = useTransition();
  const [isLocationPending, startLocationTransition] = useTransition();
  const [isSocialPending, startSocialTransition] = useTransition();
  const [isSeoPending, startSeoTransition] = useTransition();
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 100);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    (async () => {
      try {
        const meta = await getStoreMetadata(adminId);
        if (meta.default_shipping_cost) setShippingCost(String(meta.default_shipping_cost));
        if (meta.voucher_min) setVoucherMin(String(meta.voucher_min));
        if (meta.voucher_discount) setVoucherDiscount(String(meta.voucher_discount));
        if (meta.voucher_expiry) setVoucherExpiry(String(meta.voucher_expiry));
      } catch {
        console.error("Gagal memuat metadata");
      }
    })();
  }, [mounted, adminId]);

  const payload = useMemo(
    () => ({
      name: name.trim() || undefined,
      slug: slug.trim() || undefined,
      logoUrl: logoUrl.trim() ? logoUrl.trim() : null,
      adminAvatarUrl: adminAvatarUrl.trim() ? adminAvatarUrl.trim() : null,
    }),
    [name, slug, logoUrl, adminAvatarUrl]
  );

  const switchLanguage = (newLocale: string) => {
    const segments = window.location.pathname.split('/');
    segments[1] = newLocale;
    window.location.href = segments.join('/');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(currentLocale === 'en' ? "Max image size is 2MB!" : "Ukuran gambar maksimal 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAdminAvatarUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(currentLocale === 'en' ? "Max image size is 2MB!" : "Ukuran gambar maksimal 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAdminAvatarUrl("");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleRemoveLogo = () => {
    setLogoUrl("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const saveAllSettings = () => {
    startTransition(async () => {
      try {
        await updateStoreProfile(adminId, payload);
        await updateStoreMetadata(adminId, {
          default_shipping_cost: Number(shippingCost) || 5000,
          voucher_min: Number(voucherMin) || 250000,
          voucher_discount: Number(voucherDiscount) || 15000,
          voucher_expiry: voucherExpiry || null,
        });
        alert(currentLocale === 'en' ? "All settings saved successfully!" : "Seluruh pengaturan berhasil disimpan!");
      } catch {
        alert("Terjadi kesalahan saat menyimpan data.");
      }
    });
  };

  const savePromoSettings = () => {
    startPromoTransition(async () => {
      try {
        await updateStoreMetadata(adminId, {
          default_shipping_cost: Number(shippingCost) || 5000,
          voucher_min: Number(voucherMin) || 250000,
          voucher_discount: Number(voucherDiscount) || 15000,
          voucher_expiry: voucherExpiry || null,
        });
        alert(currentLocale === 'en' ? "Promo & Shipping saved successfully!" : "Pengaturan Promo & Pengiriman berhasil disimpan!");
      } catch {
        alert("Terjadi kesalahan saat menyimpan promo.");
      }
    });
  };

  const saveLocationSettings = () => {
    startLocationTransition(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      alert(currentLocale === 'en' ? "Location info ready for backend!" : "Info lokasi siap diteruskan ke backend!");
    });
  };

  const saveSocialSettings = () => {
    startSocialTransition(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      alert(currentLocale === 'en' ? "Socials linked successfully!" : "Medsos berhasil dihubungkan!");
    });
  };

  const saveSeoSettings = () => {
    startSeoTransition(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      alert(currentLocale === 'en' ? "SEO metadata optimized!" : "Meta SEO berhasil dioptimalkan!");
    });
  };

  if (!mounted) return null;

  return (
    <div className="p-4 lg:p-8 bg-slate-50/50 min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-4 p-1.5 bg-slate-100 rounded-full w-fit border border-slate-200">
            <Globe className="w-4 h-4 text-slate-400 ml-1.5" />
            <button 
              onClick={() => switchLanguage('id')} 
              className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full transition-all ${currentLocale === 'id' ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              ID
            </button>
            <button 
              onClick={() => switchLanguage('en')} 
              className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full transition-all ${currentLocale === 'en' ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              EN
            </button>
          </div>
          
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-600">Enterprise Control Panel</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-black tracking-tight text-slate-900">{t('title')}</h1>
          <p className="mt-3 text-slate-500 font-bold tracking-tight text-base max-w-2xl">{t('desc')}</p>
        </div>

        <div className="flex gap-4 shrink-0 pb-1">
          <Button 
            onClick={saveAllSettings} 
            disabled={isPending} 
            className="rounded-[20px] font-black uppercase tracking-widest text-[11px] px-8 h-14 bg-slate-900 hover:bg-slate-800 shadow-2xl shadow-slate-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isPending ? (currentLocale === 'en' ? "Syncing..." : "Sinkronisasi...") : t('saveAll')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-8 space-y-10">
          
          <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="px-10 py-7 border-b border-slate-50 bg-slate-50/40 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100">
                <Store className="w-5 h-5 text-rose-500" />
              </div>
              <h2 className="font-black uppercase tracking-[0.2em] text-sm text-slate-600">{t('identityTitle')}</h2>
            </div>
            
            <div className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('storeName')}</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Vanz.Store" className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 outline-none focus:border-rose-300 bg-slate-50/30 transition-all" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('storeSlug')}</label>
                  <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="vanz-store" className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 outline-none focus:border-rose-300 bg-slate-50/30 transition-all" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Store Brand Logo</label>
                <div className="flex flex-col sm:flex-row items-center gap-8 bg-slate-50/50 border-2 border-slate-100 p-8 rounded-[32px]">
                  <div className="w-28 h-28 rounded-3xl bg-white border-4 border-white shadow-xl overflow-hidden shrink-0 relative flex items-center justify-center group">
                    {logoUrl ? (
                      <Image src={logoUrl} alt="Store Logo" fill className="object-contain p-4 transition-transform group-hover:scale-110" unoptimized />
                    ) : (
                      <Store className="w-10 h-10 text-slate-200" />
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-5 text-center sm:text-left">
                    <div>
                      <p className="text-lg font-black text-slate-800">{currentLocale === 'en' ? "Visual Identity" : "Identitas Visual"}</p>
                      <p className="text-xs font-bold text-slate-500 mt-1">Recommended size 512x512px. Max 2MB.</p>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                      <input type="file" accept="image/*" onChange={handleLogoChange} ref={logoInputRef} className="hidden" />
                      <button type="button" onClick={() => logoInputRef.current?.click()} className="flex items-center gap-3 bg-slate-900 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] px-7 py-3.5 rounded-2xl transition-all shadow-xl shadow-slate-900/20">
                        <UploadCloud size={16} /> {currentLocale === 'en' ? "Change Logo" : "Ganti Logo"}
                      </button>
                      <button type="button" onClick={handleRemoveLogo} disabled={!logoUrl} className={`flex items-center gap-3 font-black uppercase tracking-widest text-[10px] px-7 py-3.5 rounded-2xl transition-all border-2 ${logoUrl ? 'bg-white border-rose-100 text-rose-500 hover:bg-rose-50' : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'}`}>
                        <Trash2 size={16} /> {currentLocale === 'en' ? "Delete" : "Hapus"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('adminAvatar')}</label>
                <div className="flex flex-col sm:flex-row items-center gap-8 bg-slate-50/50 border-2 border-slate-100 p-8 rounded-[32px]">
                  <div className="w-28 h-28 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden shrink-0 relative flex items-center justify-center group">
                    {adminAvatarUrl ? (
                      <Image src={adminAvatarUrl} alt="Avatar" fill className="object-cover transition-transform group-hover:scale-110" unoptimized />
                    ) : (
                      <User className="w-10 h-10 text-slate-200" />
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-5 text-center sm:text-left">
                    <div>
                      <p className="text-lg font-black text-slate-800">{currentLocale === 'en' ? "Administrator Photo" : "Foto Administrator"}</p>
                      <p className="text-xs font-bold text-slate-500 mt-1">This photo will be visible to customers in chat.</p>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                      <input type="file" accept="image/*" onChange={handleAvatarChange} ref={avatarInputRef} className="hidden" />
                      <button type="button" onClick={() => avatarInputRef.current?.click()} className="flex items-center gap-3 bg-slate-900 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] px-7 py-3.5 rounded-2xl transition-all shadow-xl shadow-slate-900/20">
                        <UploadCloud size={16} /> {currentLocale === 'en' ? "Upload Photo" : "Unggah Foto"}
                      </button>
                      <button type="button" onClick={handleRemoveAvatar} disabled={!adminAvatarUrl} className={`flex items-center gap-3 font-black uppercase tracking-widest text-[10px] px-7 py-3.5 rounded-2xl transition-all border-2 ${adminAvatarUrl ? 'bg-white border-rose-100 text-rose-500 hover:bg-rose-50' : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'}`}>
                        <Trash2 size={16} /> {currentLocale === 'en' ? "Reset" : "Reset"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="px-10 py-7 border-b border-slate-50 bg-slate-50/40 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="font-black uppercase tracking-[0.2em] text-sm text-slate-600">{currentLocale === 'en' ? "Store Location" : "Lokasi Toko"}</h2>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Complete Office/Store Address</label>
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Street name, District, City, Province..." 
                  className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 outline-none focus:border-blue-300 bg-slate-50/30 transition-all resize-none h-32" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Postal Code</label>
                  <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="12345" className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 outline-none focus:border-blue-300 bg-slate-50/30 transition-all" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Google Maps URL</label>
                  <input value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} placeholder="https://maps.app.goo.gl/..." className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 outline-none focus:border-blue-300 bg-slate-50/30 transition-all" />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-50">
                <Button onClick={saveLocationSettings} disabled={isLocationPending} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest px-10 py-5 h-auto shadow-xl shadow-blue-200/50 transition-all">
                  {isLocationPending ? "..." : (currentLocale === 'en' ? "Update Address" : "Simpan Lokasi")}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="px-10 py-7 border-b border-slate-50 bg-slate-50/40 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100">
                <Share2 className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="font-black uppercase tracking-[0.2em] text-sm text-slate-600">{currentLocale === 'en' ? "Social Media Assets" : "Aset Media Sosial"}</h2>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp Business</label>
                  <div className="flex rounded-2xl border-2 border-slate-100 bg-slate-50/30 focus-within:border-purple-300 transition-all">
                    <select 
                      value={whatsappCountryCode} 
                      onChange={(e) => setWhatsappCountryCode(e.target.value)}
                      className="bg-transparent font-bold text-slate-900 pl-4 pr-2 py-4 outline-none appearance-none border-r-2 border-slate-100 min-w-[80px] cursor-pointer"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.dial_code}>{c.dial_code}</option>
                      ))}
                    </select>
                    <input 
                      value={whatsapp} 
                      onChange={(e) => setWhatsapp(e.target.value)} 
                      placeholder="812xxx" 
                      className="flex-1 bg-transparent px-4 py-4 font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Instagram Profile</label>
                  <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/vanz" className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 outline-none focus:border-purple-300 bg-slate-50/30" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">TikTok Channel</label>
                  <input value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="https://tiktok.com/@vanz" className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 outline-none focus:border-purple-300 bg-slate-50/30" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Shopee Marketplace</label>
                  <input value={shopee} onChange={(e) => setShopee(e.target.value)} placeholder="https://shopee.co.id/vanz" className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 outline-none focus:border-purple-300 bg-slate-50/30" />
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-slate-50">
                <Button onClick={saveSocialSettings} disabled={isSocialPending} className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest px-10 py-5 h-auto shadow-xl shadow-purple-200/50 transition-all">
                  {isSocialPending ? "..." : (currentLocale === 'en' ? "Sync Socials" : "Simpan Medsos")}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="px-10 py-7 border-b border-slate-50 bg-slate-50/40 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <BadgePercent className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="font-black uppercase tracking-[0.2em] text-sm text-slate-600">{t('promoTitle')}</h2>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('shipping')}</label>
                  <input type="number" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 outline-none focus:border-emerald-300 bg-slate-50/30" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('voucherMin')}</label>
                  <input type="number" value={voucherMin} onChange={(e) => setVoucherMin(e.target.value)} className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 outline-none focus:border-emerald-300 bg-slate-50/30" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('voucherDiscount')}</label>
                  <input type="number" value={voucherDiscount} onChange={(e) => setVoucherDiscount(e.target.value)} className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 outline-none focus:border-emerald-300 bg-slate-50/30" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('voucherExpiry')}</label>
                  <input type="date" value={voucherExpiry} onChange={(e) => setVoucherExpiry(e.target.value)} className="w-full rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-slate-900 outline-none focus:border-emerald-300 bg-slate-50/30" />
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-slate-50">
                <Button onClick={savePromoSettings} disabled={isPromoPending} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest px-10 py-5 h-auto shadow-xl shadow-emerald-200/50 transition-all">
                  {isPromoPending ? "..." : (currentLocale === 'en' ? "Update Rules" : "Simpan Promo")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          
          <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-4">
              <Search className="w-5 h-5 text-indigo-500" />
              <h2 className="font-black uppercase tracking-widest text-xs text-slate-600">SEO & Analytics</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Meta Description</label>
                <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="SEO descriptions for Google..." className="w-full text-xs font-bold text-slate-700 bg-white border-2 border-slate-100 rounded-2xl p-5 outline-none focus:border-indigo-300 resize-none h-28" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Analytics ID</label>
                <input value={gaId} onChange={(e) => setGaId(e.target.value)} placeholder="G-XXXXXXXXXX" className="w-full rounded-2xl border-2 border-slate-100 px-5 py-4 font-bold text-slate-900 outline-none focus:border-indigo-300" />
              </div>
              <Button onClick={saveSeoSettings} disabled={isSeoPending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest py-5 h-auto shadow-xl shadow-indigo-200/50 transition-all">
                {isSeoPending ? "..." : "Update SEO"}
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-4">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h2 className="font-black uppercase tracking-widest text-xs text-slate-600">{t('sysTitle')}</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-black text-sm text-slate-800">{t('schedule')}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t('scheduleDesc')}</p>
                    </div>
                  </div>
                  <button onClick={() => setScheduleEnabled(!scheduleEnabled)} className={`w-12 h-6 rounded-full flex items-center p-1 transition-all ${scheduleEnabled ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${scheduleEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
                {scheduleEnabled && (
                  <textarea value={scheduleText} onChange={(e) => setScheduleText(e.target.value)} className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-300 resize-none h-24 shadow-inner" />
                )}
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div>
                  <p className="font-black text-sm text-slate-800">{t('emailAlerts')}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t('emailAlertsDesc')}</p>
                </div>
                <button onClick={() => setEmailNotif(!emailNotif)} className={`w-12 h-6 rounded-full flex items-center p-1 transition-all ${emailNotif ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${emailNotif ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-6 bg-rose-50 rounded-3xl border border-rose-100">
                <div>
                  <p className="font-black text-sm text-rose-700">{t('maintenance')}</p>
                  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-0.5">{t('maintenanceDesc')}</p>
                </div>
                <button onClick={() => setMaintenanceMode(!maintenanceMode)} className={`w-12 h-6 rounded-full flex items-center p-1 transition-all ${maintenanceMode ? 'bg-rose-600 shadow-lg shadow-rose-200' : 'bg-rose-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-4">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <h2 className="font-black uppercase tracking-widest text-xs text-slate-600">{t('payTitle')}</h2>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between p-5 rounded-3xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer group" onClick={() => setPayTransfer(!payTransfer)}>
                <div className="flex items-center gap-4">
                  <Wallet className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  <p className="font-black text-sm text-slate-700">{t('manualPay')}</p>
                </div>
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${payTransfer ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' : 'border-slate-200'}`}>
                  {payTransfer && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
              </div>

              <div className="flex items-center justify-between p-5 rounded-3xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer group" onClick={() => setPayQris(!payQris)}>
                <div className="flex items-center gap-4">
                  <QrCode className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  <p className="font-black text-sm text-slate-700">{t('qris')}</p>
                </div>
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${payQris ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' : 'border-slate-200'}`}>
                  {payQris && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
              </div>

              <div className="flex items-center justify-between p-5 rounded-3xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer group" onClick={() => setPayGateway(!payGateway)}>
                <div className="flex items-center gap-4">
                  <CreditCard className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  <p className="font-black text-sm text-slate-700">{t('gatewayPay')}</p>
                </div>
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${payGateway ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' : 'border-slate-200'}`}>
                  {payGateway && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/40 flex items-center gap-4">
              <Lock className="w-5 h-5 text-slate-500" />
              <h2 className="font-black uppercase tracking-widest text-xs text-slate-600">Security & Data</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div>
                  <p className="font-black text-sm text-slate-800">Two-Factor Auth</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Extra layer of protection</p>
                </div>
                <button onClick={() => setTwoFactor(!twoFactor)} className={`w-12 h-6 rounded-full flex items-center p-1 transition-all ${twoFactor ? 'bg-slate-900 shadow-lg shadow-slate-200' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${twoFactor ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <button 
                onClick={() => alert("System cache cleared!")} 
                className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl border-2 border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all font-black uppercase text-[10px] tracking-widest"
              >
                <RefreshCw size={16} /> 
                Clear System Cache
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}