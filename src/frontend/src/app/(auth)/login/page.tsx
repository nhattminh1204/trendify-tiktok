"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await authApi.login(data.email, data.password);
      setTokens(res.accessToken, res.refreshToken);
      if (res.user) setUser(res.user);
      router.push("/dashboard");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setServerError(err?.response?.data?.message ?? "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[448px]">
        {/* Brand block */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-600 mb-4">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-[30px] font-bold text-gray-900">Trendify</h1>
          <p className="text-sm text-gray-600 mt-2">Sign in to your Creator OS</p>
        </div>

        {/* Form card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-card px-8 py-8">
          {serverError && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              disabled={isSubmitting}
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              disabled={isSubmitting}
              {...register("password")}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting}
              className="mt-2"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            No account?{" "}
            <Link href="/register" className="text-brand-600 hover:underline font-medium">
              Create workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
