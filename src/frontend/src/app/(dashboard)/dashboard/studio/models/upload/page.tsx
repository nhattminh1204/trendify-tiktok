"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Upload, ImagePlus, X, Check, Bot, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS = ["female", "male", "neutral"];
const AGE_OPTIONS = ["teen", "twenties", "thirties", "forties_plus"];
const BODY_OPTIONS = ["slim", "athletic", "curvy", "plus_size"];
const STYLE_OPTIONS = ["casual", "luxury", "sporty", "streetwear", "elegant"];

type UploadStatus = "idle" | "uploading" | "processing" | "done" | "error";

export default function UploadModelPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    display_name: "",
    gender: "",
    age_range: "",
    body_type: "",
    style: "",
  });
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 20 - images.length);
    setImages(prev => [...prev, ...newFiles]);
    newFiles.forEach(f => {
      const url = URL.createObjectURL(f);
      setPreviews(prev => [...prev, url]);
    });
  };

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const valid =
    images.length >= 3 &&
    form.display_name.trim().length > 0 &&
    form.gender && form.age_range && form.body_type && form.style;

  const handleSubmit = async () => {
    if (!valid) return;
    setStatus("uploading");
    setProgress(0);
    for (let i = 0; i <= 40; i += 5) {
      await new Promise(r => setTimeout(r, 100));
      setProgress(i);
    }
    setStatus("processing");
    for (let i = 40; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 200));
      setProgress(i);
    }
    setStatus("done");
  };

  if (status === "done") {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Model đã sẵn sàng!</h2>
        <p className="text-sm text-gray-500 mb-6">
          <strong>{form.display_name}</strong> đã được thêm vào thư viện. Bạn có thể dùng trong video ngay.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard/studio/models" className="px-5 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center">
            Xem thư viện
          </Link>
          <Link href="/dashboard/studio/generate" className="px-5 h-9 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 flex items-center gap-2">
            Tạo video ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <Link href="/dashboard/studio/models" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 w-fit">
        <ChevronLeft className="w-4 h-4" /> AI Model Library
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload AI Model</h1>
        <p className="text-sm text-gray-500 mt-1">Tải lên 3–20 ảnh tham chiếu để tạo model riêng của bạn</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-7">

        {/* Image Upload */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Ảnh tham chiếu</p>
              <p className="text-xs text-gray-400 mt-0.5">3–20 ảnh · JPG/PNG · tối thiểu 512×512px · mỗi ảnh ≤ 10MB</p>
            </div>
            <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", images.length >= 3 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
              {images.length} / 20
            </span>
          </div>

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-brand-400 hover:bg-brand-50/30 cursor-pointer transition-all"
          >
            <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={e => handleFiles(e.target.files)} />
            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">Kéo thả ảnh vào đây hoặc click để chọn</p>
            <p className="text-xs text-gray-400 mt-1">Mỗi ảnh phải chứa khuôn mặt rõ ràng</p>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {previews.length < 20 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-brand-400 transition-colors"
                >
                  <ImagePlus className="w-5 h-5 text-gray-300" />
                </button>
              )}
            </div>
          )}

          {images.length > 0 && images.length < 3 && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Cần ít nhất 3 ảnh để tạo model
            </p>
          )}
        </section>

        {/* Attributes */}
        <section>
          <p className="text-sm font-semibold text-gray-900 mb-4">Thông tin model</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Tên hiển thị *</label>
              <input
                type="text"
                placeholder="Ví dụ: My Brand Model"
                value={form.display_name}
                onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {(["gender", "age_range", "body_type", "style"] as const).map(field => {
              const options: Record<string, string[]> = {
                gender: GENDER_OPTIONS,
                age_range: AGE_OPTIONS,
                body_type: BODY_OPTIONS,
                style: STYLE_OPTIONS,
              };
              const labels: Record<string, string> = {
                gender: "Giới tính",
                age_range: "Độ tuổi",
                body_type: "Vóc dáng",
                style: "Phong cách",
              };
              return (
                <div key={field}>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">{labels[field]} *</label>
                  <div className="flex flex-wrap gap-2">
                    {options[field].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setForm(f => ({ ...f, [field]: opt }))}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                          form[field] === opt
                            ? "bg-brand-600 text-white border-brand-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Processing state */}
        {(status === "uploading" || status === "processing") && (
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
              <p className="text-sm font-medium text-brand-700">
                {status === "uploading" ? "Đang tải ảnh lên..." : "Đang xử lý model..."}
              </p>
              <span className="ml-auto text-sm font-semibold text-brand-600">{progress}%</span>
            </div>
            <div className="w-full bg-brand-200 rounded-full h-1.5">
              <div
                className="bg-brand-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {status === "processing" && (
              <p className="text-xs text-brand-500 mt-2">Đang phát hiện khuôn mặt và tạo thumbnail...</p>
            )}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!valid || status !== "idle"}
          className="w-full h-10 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Bot className="w-4 h-4" />
          Tạo AI Model
        </button>
      </div>
    </div>
  );
}
