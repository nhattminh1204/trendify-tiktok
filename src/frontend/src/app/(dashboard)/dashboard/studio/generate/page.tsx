"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Package,
  Film,
  Bot,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Search,
  BadgeCheck,
  Tag,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS = [
  { id: "p1", name: "Váy Hoa Mùa Hè Premium", category: "Váy & Đầm", product_type: "fashion_female", commission_rate: 20, thumbnail_url: null },
  { id: "p2", name: "Đồng hồ Cơ Classic Gold", category: "Đồng hồ", product_type: "watch", commission_rate: 15, thumbnail_url: null },
  { id: "p3", name: "Túi Da Thật Luxury", category: "Túi xách", product_type: "handbag", commission_rate: 18, thumbnail_url: null },
  { id: "p4", name: "Son Môi Lì Matte 24H", category: "Son môi", product_type: "cosmetics", commission_rate: 25, thumbnail_url: null },
  { id: "p5", name: "Áo Khoác Bomber Unisex", category: "Áo khoác", product_type: "fashion_female", commission_rate: 22, thumbnail_url: null },
];

const MOCK_TEMPLATES = [
  { id: "t1", name: "Mirror Selfie Outfit Reveal", video_style: "mirror_selfie", compatible_product_types: ["fashion_female", "fashion_male"], has_human_subject: true, estimated_duration_seconds: 28, thumbnail_url: null },
  { id: "t2", name: "Catwalk Street Style", video_style: "catwalk", compatible_product_types: ["fashion_female", "footwear"], has_human_subject: true, estimated_duration_seconds: 22 },
  { id: "t3", name: "Luxury Wrist Close-Up", video_style: "luxury_cinematic", compatible_product_types: ["watch", "jewelry"], has_human_subject: false, estimated_duration_seconds: 18 },
  { id: "t4", name: "Before / After Makeup", video_style: "before_after", compatible_product_types: ["cosmetics"], has_human_subject: true, estimated_duration_seconds: 35 },
  { id: "t5", name: "Bag Drop Lifestyle", video_style: "lifestyle_carry", compatible_product_types: ["handbag", "footwear"], has_human_subject: false, estimated_duration_seconds: 20 },
  { id: "t6", name: "Transition Outfit Change", video_style: "transition_outfit", compatible_product_types: ["fashion_female", "fashion_male"], has_human_subject: true, estimated_duration_seconds: 30 },
];

const MOCK_MODELS = [
  { id: "m1", display_name: "Luna", gender: "female", age_range: "twenties", style: "luxury", source: "system", thumbnail_url: null },
  { id: "m2", display_name: "Minh", gender: "male", age_range: "thirties", style: "casual", source: "system", thumbnail_url: null },
  { id: "m3", display_name: "Ami", gender: "female", age_range: "twenties", style: "sporty", source: "system", thumbnail_url: null },
  { id: "m4", display_name: "Alex", gender: "neutral", age_range: "twenties", style: "streetwear", source: "system", thumbnail_url: null },
  { id: "m5", display_name: "My Model", gender: "female", age_range: "twenties", style: "casual", source: "user_upload", thumbnail_url: null },
];

// ─── Step indicator ──────────────────────────────────────────────────────────

const STEPS = ["Sản phẩm", "Template", "AI Model", "Tạo video"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                  done ? "bg-brand-600 text-white" : active ? "bg-brand-600 text-white" : "bg-white border-2 border-gray-200 text-gray-400"
                )}
              >
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn("text-[11px] font-medium mt-1.5 whitespace-nowrap", done || active ? "text-brand-600" : "text-gray-400")}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("w-16 h-0.5 mb-5 mx-1", i < current ? "bg-brand-600" : "bg-gray-200")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Select Product ──────────────────────────────────────────────────

