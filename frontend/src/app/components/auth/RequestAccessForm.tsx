"use client";

import * as React from "react";
import { CheckCircle2, Mail, Phone, School } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Textarea } from "@/app/components/ui/Textarea";
import { PillSelector } from "@/app/components/ui/PillSelector";

const Roles = ["Teacher", "Parent", "Student", "Administrator"] as const;

const schema = z.object({
  name: z.string().min(2, "Please enter your name."),
  role: z.enum(Roles),
  institution: z.string().min(2, "Please enter your school/institution name."),
  state: z.string().min(2, "Please select a state."),
  district: z.string().min(2, "Please enter a district."),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  email: z.string().email("Please enter a valid email."),
  challenge: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const STATE_OPTIONS = [
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
  "Uttar Pradesh",
  "Bihar",
  "Rajasthan",
  "Gujarat",
  "Kerala",
  "West Bengal",
  "Telangana",
  "Andhra Pradesh",
  "Madhya Pradesh",
  "Odisha",
  "Assam",
] as const;

export function RequestAccessForm() {
  const [submitted, setSubmitted] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      role: "Teacher",
      institution: "",
      state: "",
      district: "",
      phone: "",
      email: "",
      challenge: "",
    },
    mode: "onTouched",
  });

  const role = form.watch("role");

  const onSubmit = form.handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 900));
    setSubmitted(true);
  });

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="rounded-xl border border-black/10 bg-white p-6"
        >
          <div className="flex items-start gap-3">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <CheckCircle2 className="size-7 text-sl-secondary" />
            </motion.div>
            <div>
              <div className="font-display text-2xl">You’re on the list!</div>
              <div className="mt-2 text-sm text-black/65">
                We’ll be in touch soon. Usually within 48 hours. No spam, ever.
              </div>
            </div>
          </div>

          <Button
            className="mt-6 w-full"
            variant="primary"
            size="lg"
            onClick={() => {
              setSubmitted(false);
              form.reset();
            }}
          >
            Submit another request
          </Button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          onSubmit={onSubmit}
          className="space-y-5"
        >
          <div>
            <div className="text-sm font-medium">Join the movement</div>
            <div className="mt-1 text-sm text-black/60">
              We’ll reach out within 48 hours. No spam, ever.
            </div>
          </div>

          <Field label="Name" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} placeholder="Your full name" />
          </Field>

          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-[0.14em] text-black/55">
              Role
            </div>
            <PillSelector
              value={role}
              onChange={(v) => form.setValue("role", v, { shouldTouch: true })}
              options={Roles.map((r) => ({ value: r, label: r }))}
            />
            {form.formState.errors.role?.message ? (
              <div className="text-sm text-red-600">{form.formState.errors.role.message}</div>
            ) : null}
          </div>

          <Field
            label="School / Institution"
            error={form.formState.errors.institution?.message}
          >
            <div className="relative">
              <School className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/40" />
              <Input
                {...form.register("institution")}
                placeholder="Govt High School, Kolar"
                className="pl-10"
              />
            </div>
          </Field>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="State" error={form.formState.errors.state?.message}>
              <select
                {...form.register("state")}
                className="h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm text-sl-text shadow-[0_0_0_1px_rgba(10,10,15,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-primary/40"
              >
                <option value="">Select state</option>
                {STATE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="District"
              error={form.formState.errors.district?.message}
            >
              <Input {...form.register("district")} placeholder="Raichur" />
            </Field>
          </div>

          <Field label="Phone" error={form.formState.errors.phone?.message}>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/40" />
              <div className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-sm text-black/40">
                +91
              </div>
              <Input
                {...form.register("phone")}
                placeholder="9876543210"
                className="pl-16"
                inputMode="numeric"
              />
            </div>
          </Field>

          <Field label="Email" error={form.formState.errors.email?.message}>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/40" />
              <Input
                {...form.register("email")}
                placeholder="you@example.com"
                className="pl-10"
                autoComplete="email"
              />
            </div>
          </Field>

          <Field
            label="What’s your biggest challenge? (optional)"
            error={form.formState.errors.challenge?.message}
          >
            <Textarea
              {...form.register("challenge")}
              placeholder="Eg: tracking attendance, parent engagement, grants, or language barriers…"
            />
          </Field>

          <Button type="submit" className="w-full" size="lg" variant="primary">
            Request Early Access
          </Button>

          <div className="text-xs text-black/55">
            Fine print: We’ll reach out within 48 hours. No spam, ever.
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-[0.14em] text-black/55">
        {label}
      </label>
      {children}
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
    </div>
  );
}

