"use client";

import * as React from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { PillSelector } from "@/app/components/ui/PillSelector";
import { useSession } from "@/app/contexts/session-context";
import { apiGet } from "@/app/lib/api";
import type { UserRole } from "@/app/lib/auth-session";

const Roles = ["Teacher", "Parent", "Student", "Administrator"] as const;

const schema = z.object({
  role: z.enum(Roles),
  email: z.string().optional(),
  password: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

function mapRole(r: (typeof Roles)[number]): UserRole {
  switch (r) {
    case "Teacher":
      return "teacher";
    case "Parent":
      return "parent";
    case "Student":
      return "student";
    case "Administrator":
      return "beo";
    default:
      return "teacher";
  }
}

export function SignInForm({ onRequestAccess }: { onRequestAccess: () => void }) {
  const router = useRouter();
  const { setSession } = useSession();
  const [show, setShow] = React.useState(false);
  const [schoolError, setSchoolError] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "Teacher",
      email: "",
      password: ""
    },
    mode: "onTouched"
  });

  const demoQuickLogin = async () => {
    setSchoolError(null);
    try {
      const res = await apiGet<{ schools: { id: string; name: string }[] }>("/api/system/schools");
      const first = res.schools[0];
      if (!first) {
        setSchoolError("No schools in API seed.");
        return;
      }
      setSession({
        role: "teacher",
        displayName: "Demo visitor",
        schoolId: first.id,
        schoolName: first.name
      });
      router.push("/workspace");
    } catch {
      setSchoolError("Cannot reach API. Start backend + set NEXT_PUBLIC_API_URL.");
    }
  };

  const enterWorkspace = form.handleSubmit(async (values) => {
    setSchoolError(null);
    try {
      const res = await apiGet<{ schools: { id: string; name: string }[] }>("/api/system/schools");
      const first = res.schools[0];
      if (!first) {
        setSchoolError("No schools in API seed. Start the backend and run seed.");
        return;
      }
      const display =
        values.email && values.email.includes("@")
          ? values.email.split("@")[0] ?? "User"
          : values.email?.trim() || "Demo user";
      setSession({
        role: mapRole(values.role),
        displayName: display,
        schoolId: first.id,
        schoolName: first.name
      });
      router.push("/workspace");
    } catch {
      setSchoolError("Cannot reach API. Set NEXT_PUBLIC_API_URL and run FastAPI on port 8000.");
    }
  });

  const role = form.watch("role");

  return (
    <div className="space-y-5">
      <form onSubmit={enterWorkspace} className="space-y-5">
        <div>
          <div className="text-sm font-medium">Welcome back</div>
          <div className="mt-1 text-sm text-black/60">Choose a role. Email and password are optional in this demo.</div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-[0.14em] text-black/55">Role</div>
          <PillSelector
            value={role}
            onChange={(v) => form.setValue("role", v, { shouldTouch: true })}
            options={Roles.map((r) => ({ value: r, label: r }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-[0.14em] text-black/55">Email (optional)</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/40" />
            <Input {...form.register("email")} placeholder="name@school.gov.in" className="pl-10" autoComplete="email" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-[0.14em] text-black/55">Password (optional)</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/40" />
            <Input
              {...form.register("password")}
              type={show ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-black/50 hover:text-black"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {schoolError ? <p className="text-sm text-red-600">{schoolError}</p> : null}

        <Button type="submit" className="w-full" size="lg" variant="primary">
          Sign In — enter workspace
        </Button>
      </form>

      <Button type="button" variant="light" size="lg" className="w-full border border-black/10" onClick={demoQuickLogin}>
        Skip fields — quick demo login
      </Button>

      <div className="relative py-2">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/10" />
        <div className="relative mx-auto w-fit bg-sl-light px-3 text-xs uppercase tracking-[0.14em] text-black/50">
          or continue with
        </div>
      </div>

      <Button
        type="button"
        variant="light"
        size="lg"
        className="w-full border border-black/10"
        onClick={() => form.setError("email", { message: "Google SSO not wired in this demo." })}
      >
        <span className="grid size-5 place-items-center rounded-full border border-black/10 bg-white text-[11px] font-semibold">
          G
        </span>
        Google
      </Button>

      <button
        type="button"
        className="w-full text-center text-sm text-black/60 hover:text-black"
        onClick={onRequestAccess}
      >
        New to Shiksha Link? <span className="text-sl-accent hover:underline">Request Access →</span>
      </button>
    </div>
  );
}