function StepProduct({ selected, onSelect }: { selected: typeof MOCK_PRODUCTS[0] | null; onSelect: (p: typeof MOCK_PRODUCTS[0]) => void }) {
  const [query, setQuery] = useState("");
  const filtered = MOCK_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Chọn sản phẩm</h2>
      <p className="text-sm text-gray-500 mb-5">Chọn sản phẩm affiliate bạn muốn quảng bá</p>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm sản phẩm..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 h-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
      </div>
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
        {filtered.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
              selected?.id === p.id
                ? "border-brand-500 bg-brand-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                {p.commission_rate}% hoa hồng
              </span>
              <span className="text-[10px] font-medium text-brand-600 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded-full">
                {p.product_type}
              </span>
            </div>
            {selected?.id === p.id && (
              <BadgeCheck className="w-5 h-5 text-brand-600 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Select Template ─────────────────────────────────────────────────

function StepTemplate({
  productType,
  selected,
  onSelect,
}: {
  productType: string;
  selected: typeof MOCK_TEMPLATES[0] | null;
  onSelect: (t: typeof MOCK_TEMPLATES[0]) => void;
}) {
  const compatible = MOCK_TEMPLATES.filter(t => t.compatible_product_types.includes(productType));

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Chọn template viral</h2>
      <p className="text-sm text-gray-500 mb-5">
        Template phù hợp với loại sản phẩm <span className="font-medium text-brand-600">{productType}</span>
      </p>
      {compatible.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Film className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Chưa có template phù hợp</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
          {compatible.map(t => (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                selected?.id === t.id
                  ? "border-brand-500 bg-brand-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div className="w-full aspect-video rounded-lg bg-gray-100 flex items-center justify-center mb-2">
                <Film className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-xs font-semibold text-gray-900 truncate">{t.name}</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-[10px] font-medium text-brand-600 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded-full">
                  {t.video_style}
                </span>
                {!t.has_human_subject && (
                  <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    No model
                  </span>
                )}
                <span className="text-[10px] text-gray-400">{t.estimated_duration_seconds}s</span>
              </div>
              {selected?.id === t.id && (
                <div className="mt-1.5">
                  <BadgeCheck className="w-4 h-4 text-brand-600" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Select AI Model ─────────────────────────────────────────────────

function StepModel({ selected, onSelect }: { selected: typeof MOCK_MODELS[0] | null; onSelect: (m: typeof MOCK_MODELS[0]) => void }) {
  const [genderFilter, setGenderFilter] = useState("all");

  const filtered = MOCK_MODELS.filter(m => genderFilter === "all" || m.gender === genderFilter);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Chọn AI Model</h2>
      <p className="text-sm text-gray-500 mb-4">Model sẽ thay thế nhân vật trong video viral</p>
      <div className="flex gap-2 mb-4">
        {["all", "female", "male", "neutral"].map(g => (
          <button
            key={g}
            onClick={() => setGenderFilter(g)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              genderFilter === g ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            )}
          >
            {g === "all" ? "Tất cả" : g}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 max-h-72 overflow-y-auto">
        {filtered.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m)}
            className={cn(
              "p-3 rounded-xl border text-center transition-all",
              selected?.id === m.id
                ? "border-brand-500 bg-brand-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-100 to-violet-100 flex items-center justify-center mx-auto mb-2">
              <Bot className="w-7 h-7 text-brand-400" />
            </div>
            <p className="text-xs font-semibold text-gray-900 truncate">{m.display_name}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{m.gender} · {m.style}</p>
            {m.source === "user_upload" && (
              <span className="text-[9px] font-medium text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                Custom
              </span>
            )}
            {selected?.id === m.id && (
              <BadgeCheck className="w-4 h-4 text-brand-600 mx-auto mt-1" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 4: Review & Generate ───────────────────────────────────────────────

function StepGenerate({
  product,
  template,
  model,
  onGenerate,
  loading,
}: {
  product: typeof MOCK_PRODUCTS[0];
  template: typeof MOCK_TEMPLATES[0];
  model: typeof MOCK_MODELS[0] | null;
  onGenerate: () => void;
  loading: boolean;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Xem lại & Tạo video</h2>
      <p className="text-sm text-gray-500 mb-5">Hệ thống sẽ tự động tạo video dựa trên các lựa chọn của bạn</p>

      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
            <Package className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">Sản phẩm</p>
            <p className="text-sm font-medium text-gray-900">{product.name}</p>
          </div>
          <span className="ml-auto text-[10px] font-medium text-brand-600 bg-brand-50 border border-brand-200 px-2 py-1 rounded-full">
            {product.product_type}
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
            <Film className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">Template</p>
            <p className="text-sm font-medium text-gray-900">{template.name}</p>
          </div>
          <span className="ml-auto text-[10px] text-gray-400">{template.estimated_duration_seconds}s</span>
        </div>

        {model ? (
          <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center">
              <Bot className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">AI Model</p>
              <p className="text-sm font-medium text-gray-900">{model.display_name}</p>
            </div>
            <span className="ml-auto text-[10px] text-gray-400">{model.gender} · {model.style}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-300" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">AI Model</p>
              <p className="text-sm text-gray-400">Không cần (template không có nhân vật)</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 items-start mb-5">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          Render job sẽ chạy nền. Bạn có thể xem tiến trình tại <strong>Render Jobs</strong>.
        </p>
      </div>

      <button
        onClick={onGenerate}
        disabled={loading}
        className="w-full h-10 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Đang tạo...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Tạo video ngay
          </>
        )}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudioGeneratePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<typeof MOCK_PRODUCTS[0] | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof MOCK_TEMPLATES[0] | null>(null);
  const [selectedModel, setSelectedModel] = useState<typeof MOCK_MODELS[0] | null>(null);
  const [generating, setGenerating] = useState(false);

  const needsModel = selectedTemplate?.has_human_subject === true;
  const totalSteps = needsModel ? 4 : 3;

  const canNext = [
    !!selectedProduct,
    !!selectedTemplate,
    needsModel ? !!selectedModel : true,
  ][step] ?? false;

  const handleNext = () => {
    if (step === 1 && !needsModel) {
      setStep(3);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (step === 3 && !needsModel) {
      setStep(1);
    } else {
      setStep(s => s - 1);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1500));
    router.push("/dashboard/studio/jobs");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tạo Video</h1>
        <p className="text-sm text-gray-500 mt-1">Biến sản phẩm affiliate thành video TikTok viral bằng AI</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <StepIndicator current={step} />

        <div className="min-h-[320px]">
          {step === 0 && (
            <StepProduct selected={selectedProduct} onSelect={p => { setSelectedProduct(p); setSelectedTemplate(null); }} />
          )}
          {step === 1 && selectedProduct && (
            <StepTemplate productType={selectedProduct.product_type} selected={selectedTemplate} onSelect={setSelectedTemplate} />
          )}
          {step === 2 && needsModel && (
            <StepModel selected={selectedModel} onSelect={setSelectedModel} />
          )}
          {step === 3 && selectedProduct && selectedTemplate && (
            <StepGenerate
              product={selectedProduct}
              template={selectedTemplate}
              model={selectedModel}
              onGenerate={handleGenerate}
              loading={generating}
            />
          )}
        </div>

        {step < 3 && (
          <div className="flex justify-between mt-6 pt-5 border-t border-gray-100">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-4 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </button>
            <button
              onClick={handleNext}
              disabled={!canNext}
              className="flex items-center gap-1.5 px-5 h-9 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Tiếp theo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
