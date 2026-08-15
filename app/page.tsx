"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ResultCard } from "@/components/ResultCard";
import { SupportedPlatforms } from "@/components/SupportedPlatforms";
import { HowItWorks } from "@/components/HowItWorks";
import { FeatureHighlights } from "@/components/FeatureHighlights";
import { FAQSection } from "@/components/FAQSection";
import { AdBanner } from "@/components/AdBanner";
import { Footer } from "@/components/Footer";
import { ExtractedMediaInfo } from "@/lib/extractor/ytdlp";

export default function Home() {
  const [extractedData, setExtractedData] = useState<ExtractedMediaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [platformPreset, setPlatformPreset] = useState<string | undefined>(undefined);

  const handleFetchSuccess = (data: ExtractedMediaInfo) => {
    setExtractedData(data);
  };

  const handlePlatformSelect = (platform: string) => {
    setPlatformPreset(platform);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <Navbar onSelectPlatformFilter={handlePlatformSelect} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero & Smart Search Input */}
        <HeroSection
          onFetchSuccess={handleFetchSuccess}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          selectedPlatformPreset={platformPreset}
        />

        {/* Results Card if fetched */}
        {extractedData && (
          <ResultCard
            data={extractedData}
            onReset={() => setExtractedData(null)}
          />
        )}

        {/* Sponsored Banner */}
        <AdBanner position="middle" />

        {/* Supported Platforms Grid */}
        <SupportedPlatforms onSelectPlatform={handlePlatformSelect} />

        {/* Step by Step Guide */}
        <HowItWorks />

        {/* Key Features Grid */}
        <FeatureHighlights />

        {/* FAQ Accordion */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
