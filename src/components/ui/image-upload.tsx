"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { compressImage } from "@/lib/image-compress";

export function ImageUpload({
  value,
  onChange,
  max = 6,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const remaining = max - value.length;
    const toUpload = Array.from(files).slice(0, remaining);

    setUploading(true);
    const uploaded: string[] = [];
    for (const file of toUpload) {
      let fileToUpload = file;
      try {
        fileToUpload = await compressImage(file);
      } catch (e) {
        console.error("Compression failed, using original file", e);
      }
      const form = new FormData();
      form.append("file", fileToUpload);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (res.ok) {
        const { url } = await res.json();
        uploaded.push(url);
      } else {
        const { error } = await res.json().catch(() => ({ error: "Upload failed" }));
        toast.error(error ?? "Upload failed");
      }
    }
    setUploading(false);
    if (uploaded.length) onChange([...value, ...uploaded]);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div
            key={url}
            className="relative h-20 w-20 overflow-hidden rounded-md border border-border"
          >
            <Image src={url} alt="" fill className="object-cover" sizes="80px" />
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              className="absolute right-0.5 top-0.5 rounded-full bg-background/80 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:bg-accent"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
