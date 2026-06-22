"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth";

const schema = z.object({
  workspaceName: z.string().min(2, "Workspace name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Min 8 characters")
    .regex(/[A-Z]/, "Must contain 1 uppercase letter")
    .regex(/[0-9]/, "Must contain 1 number"),
  niche: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

type PasswordStrength = 0 | 1 | 2 | 3 | 4;

function getStrength(password: string): PasswordStrength {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score as PasswordStrength;
}

const strengthMeta = [
  { label: "",       color: "" },
  { label: "Weak",   color: "bg-red-400" },
  { label: "Fair",   color: "bg-amber-400" },
  { label: "Good",   color: "bg-blue-400" },
  { label: "Strong", color: "bg-green-500" },
] as const;

function PasswordStrengthBar({ password }: { password?: string }) {
  const strength = getStrength(password ?? "");
  if (!password) return null;
  const { label, color } = strengthMeta[strength];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-sm transition-colors duration-200",
              i <= strength ? color : "bg-gray-200"
            )}
          />
        ))}
      </div>
      <p className={cn("text-[11px] mt-1 text-right font-medium", {
        "text-red-400":   strength === 1,
        "text-amber-400": strength === 2,
        "text-blue-400":  strength === 3,
        "text-green-500": strength === 4,
      })}>
        {label}
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const passwordValue = useWatch({ control, name: "password" });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await authApi.register(
        data.workspaceName,
        data.email,
        data.password,
        data.niche
      );
      setTokens(res.accessToken, res.refreshToken);
      if (res.user) setUser(res.user);
      router.push("/onboarding");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setServerError(err?.response?.data?.message ?? "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[448px]">
        <div className="text-center mb-8">
          <h1 className="text-[30px] font-bold text-gray-900">Create your Creator OS</h1>
          <p className="text-sm text-gray-600 mt-2">Set up your Trendify workspace</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-card px-8 py-8">
          {serverError && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Input
              label="Workspace name"
              type="text"
              placeholder="My Creator Brand"
              error={errors.workspaceName?.message}
              disabled={isSubmitting}
              {...register("workspaceName")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              disabled={isSubmitting}
              {...register("email")}
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                disabled={isSubmitting}
                {...register("password")}
              />
              <p className="text-xs text-gray-400 mt-1">
                Min 8 characters, 1 uppercase, 1 number
              </p>
              <PasswordStrengthBar password={passwordValue} />
            </div>

            <Select
              label="Primary niche"
              placeholder="Select niche"
              disabled={isSubmitting}
              {...register("niche")}
            >
              <option value="fitness">Fitness</option>
              <option value="cooking">Cooking</option>
              <option value="tech">Tech</option>
              <option value="beauty">Beauty</option>
              <option value="finance">Finance</option>
              <option value="education">Education</option>
              <option value="entertainment">Entertainment</option>
            </Select>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting}
              className="mt-2"
            >
              {isSubmitting ? "Creating workspace…" : "Create workspace"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
