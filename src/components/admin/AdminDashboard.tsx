"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FullContent, CollabRow, ExperienceRow, SiteContentRow, WorkItemRow } from "@/lib/types";
import { safeArray } from "@/lib/types";
import FileUpload from "@/components/admin/FileUpload";

type Toast = { type: "success" | "error"; text: string } | null;

const TABS = [
  "Hero",
  "About / Info",
  "Navigation",
  "Work",
  "Collabs",
  "Work Info",
  "New Launch",
  "Currently Working On",
  "Contact & Social",
  "Music",
  "Settings",
] as const;
type Tab = (typeof TABS)[number];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-mono uppercase tracking-wide text-neutral-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-md bg-neutral-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/40";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} min-h-[100px]`} />;
}
function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-neutral-200">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-white" />
      {label}
    </label>
  );
}

function SaveBar({ onSave, saving, toast }: { onSave: () => void; saving: boolean; toast: Toast }) {
  return (
    <div className="flex items-center gap-4 pt-2">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="rounded-md bg-white text-black text-sm font-medium px-5 py-2.5 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
      {toast && (
        <span className={`text-sm ${toast.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
          {toast.text}
        </span>
      )}
    </div>
  );
}

export default function AdminDashboard({ initialData }: { initialData: FullContent }) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContentRow>(initialData.content);
  const [work, setWork] = useState<WorkItemRow[]>(initialData.work);
  const [collabs, setCollabs] = useState<CollabRow[]>(initialData.collabs);
  const [experiences, setExperiences] = useState<ExperienceRow[]>(initialData.experiences);
  const [tab, setTab] = useState<Tab>("Hero");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const set = useCallback(<K extends keyof SiteContentRow>(key: K, value: SiteContentRow[K]) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  }, []);

  async function saveContent() {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to save.");
      setContent(json.content);
      setToast({ type: "success", text: "Saved and live on the site." });
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Failed to save." });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 4000);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Portfolio Admin</h1>
          <p className="text-xs text-neutral-500">Changes save straight to the database and appear live immediately.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" rel="noreferrer" className="text-xs text-neutral-400 hover:text-white underline">
            View live site ↗
          </a>
          <button onClick={logout} className="text-xs rounded-md border border-white/15 px-3 py-2 hover:bg-white/10">
            Log out
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        <nav className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-white/10 p-3 flex md:flex-col gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-left text-sm whitespace-nowrap px-3 py-2 rounded-md transition-colors ${
                tab === t ? "bg-white text-black font-medium" : "text-neutral-300 hover:bg-white/10"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        <main className="flex-1 p-6 max-w-3xl">
          {tab === "Hero" && (
            <div className="space-y-5">
              <Field label="Label (small text above name)">
                <TextInput value={content.heroLabel ?? ""} onChange={(e) => set("heroLabel", e.target.value)} />
              </Field>
              <Field label="Name / headline">
                <TextInput value={content.heroName ?? ""} onChange={(e) => set("heroName", e.target.value)} />
              </Field>
              <Field label="Profession">
                <TextInput value={content.heroProfession ?? ""} onChange={(e) => set("heroProfession", e.target.value)} />
              </Field>
              <Field label="Description">
                <TextArea value={content.heroDescription ?? ""} onChange={(e) => set("heroDescription", e.target.value)} />
              </Field>
              <Field label="Background media type">
                <select
                  value={content.heroMediaType ?? "none"}
                  onChange={(e) => set("heroMediaType", e.target.value)}
                  className={inputCls}
                >
                  <option value="none">None</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </Field>
              <FileUpload label="Background media file" value={content.heroMediaUrl ?? ""} onChange={(v) => set("heroMediaUrl", v)} />
              <FileUpload label="Poster image (for video)" value={content.heroPoster ?? ""} onChange={(v) => set("heroPoster", v)} accept="image/*" />
              <Checkbox label="Hero section visible" checked={content.heroVisible !== false} onChange={(v) => set("heroVisible", v)} />
              <SaveBar onSave={saveContent} saving={saving} toast={toast} />
            </div>
          )}

          {tab === "About / Info" && (
            <div className="space-y-5">
              <Field label="About text (use blank line for new paragraph)">
                <TextArea rows={6} value={content.infoText ?? ""} onChange={(e) => set("infoText", e.target.value)} />
              </Field>
              <Field label="Skills (comma separated)">
                <TextInput
                  value={safeArray(content.infoSkills).join(", ")}
                  onChange={(e) =>
                    set(
                      "infoSkills",
                      e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    )
                  }
                />
              </Field>
              <FileUpload label="Profile photo" value={content.infoPhoto ?? ""} onChange={(v) => set("infoPhoto", v)} accept="image/*" />
              <SaveBar onSave={saveContent} saving={saving} toast={toast} />
            </div>
          )}

          {tab === "Navigation" && (
            <NavTab content={content} setContent={setContent} onSave={saveContent} saving={saving} toast={toast} />
          )}

          {tab === "Work" && <WorkTab items={work} setItems={setWork} />}
          {tab === "Collabs" && <CollabsTab items={collabs} setItems={setCollabs} />}
          {tab === "Work Info" && <ExperiencesTab items={experiences} setItems={setExperiences} />}

          {tab === "New Launch" && (
            <div className="space-y-5">
              <Checkbox label="Enable New Launch section" checked={!!content.launchEnabled} onChange={(v) => set("launchEnabled", v)} />
              <Field label="Project name">
                <TextInput value={content.launchProjectName ?? ""} onChange={(e) => set("launchProjectName", e.target.value)} />
              </Field>
              <Field label="Launch date & time (your local time)">
                <TextInput
                  type="datetime-local"
                  value={content.launchDate ?? ""}
                  onChange={(e) => set("launchDate", e.target.value)}
                />
              </Field>
              <Field label="Description">
                <TextArea value={content.launchDescription ?? ""} onChange={(e) => set("launchDescription", e.target.value)} />
              </Field>
              <FileUpload label="Cover image" value={content.launchCover ?? ""} onChange={(v) => set("launchCover", v)} accept="image/*" />
              <FileUpload label="Video (optional, overrides cover)" value={content.launchVideo ?? ""} onChange={(v) => set("launchVideo", v)} accept="video/*" />
              <Field label="Destination link (when clicking the button)">
                <TextInput value={content.launchDestination ?? ""} onChange={(e) => set("launchDestination", e.target.value)} />
              </Field>
              <Field label="Button text">
                <TextInput value={content.launchButtonText ?? ""} onChange={(e) => set("launchButtonText", e.target.value)} />
              </Field>
              <Checkbox label="Show fireworks effect once live" checked={content.launchFireworks !== false} onChange={(v) => set("launchFireworks", v)} />
              <SaveBar onSave={saveContent} saving={saving} toast={toast} />
            </div>
          )}

          {tab === "Currently Working On" && (
            <div className="space-y-5">
              <Checkbox label="Show this section on the site" checked={!!content.currentProjectVisible} onChange={(v) => set("currentProjectVisible", v)} />
              <Field label="Project name">
                <TextInput value={content.currentProjectName ?? ""} onChange={(e) => set("currentProjectName", e.target.value)} />
              </Field>
              <Field label="Status label">
                <TextInput value={content.currentProjectStatus ?? ""} onChange={(e) => set("currentProjectStatus", e.target.value)} />
              </Field>
              <Field label="Description">
                <TextArea value={content.currentProjectDescription ?? ""} onChange={(e) => set("currentProjectDescription", e.target.value)} />
              </Field>
              <FileUpload label="Cover image" value={content.currentProjectCover ?? ""} onChange={(v) => set("currentProjectCover", v)} accept="image/*" />
              <FileUpload label="Video (optional)" value={content.currentProjectVideo ?? ""} onChange={(v) => set("currentProjectVideo", v)} accept="video/*" />
              <Field label={`Progress: ${content.currentProjectProgress ?? 0}%`}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={content.currentProjectProgress ?? 0}
                  onChange={(e) => set("currentProjectProgress", Number(e.target.value))}
                  className="w-full accent-white"
                />
              </Field>
              <Field label="Expected launch (free text)">
                <TextInput value={content.currentProjectExpectedLaunch ?? ""} onChange={(e) => set("currentProjectExpectedLaunch", e.target.value)} />
              </Field>
              <SaveBar onSave={saveContent} saving={saving} toast={toast} />
            </div>
          )}

          {tab === "Contact & Social" && (
            <SocialTab content={content} setContent={setContent} onSave={saveContent} saving={saving} toast={toast} set={set} />
          )}

          {tab === "Music" && (
            <div className="space-y-5">
              <Checkbox label="Enable background music toggle on the site" checked={!!content.musicEnabled} onChange={(v) => set("musicEnabled", v)} />
              <FileUpload label="Music file (mp3 / wav / ogg / m4a)" value={content.musicUrl ?? ""} onChange={(v) => set("musicUrl", v)} accept="audio/*" kind="audio" />
              <Field label={`Volume: ${Math.round((content.musicVolume ?? 0.5) * 100)}%`}>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={content.musicVolume ?? 0.5}
                  onChange={(e) => set("musicVolume", Number(e.target.value))}
                  className="w-full accent-white"
                />
              </Field>
              <p className="text-xs text-neutral-500">
                Browsers block audio from auto-playing with sound, so visitors will see a small floating music button
                (bottom-right) they can click to start playback — this is expected behaviour, not a bug.
              </p>
              <SaveBar onSave={saveContent} saving={saving} toast={toast} />
            </div>
          )}

          {tab === "Settings" && (
            <div className="space-y-5">
              <Field label="Browser tab title">
                <TextInput value={content.settingsTitle ?? ""} onChange={(e) => set("settingsTitle", e.target.value)} />
              </Field>
              <FileUpload label="Favicon" value={content.settingsFavicon ?? ""} onChange={(v) => set("settingsFavicon", v)} accept="image/*" />
              <Checkbox label="Film grain overlay" checked={content.settingsGrain !== false} onChange={(v) => set("settingsGrain", v)} />
              <Checkbox label="Custom cursor" checked={content.settingsCursor !== false} onChange={(v) => set("settingsCursor", v)} />
              <SaveBar onSave={saveContent} saving={saving} toast={toast} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ---------------- Navigation tab ---------------- */
function NavTab({
  content,
  setContent,
  onSave,
  saving,
  toast,
}: {
  content: SiteContentRow;
  setContent: React.Dispatch<React.SetStateAction<SiteContentRow>>;
  onSave: () => void;
  saving: boolean;
  toast: Toast;
}) {
  const items = safeArray(content.nav);
  function updateItem(id: string, patch: Partial<{ label: string; visible: boolean; order: number }>) {
    setContent((prev) => ({
      ...prev,
      nav: safeArray(prev.nav).map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-400">Control which menu links appear and in what order.</p>
      {items
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-3 border border-white/10 rounded-md p-3">
            <span className="text-xs font-mono text-neutral-500 w-20">#{item.id}</span>
            <input
              value={item.label}
              onChange={(e) => updateItem(item.id, { label: e.target.value })}
              className={`${inputCls} w-40`}
            />
            <input
              type="number"
              value={item.order}
              onChange={(e) => updateItem(item.id, { order: Number(e.target.value) })}
              className={`${inputCls} w-20`}
            />
            <Checkbox label="Visible" checked={item.visible} onChange={(v) => updateItem(item.id, { visible: v })} />
          </div>
        ))}
      <SaveBar onSave={onSave} saving={saving} toast={toast} />
    </div>
  );
}

/* ---------------- Social & Contact tab ---------------- */
function SocialTab({
  content,
  setContent,
  onSave,
  saving,
  toast,
  set,
}: {
  content: SiteContentRow;
  setContent: React.Dispatch<React.SetStateAction<SiteContentRow>>;
  onSave: () => void;
  saving: boolean;
  toast: Toast;
  set: <K extends keyof SiteContentRow>(key: K, value: SiteContentRow[K]) => void;
}) {
  const items = safeArray(content.social);
  function addLink() {
    setContent((prev) => ({
      ...prev,
      social: [...safeArray(prev.social), { id: crypto.randomUUID(), platform: "Instagram", url: "" }],
    }));
  }
  function updateLink(id: string, patch: Partial<{ platform: string; url: string }>) {
    setContent((prev) => ({
      ...prev,
      social: safeArray(prev.social).map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }
  function removeLink(id: string) {
    setContent((prev) => ({ ...prev, social: safeArray(prev.social).filter((s) => s.id !== id) }));
  }
  return (
    <div className="space-y-5">
      <Field label="Contact email">
        <TextInput value={content.email ?? ""} onChange={(e) => set("email", e.target.value)} />
      </Field>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-mono uppercase tracking-wide text-neutral-400">Social links</label>
          <button onClick={addLink} className="text-xs rounded-md border border-white/15 px-3 py-1.5 hover:bg-white/10">
            + Add link
          </button>
        </div>
        {items.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-2 border border-white/10 rounded-md p-3">
            <input
              value={s.platform}
              onChange={(e) => updateLink(s.id, { platform: e.target.value })}
              placeholder="Platform (e.g. Instagram)"
              className={`${inputCls} w-40`}
            />
            <input
              value={s.url}
              onChange={(e) => updateLink(s.id, { url: e.target.value })}
              placeholder="https://..."
              className={`${inputCls} flex-1 min-w-[180px]`}
            />
            <button onClick={() => removeLink(s.id)} className="text-xs text-red-400 hover:text-red-300">
              Remove
            </button>
          </div>
        ))}
      </div>
      <SaveBar onSave={onSave} saving={saving} toast={toast} />
    </div>
  );
}

/* ---------------- Work tab ---------------- */
function WorkTab({ items, setItems }: { items: WorkItemRow[]; setItems: React.Dispatch<React.SetStateAction<WorkItemRow[]>> }) {
  const [busyId, setBusyId] = useState<number | "new" | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  async function addItem() {
    setBusyId("new");
    try {
      const res = await fetch("/api/admin/work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New project", order: items.length }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error);
      setItems((prev) => [...prev, json.item]);
    } catch {
      setToast({ type: "error", text: "Could not create item." });
    } finally {
      setBusyId(null);
    }
  }

  function updateLocal(id: number, patch: Partial<WorkItemRow>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  async function saveItem(item: WorkItemRow) {
    setBusyId(item.id);
    setToast(null);
    try {
      const res = await fetch(`/api/admin/work/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error);
      updateLocal(item.id, json.item);
      setToast({ type: "success", text: "Saved and live on the site." });
    } catch {
      setToast({ type: "error", text: "Could not save item." });
    } finally {
      setBusyId(null);
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function deleteItem(id: number) {
    setBusyId(id);
    try {
      await fetch(`/api/admin/work/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((it) => it.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">Manage your portfolio work / projects grid.</p>
        <button onClick={addItem} disabled={busyId === "new"} className="rounded-md bg-white text-black text-sm font-medium px-4 py-2">
          + Add project
        </button>
      </div>
      {toast && <span className={`text-sm ${toast.type === "success" ? "text-emerald-400" : "text-red-400"}`}>{toast.text}</span>}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border border-white/10 rounded-lg p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Title">
                <TextInput value={item.title ?? ""} onChange={(e) => updateLocal(item.id, { title: e.target.value })} />
              </Field>
              <Field label="Category">
                <TextInput value={item.category ?? ""} onChange={(e) => updateLocal(item.id, { category: e.target.value })} />
              </Field>
              <Field label="Year">
                <TextInput value={item.year ?? ""} onChange={(e) => updateLocal(item.id, { year: e.target.value })} />
              </Field>
              <Field label="External link">
                <TextInput value={item.link ?? ""} onChange={(e) => updateLocal(item.id, { link: e.target.value })} />
              </Field>
              <Field label="Order">
                <TextInput type="number" value={item.order ?? 0} onChange={(e) => updateLocal(item.id, { order: Number(e.target.value) })} />
              </Field>
              <div className="flex items-end gap-4 pb-2">
                <Checkbox label="Visible" checked={item.visible !== false} onChange={(v) => updateLocal(item.id, { visible: v })} />
                <Checkbox label="Featured" checked={!!item.featured} onChange={(v) => updateLocal(item.id, { featured: v })} />
              </div>
            </div>
            <Field label="Description">
              <TextArea value={item.description ?? ""} onChange={(e) => updateLocal(item.id, { description: e.target.value })} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <FileUpload label="Cover image" value={item.cover ?? ""} onChange={(v) => updateLocal(item.id, { cover: v })} accept="image/*" />
              <FileUpload label="Video" value={item.video ?? ""} onChange={(v) => updateLocal(item.id, { video: v })} accept="video/*" />
            </div>
            <Field label="Gallery URLs (comma separated)">
              <TextInput
                value={safeArray(item.gallery).join(", ")}
                onChange={(e) => updateLocal(item.id, { gallery: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              />
            </Field>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => saveItem(item)}
                disabled={busyId === item.id}
                className="rounded-md bg-white text-black text-sm font-medium px-4 py-2 disabled:opacity-50"
              >
                {busyId === item.id ? "Saving…" : "Save"}
              </button>
              <button onClick={() => deleteItem(item.id)} className="text-sm text-red-400 hover:text-red-300">
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-neutral-500">No projects yet — add your first one above.</p>}
      </div>
    </div>
  );
}

/* ---------------- Collabs tab ---------------- */
function CollabsTab({ items, setItems }: { items: CollabRow[]; setItems: React.Dispatch<React.SetStateAction<CollabRow[]>> }) {
  const [busyId, setBusyId] = useState<number | "new" | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  async function addItem() {
    setBusyId("new");
    try {
      const res = await fetch("/api/admin/collabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New collaborator", order: items.length }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error);
      setItems((prev) => [...prev, json.item]);
    } catch {
      setToast({ type: "error", text: "Could not create item." });
    } finally {
      setBusyId(null);
    }
  }

  function updateLocal(id: number, patch: Partial<CollabRow>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  async function saveItem(item: CollabRow) {
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/admin/collabs/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error);
      updateLocal(item.id, json.item);
      setToast({ type: "success", text: "Saved and live on the site." });
    } catch {
      setToast({ type: "error", text: "Could not save item." });
    } finally {
      setBusyId(null);
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function deleteItem(id: number) {
    setBusyId(id);
    try {
      await fetch(`/api/admin/collabs/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((it) => it.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">Manage collaborations & partners.</p>
        <button onClick={addItem} disabled={busyId === "new"} className="rounded-md bg-white text-black text-sm font-medium px-4 py-2">
          + Add collab
        </button>
      </div>
      {toast && <span className={`text-sm ${toast.type === "success" ? "text-emerald-400" : "text-red-400"}`}>{toast.text}</span>}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border border-white/10 rounded-lg p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Name">
                <TextInput value={item.name ?? ""} onChange={(e) => updateLocal(item.id, { name: e.target.value })} />
              </Field>
              <Field label="Role">
                <TextInput value={item.role ?? ""} onChange={(e) => updateLocal(item.id, { role: e.target.value })} />
              </Field>
              <Field label="Year">
                <TextInput value={item.year ?? ""} onChange={(e) => updateLocal(item.id, { year: e.target.value })} />
              </Field>
              <Field label="Order">
                <TextInput type="number" value={item.order ?? 0} onChange={(e) => updateLocal(item.id, { order: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label="Description">
              <TextArea value={item.description ?? ""} onChange={(e) => updateLocal(item.id, { description: e.target.value })} />
            </Field>
            <FileUpload label="Logo" value={item.logo ?? ""} onChange={(v) => updateLocal(item.id, { logo: v })} accept="image/*" />
            <Checkbox label="Visible" checked={item.visible !== false} onChange={(v) => updateLocal(item.id, { visible: v })} />
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => saveItem(item)}
                disabled={busyId === item.id}
                className="rounded-md bg-white text-black text-sm font-medium px-4 py-2 disabled:opacity-50"
              >
                {busyId === item.id ? "Saving…" : "Save"}
              </button>
              <button onClick={() => deleteItem(item.id)} className="text-sm text-red-400 hover:text-red-300">
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-neutral-500">No collaborations yet.</p>}
      </div>
    </div>
  );
}

/* ---------------- Experiences tab ---------------- */
function ExperiencesTab({ items, setItems }: { items: ExperienceRow[]; setItems: React.Dispatch<React.SetStateAction<ExperienceRow[]>> }) {
  const [busyId, setBusyId] = useState<number | "new" | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  async function addItem() {
    setBusyId("new");
    try {
      const res = await fetch("/api/admin/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: "New company", order: items.length }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error);
      setItems((prev) => [...prev, json.item]);
    } catch {
      setToast({ type: "error", text: "Could not create item." });
    } finally {
      setBusyId(null);
    }
  }

  function updateLocal(id: number, patch: Partial<ExperienceRow>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  async function saveItem(item: ExperienceRow) {
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/admin/experiences/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error);
      updateLocal(item.id, json.item);
      setToast({ type: "success", text: "Saved and live on the site." });
    } catch {
      setToast({ type: "error", text: "Could not save item." });
    } finally {
      setBusyId(null);
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function deleteItem(id: number) {
    setBusyId(id);
    try {
      await fetch(`/api/admin/experiences/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((it) => it.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">Manage work experience / case studies.</p>
        <button onClick={addItem} disabled={busyId === "new"} className="rounded-md bg-white text-black text-sm font-medium px-4 py-2">
          + Add experience
        </button>
      </div>
      {toast && <span className={`text-sm ${toast.type === "success" ? "text-emerald-400" : "text-red-400"}`}>{toast.text}</span>}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border border-white/10 rounded-lg p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Company">
                <TextInput value={item.company ?? ""} onChange={(e) => updateLocal(item.id, { company: e.target.value })} />
              </Field>
              <Field label="Role">
                <TextInput value={item.role ?? ""} onChange={(e) => updateLocal(item.id, { role: e.target.value })} />
              </Field>
              <Field label="Order">
                <TextInput type="number" value={item.order ?? 0} onChange={(e) => updateLocal(item.id, { order: Number(e.target.value) })} />
              </Field>
              <div className="flex items-end pb-2">
                <Checkbox label="Visible" checked={item.visible !== false} onChange={(v) => updateLocal(item.id, { visible: v })} />
              </div>
            </div>
            <Field label="Experience">
              <TextArea value={item.experience ?? ""} onChange={(e) => updateLocal(item.id, { experience: e.target.value })} />
            </Field>
            <Field label="About the work">
              <TextArea value={item.about ?? ""} onChange={(e) => updateLocal(item.id, { about: e.target.value })} />
            </Field>
            <Field label="My role">
              <TextArea value={item.myRole ?? ""} onChange={(e) => updateLocal(item.id, { myRole: e.target.value })} />
            </Field>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => saveItem(item)}
                disabled={busyId === item.id}
                className="rounded-md bg-white text-black text-sm font-medium px-4 py-2 disabled:opacity-50"
              >
                {busyId === item.id ? "Saving…" : "Save"}
              </button>
              <button onClick={() => deleteItem(item.id)} className="text-sm text-red-400 hover:text-red-300">
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-neutral-500">No experiences yet.</p>}
      </div>
    </div>
  );
}
