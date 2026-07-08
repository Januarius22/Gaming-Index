import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

export default function ProfileAvatar({
  profile,
  className
}: {
  profile: Pick<Profile, "full_name" | "avatar_url">;
  className?: string;
}) {
  const initial = profile.full_name.trim().charAt(0).toUpperCase() || "G";

  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft font-heading text-sm font-semibold text-primary ring-1 ring-border",
        className
      )}
    >
      {profile.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatar_url}
          alt={`${profile.full_name} profile`}
          className="h-full w-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
  );
}
