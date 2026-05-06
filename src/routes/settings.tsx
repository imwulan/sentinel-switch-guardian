import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, ArrowLeft, Brain, Gauge, Bell, Lock, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getDefaultSettings, useSentinelSettings } from "@/providers/SentinelProvider";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — Sentinel Switch" },
      {
        name: "description",
        content:
          "Tune risk thresholds, toggle Learning Mode, and configure how Sentinel Switch protects your Solana wallet.",
      },
      { property: "og:title", content: "Settings — Sentinel Switch" },
      {
        property: "og:description",
        content: "Tune risk thresholds and Learning Mode for your behavioral AI firewall.",
      },
    ],
  }),
});

function SettingsPage() {
  const { settings: s, setSettings, updateSettings } = useSentinelSettings();
  const defaults = getDefaultSettings();
  const [addressInput, setAddressInput] = useState("");
  const [programInput, setProgramInput] = useState("");
  const update = updateSettings;

  const addAddress = (kind: "allowlistedAddresses" | "blockedAddresses") => {
    const next = addressInput.trim();
    if (!next) return;
    if (s[kind].includes(next)) {
      toast.message("Already added");
      return;
    }
    update(kind, [...s[kind], next]);
    setAddressInput("");
  };

  const addProgram = (kind: "allowlistedPrograms" | "blockedPrograms") => {
    const next = programInput.trim();
    if (!next) return;
    if (s[kind].includes(next)) {
      toast.message("Already added");
      return;
    }
    update(kind, [...s[kind], next]);
    setProgramInput("");
  };

  const removeItem = (
    kind: "allowlistedAddresses" | "blockedAddresses" | "allowlistedPrograms" | "blockedPrograms",
    value: string
  ) => update(kind, s[kind].filter((x) => x !== value));

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
      <main className="relative mx-auto max-w-3xl space-y-5 p-4 md:p-6">
        <header className="glass-strong sticky top-0 z-30 flex items-center justify-between gap-4 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/app"
              className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/60 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-secondary glow-safe">
              <Shield className="h-5 w-5 text-safe" strokeWidth={2.4} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Guardian configuration
              </p>
            </div>
          </div>

          <button
            onClick={() => setSettings(defaults)}
            className="hidden items-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:inline-flex"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </header>

        {/* Learning Mode */}
        <section className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-safe/10 text-safe">
              <Brain className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold">Learning Mode</h2>
              <p className="text-xs text-muted-foreground">
                Sentinel observes your activity to build a behavioral fingerprint without blocking.
              </p>
            </div>
            <Switch
              checked={s.learning}
              onCheckedChange={(v) => update("learning", v)}
              aria-label="Toggle Learning Mode"
            />
          </div>

          <div
            className={`rounded-xl border px-4 py-3 text-xs ${
              s.learning
                ? "border-safe/30 bg-safe/5 text-safe"
                : "border-border bg-secondary/40 text-muted-foreground"
            }`}
          >
            {s.learning
              ? "✦ Active — anomalies will be logged but not auto-blocked."
              : "Enforcement on — Sentinel will act on detected anomalies."}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Strict mode</p>
              <p className="text-[11px] text-muted-foreground">
                Require manual approval for every contract interaction.
              </p>
            </div>
            <Switch
              checked={s.strict}
              onCheckedChange={(v) => update("strict", v)}
              aria-label="Toggle Strict mode"
            />
          </div>
        </section>

        {/* Risk thresholds */}
        <section className="glass rounded-2xl p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-warn/10 text-warn">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Risk thresholds</h2>
              <p className="text-xs text-muted-foreground">
                Define where Sentinel draws the line between safe, watch, and threat.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <ThresholdRow
              label="Low → Medium"
              hint="Anomalies above this score are flagged in the activity feed."
              value={s.lowMed}
              max={s.medHigh - 1}
              min={0}
              accent="text-safe"
              onChange={(v) => update("lowMed", v)}
            />
            <ThresholdRow
              label="Medium → High"
              hint="Triggers a confirmation prompt before the transaction signs."
              value={s.medHigh}
              max={s.autoKill - 1}
              min={s.lowMed + 1}
              accent="text-warn"
              onChange={(v) => update("medHigh", v)}
            />
            <ThresholdRow
              label="Auto-kill"
              hint="Anomaly score that bypasses confirmation and freezes the wallet."
              value={s.autoKill}
              max={100}
              min={s.medHigh + 1}
              accent="text-threat"
              onChange={(v) => update("autoKill", v)}
            />

            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">Decision countdown</p>
                <span className="font-mono text-sm text-foreground">{s.countdown}s</span>
              </div>
              <Slider
                value={[s.countdown]}
                min={3}
                max={30}
                step={1}
                onValueChange={([v]) => update("countdown", v)}
              />
              <p className="mt-2 text-[11px] text-muted-foreground">
                Time you have to approve or kill before Sentinel auto-blocks.
              </p>
            </div>
          </div>

          {/* Spectrum */}
          <div className="mt-6">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/60">
              <div
                className="absolute inset-y-0 left-0 bg-safe/70"
                style={{ width: `${s.lowMed}%` }}
              />
              <div
                className="absolute inset-y-0 bg-warn/70"
                style={{ left: `${s.lowMed}%`, width: `${s.medHigh - s.lowMed}%` }}
              />
              <div
                className="absolute inset-y-0 bg-threat/80"
                style={{ left: `${s.medHigh}%`, right: 0 }}
              />
              <div
                className="absolute -top-1 h-4 w-0.5 bg-foreground"
                style={{ left: `${s.autoKill}%` }}
                aria-hidden
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>0</span>
              <span>safe</span>
              <span>watch</span>
              <span>threat</span>
              <span>100</span>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Alerts</h2>
              <p className="text-xs text-muted-foreground">
                How Sentinel reaches you when something looks off.
              </p>
            </div>
          </div>

          <ToggleRow
            label="Push notifications"
            hint="Real-time alerts on this device."
            checked={s.notifyPush}
            onChange={(v) => update("notifyPush", v)}
          />
          <ToggleRow
            label="Email digest"
            hint="Daily summary of flagged transactions."
            checked={s.notifyEmail}
            onChange={(v) => update("notifyEmail", v)}
          />
        </section>

        {/* Defense rules */}
        <section className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-threat/10 text-threat">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Defense rules</h2>
              <p className="text-xs text-muted-foreground">
                Automated responses for high-risk patterns.
              </p>
            </div>
          </div>

          <ToggleRow
            label="Kill unknown contracts"
            hint="Auto-block first-time interactions with un-audited programs."
            checked={s.killUnknownContracts}
            onChange={(v) => update("killUnknownContracts", v)}
          />
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="text-base font-semibold">Allowlist & Blocklist</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Define trusted or blocked addresses and program IDs.
          </p>

          <div className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
              <Input
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Wallet address"
              />
              <button
                className="rounded-lg border border-safe/40 px-3 py-2 text-xs text-safe"
                onClick={() => addAddress("allowlistedAddresses")}
              >
                Add allow
              </button>
              <button
                className="rounded-lg border border-threat/40 px-3 py-2 text-xs text-threat"
                onClick={() => addAddress("blockedAddresses")}
              >
                Add block
              </button>
            </div>

            <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
              <Input
                value={programInput}
                onChange={(e) => setProgramInput(e.target.value)}
                placeholder="Program ID"
              />
              <button
                className="rounded-lg border border-safe/40 px-3 py-2 text-xs text-safe"
                onClick={() => addProgram("allowlistedPrograms")}
              >
                Allow program
              </button>
              <button
                className="rounded-lg border border-threat/40 px-3 py-2 text-xs text-threat"
                onClick={() => addProgram("blockedPrograms")}
              >
                Block program
              </button>
            </div>
          </div>

          <ListSection
            title="Allowed addresses"
            items={s.allowlistedAddresses}
            onRemove={(v) => removeItem("allowlistedAddresses", v)}
          />
          <ListSection
            title="Blocked addresses"
            items={s.blockedAddresses}
            onRemove={(v) => removeItem("blockedAddresses", v)}
          />
          <ListSection
            title="Allowed programs"
            items={s.allowlistedPrograms}
            onRemove={(v) => removeItem("allowlistedPrograms", v)}
          />
          <ListSection
            title="Blocked programs"
            items={s.blockedPrograms}
            onRemove={(v) => removeItem("blockedPrograms", v)}
          />
        </section>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => setSettings(defaults)}
            className="rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
          >
            Reset
          </button>
          <Link
            to="/app"
            className="rounded-xl bg-safe/15 px-5 py-2.5 text-sm font-semibold text-safe transition-colors hover:bg-safe/25"
          >
            Save & return
          </Link>
        </div>
      </main>
    </div>
  );
}

function ThresholdRow({
  label,
  hint,
  value,
  min,
  max,
  accent,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  accent: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <span className={`font-mono text-base font-semibold ${accent}`}>{value}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-border/60 py-3 first:border-t-0 first:pt-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}

function ListSection({
  title,
  items,
  onRemove,
}: {
  title: string;
  items: string[];
  onRemove: (value: string) => void;
}) {
  return (
    <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-3">
      <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No entries yet.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((value) => (
            <li key={value} className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate font-mono">{value}</span>
              <button className="text-threat" onClick={() => onRemove(value)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
