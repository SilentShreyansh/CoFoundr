"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  profileSchema,
  type ProfileInput,
  EXPERIENCE_LEVELS,
} from "@/lib/validations/profile";
import { EXPERIENCE_LABELS } from "@/lib/labels";
import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { ImageUpload } from "@/components/ui/image-upload";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ProfileForm({
  defaultValues,
}: {
  defaultValues: Partial<ProfileInput>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema) as unknown as Resolver<ProfileInput>,
    defaultValues: {
      name: "",
      image: "",
      headline: "",
      bio: "",
      location: "",
      linkedinUrl: "",
      githubUrl: "",
      websiteUrl: "",
      startupInterests: [],
      skills: [],
      openToCofound: true,
      ...defaultValues,
    },
  });

  const image = watch("image");
  const interests = watch("startupInterests");
  const skills = watch("skills");

  async function onSubmit(values: ProfileInput) {
    setPending(true);
    const res = await updateProfile(values);
    setPending(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Profile updated");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label>Profile photo</Label>
        <ImageUpload
          value={image ? [image] : []}
          onChange={(v) =>
            setValue("image", v[0] ?? "", {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          max={1}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, Country"
            {...register("location")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          placeholder="Full-stack engineer looking for a co-founder"
          {...register("headline")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" rows={4} {...register("bio")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experienceLevel">Experience level</Label>
        <select
          id="experienceLevel"
          className={selectClass}
          {...register("experienceLevel")}
        >

          <option
            value=""
            className="bg-background text-foreground"
          >
            Prefer not to say
          </option>

          {EXPERIENCE_LEVELS.map((lvl) => (
            <option
              key={lvl}
              value={lvl}
              className="bg-background text-foreground"
            >
              {EXPERIENCE_LABELS[lvl]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn</Label>
          <Input
            id="linkedinUrl"
            placeholder="https://…"
            {...register("linkedinUrl")}
          />
          {errors.linkedinUrl && (
            <p className="text-xs text-destructive">
              {errors.linkedinUrl.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="githubUrl">GitHub</Label>
          <Input
            id="githubUrl"
            placeholder="https://…"
            {...register("githubUrl")}
          />
          {errors.githubUrl && (
            <p className="text-xs text-destructive">
              {errors.githubUrl.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Website</Label>
          <Input
            id="websiteUrl"
            placeholder="https://…"
            {...register("websiteUrl")}
          />
          {errors.websiteUrl && (
            <p className="text-xs text-destructive">
              {errors.websiteUrl.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Skills</Label>
        <TagInput
          value={skills}
          onChange={(v) =>
            setValue("skills", v, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          placeholder="React, Product, Growth…"
        />
      </div>

      <div className="space-y-2">
        <Label>Startup interests</Label>
        <TagInput
          value={interests}
          onChange={(v) =>
            setValue("startupInterests", v, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          placeholder="Fintech, AI, Marketplaces…"
          max={12}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4"
          {...register("openToCofound")}
        />
        Open to co-founding
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
