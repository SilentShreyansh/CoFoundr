"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { postSchema, type PostInput, STAGES } from "@/lib/validations/post";
import { STAGE_LABELS } from "@/lib/labels";
import { createPost, updatePost } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { ImageUpload } from "@/components/ui/image-upload";

export function PostForm({
  postId,
  defaultValues,
}: {
  postId?: string;
  defaultValues?: Partial<PostInput>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"DRAFT" | "PUBLISHED" | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostInput>({
    // Schema input/output diverge (defaults + coerce), so cast to the output resolver.
    resolver: zodResolver(postSchema) as unknown as Resolver<PostInput>,
    defaultValues: {
      title: "",
      description: "",
      industry: "",
      stage: "IDEA",
      skillsNeeded: [],
      tags: [],
      images: [],
      status: "DRAFT",
      ...defaultValues,
    },
  });

  const skillsNeeded = watch("skillsNeeded");
  const tags = watch("tags");
  const images = watch("images");

  async function submit(values: PostInput, status: "DRAFT" | "PUBLISHED") {
    setPending(status);
    const payload = { ...values, status };
    const res = postId
      ? await updatePost(postId, payload)
      : await createPost(payload);
    setPending(null);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(status === "PUBLISHED" ? "Idea published!" : "Draft saved");
    router.push(res.id ? `/posts/${res.id}` : "/feed");
    router.refresh();
  }

  return (
    <form className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="What are you building?" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={6}
          placeholder="Describe the problem, your solution, and who you're looking for."
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" placeholder="Fintech" {...register("industry")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <select
            id="stage"
            className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register("stage")}
          >
            {STAGES.map((s) => (
              <option key={s} value={s} className="bg-background text-foreground">
                {STAGE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="teamSizeNeeded">Team size needed</Label>
          <Input
            id="teamSizeNeeded"
            type="number"
            min={1}
            placeholder="3"
            {...register("teamSizeNeeded")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Skills needed</Label>
        <TagInput
          value={skillsNeeded}
          onChange={(v) => setValue("skillsNeeded", v, { shouldValidate: true })}
          placeholder="Add a skill and press Enter"
          max={15}
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <TagInput
          value={tags}
          onChange={(v) => setValue("tags", v, { shouldValidate: true })}
          placeholder="fintech, b2b, ai…"
          max={10}
        />
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <ImageUpload
          value={images}
          onChange={(v) => setValue("images", v, { shouldValidate: true })}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={pending !== null}
          onClick={handleSubmit((v) => submit(v, "DRAFT"))}
        >
          {pending === "DRAFT" ? "Saving…" : "Save draft"}
        </Button>
        <Button
          type="button"
          disabled={pending !== null}
          onClick={handleSubmit((v) => submit(v, "PUBLISHED"))}
        >
          {pending === "PUBLISHED" ? "Publishing…" : "Publish"}
        </Button>
      </div>
    </form>
  );
}
