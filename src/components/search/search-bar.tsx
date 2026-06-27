"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { STAGE_LABELS } from "@/lib/labels";
import { STAGES } from "@/lib/validations/post";

const TYPES = [
  { key: "ideas", label: "Ideas" },
  { key: "people", label: "People" },
] as const;

const SUGGESTIONS = ["AI", "Fintech", "SaaS", "B2B", "Developer", "Marketing", "Healthtech"];

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SearchBar({
  initialQuery = "",
  initialType = "ideas",
  initialIndustry = "",
  initialStage = "",
  initialTag = "",
}: {
  initialQuery?: string;
  initialType?: string;
  initialIndustry?: string;
  initialStage?: string;
  initialTag?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [industry, setIndustry] = useState(initialIndustry);
  const [stage, setStage] = useState(initialStage);
  const [tag, setTag] = useState(initialTag);
  
  const [showFilters, setShowFilters] = useState(false);
  const [focused, setFocused] = useState(false);

  function go(nextType = type, industryVal = industry, stageVal = stage, tagVal = tag) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    params.set("type", nextType);
    if (nextType === "ideas") {
      if (industryVal.trim()) params.set("industry", industryVal.trim());
      if (stageVal) params.set("stage", stageVal);
      if (tagVal.trim()) params.set("tag", tagVal.trim());
    }
    router.push(`/search?${params.toString()}`);
  }

  function handleSuggestionClick(term: string) {
    setQ(term);
    setFocused(false);
    const params = new URLSearchParams();
    params.set("q", term);
    params.set("type", type);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="sticky top-14 z-30 bg-background/95 py-2 backdrop-blur-md space-y-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-border/40 sm:border-b-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setFocused(false);
          go();
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Search ideas, skills, founders…"
            className="pl-9 min-h-[40px] text-base sm:text-sm"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setFocused(false);
                const params = new URLSearchParams();
                params.set("type", type);
                router.push(`/search?${params.toString()}`);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {type === "ideas" && (
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-md border border-border px-3.5 text-sm font-medium transition-colors hover:bg-accent cursor-pointer",
              showFilters && "bg-accent",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" /> <span className="hidden xs:inline">Filters</span>
          </button>
        )}
      </form>

      {/* Suggestion Tray */}
      {focused && (
        <div className="flex items-center gap-1.5 py-1 overflow-x-auto smooth-scroll select-none border-t border-border/10">
          <span className="text-xs text-muted-foreground shrink-0 font-semibold mr-1 uppercase tracking-wider">Trending:</span>
          {SUGGESTIONS.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => handleSuggestionClick(term)}
              className="text-xs shrink-0 bg-muted hover:bg-accent text-foreground font-medium rounded-full px-3 py-1 transition-all cursor-pointer border border-border/30 hover:scale-95"
            >
              {term}
            </button>
          ))}
        </div>
      )}

      {/* Desktop inline filters (hidden on mobile drawer context) */}
      {type === "ideas" && showFilters && (
        <div className="hidden md:flex flex-wrap items-center gap-2 pt-1">
          <Input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Industry"
            className="h-9 w-40"
          />
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="h-9 rounded-md border border-input bg-background text-foreground px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="" className="bg-background text-foreground">Any stage</option>
            {STAGES.map((s) => (
              <option key={s} value={s} className="bg-background text-foreground">
                {STAGE_LABELS[s]}
              </option>
            ))}
          </select>
          <Input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Tag"
            className="h-9 w-32"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setShowFilters(false);
              go();
            }}
          >
            Apply
          </Button>
        </div>
      )}

      {/* Mobile sliding bottom drawer filters */}
      <AnimatePresence>
        {type === "ideas" && showFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs md:hidden"
            />
            {/* Slide up sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-background border-t border-border p-6 flex flex-col gap-4 shadow-2xl md:hidden pb-safe max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-base font-bold text-foreground">Advanced Filters</h3>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Industry</label>
                  <Input
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Fintech, AI, Web3"
                    className="min-h-[42px] text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className={selectClass}
                  >
                    <option value="" className="bg-background text-foreground">Any stage</option>
                    {STAGES.map((s) => (
                      <option key={s} value={s} className="bg-background text-foreground">
                        {STAGE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tag</label>
                  <Input
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. SaaS, b2b, dev"
                    className="min-h-[42px] text-base"
                  />
                </div>
              </div>

              <Button
                type="button"
                className="w-full mt-2 h-11 text-sm font-semibold cursor-pointer"
                onClick={() => {
                  setShowFilters(false);
                  go();
                }}
              >
                Apply Filters
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex gap-1 border-b border-border">
        {TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setType(t.key);
              go(t.key);
            }}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-semibold transition-colors cursor-pointer",
              type === t.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
