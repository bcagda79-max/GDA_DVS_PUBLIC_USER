"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";
import { ContentPageShell } from "@/components/content/content-page-shell";

export function NotFoundPage() {
  const router = useRouter();

  return (
    <ContentPageShell>
      <div className="min-h-[70vh] flex items-center justify-center py-10">
        <div className="text-center max-w-2xl mx-auto px-4">
          {/* Animated 404 Text */}
          <div className="mb-6">
            <h1 className="text-8xl md:text-9xl font-bold text-gradient-blue">
              404
            </h1>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          {/* Content - FORCE WHITE IN DARK, BLACK IN LIGHT */}
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-playfair text-404-title">
            Page Not Found
          </h2>
          <p className="text-lg mb-8 font-dm-sans text-404-body">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
            <Button
              onClick={() => router.back()}
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 px-8 py-6 text-lg rounded-xl transition-all duration-300"
              variant="secondary"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </ContentPageShell>
  );
}
