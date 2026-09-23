"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FullContent, WorkItemRow } from "@/lib/types";
import { safeArray } from "@/lib/types";

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov)(\?|#|$)/i.test(url);
}

function MediaTag({
  url,
  poster,
  className,
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
}: {
  url?: string | null;
  poster?: string | null;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
}) {
  if (!url) return null;
  if (isVideoUrl(url)) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        className={className}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline
        poster={poster || undefined}
      >
        <source src={url} />
      </video>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={url} alt="" />;
}

function useRevealObserver(dependency: unknown) {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependency]);
}

const PLATFORM_ICON: Record<string, string> = {
  instagram: "IG",
  x: "X",
  twitter: "X",
  facebook: "FB",
  youtube: "YT",
  linkedin: "IN",
  github: "GH",
  tiktok: "TT",
  discord: "DC",
  telegram: "TG",
  website: "WEB",
  pinterest: "PIN",
  behance: "BE",
  dribbble: "DR",
};

function platformLabel(platform: string) {
  return PLATFORM_ICON[(platform || "").toLowerCase()] || (platform || "?").slice(0, 3).toUpperCase();
}

function useCountdown(targetIso: string | null | undefined) {
  const [remaining, setRemaining] = useState<number>(() => {
    if (!targetIso) return 0;
    return new Date(targetIso).getTime() - Date.now();
  });

  useEffect(() => {
    if (!targetIso) {
      setRemaining(0);
      return;
    }
    const tick = () => setRemaining(new Date(targetIso).getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  const done = remaining <= 0;
  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { done, days, hours, minutes, seconds };
}

export default function PublicSite({ initialData }: { initialData: FullContent }) {
  const [data, setData] = useState<FullContent>(initialData);
  const [mounted, setMounted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [selectedWork, setSelectedWork] = useState<WorkItemRow | null>(null);
  const [expandedExp, setExpandedExp] = useState<number | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fade the page in quickly on mount instead of the old ~1.8s hard-coded
  // loading screen that blocked rendering until Firebase/Cloudinary resolved.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Keep the live site fresh without needing a manual refresh whenever the
  // admin publishes a change.
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/public/content", { cache: "no-store" });
        if (res.ok) {
          const fresh = (await res.json()) as FullContent;
          setData(fresh);
        }
      } catch {
        // ignore transient network errors, keep showing last good data
      }
    }, 20000);
    return () => clearInterval(id);
  }, []);

  const { content, work, collabs, experiences } = data;

  const navItems = useMemo(
    () =>
      safeArray(content.nav)
        .filter((n) => n.visible)
        .sort((a, b) => a.order - b.order),
    [content.nav],
  );

  const social = useMemo(() => safeArray(content.social), [content.social]);

  const visibleWork = useMemo(
    () => work.filter((w) => w.visible !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [work],
  );
  const categories = useMemo(
    () => ["ALL", ...Array.from(new Set(visibleWork.map((w) => w.category).filter(Boolean) as string[]))],
    [visibleWork],
  );
  const filteredWork =
    activeCategory === "ALL" ? visibleWork : visibleWork.filter((w) => w.category === activeCategory);

  const visibleCollabs = useMemo(
    () => collabs.filter((c) => c.visible !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [collabs],
  );
  const visibleExperiences = useMemo(
    () => experiences.filter((e) => e.visible !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [experiences],
  );

  useRevealObserver(`${filteredWork.length}-${visibleCollabs.length}-${visibleExperiences.length}-${mounted}`);

  const countdown = useCountdown(content.launchEnabled ? content.launchDate : null);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  const toggleMusic = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (musicPlaying) {
      el.pause();
      setMusicPlaying(false);
    } else {
      el.volume = content.musicVolume ?? 0.5;
      el.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
    }
  }, [musicPlaying, content.musicVolume]);

  const showMusicButton = !!content.musicEnabled && !!content.musicUrl;
  const showCurrent = !!content.currentProjectVisible && !!content.currentProjectName;

  return (
    <div
      className={`min-h-screen bg-[#080808] text-[#f2f0eb] transition-opacity duration-500 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      {content.settingsGrain !== false && <div className="grain-overlay" />}

      {/* Header / Nav */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[5vw] py-5 bg-black/70 backdrop-blur-sm">
        <a href="#hero" className="font-bold text-[15px] tracking-wide">
          {content.heroLabel || "𝚂𝚊𝚖𝚞𝚎𝚕~"}
        </a>
        <nav className="hidden md:flex gap-7">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="font-mono-site text-[12px] tracking-[0.12em] uppercase text-[#9a9a9a] hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
        {/* Menu button: explicit solid black background + white text at all times */}
        <button
          type="button"
          onClick={() => setMobileNavOpen((v) => !v)}
          className="md:hidden z-[70] rounded-full bg-black border border-white/20 px-4 py-2 font-mono-site text-[12px] tracking-[0.12em] uppercase text-white"
        >
          {mobileNavOpen ? "Close" : "Menu"}
        </button>
      </header>

      {/* Mobile nav overlay: solid black background, white text (fixes transparency bug) */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col justify-center gap-6 px-[8vw] md:hidden">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={closeMobileNav}
              className="text-3xl font-medium text-white"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}

      {/* Hero */}
      {content.heroVisible !== false && (
        <section id="hero" className="relative min-h-[100svh] flex flex-col justify-end px-[5vw] pt-32 pb-10">
          {content.heroMediaUrl && (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <MediaTag
                url={content.heroMediaType === "video" ? content.heroMediaUrl : content.heroMediaUrl}
                poster={content.heroPoster}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black" />
            </div>
          )}
          <div className="relative z-10">
            <div className="font-mono-site text-[13px] tracking-[0.3em] text-[#d8cbb0] uppercase mb-4">
              {content.heroLabel}
            </div>
            <h1 className="text-[clamp(42px,10vw,150px)] font-bold leading-[0.92] tracking-tight">
              {content.heroName}
            </h1>
            <div className="font-mono-site text-[clamp(11px,1.6vw,14px)] tracking-[0.15em] uppercase text-[#9a9a9a] mt-5">
              {content.heroProfession}
            </div>
            <p className="max-w-[520px] text-[17px] font-light text-[#9a9a9a] leading-relaxed mt-6">
              {content.heroDescription}
            </p>
            {showCurrent && (
              <div className="mt-14 pt-5 border-t border-white/10 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d8cbb0] pulse-dot" />
                <span className="font-mono-site text-[11px] tracking-[0.15em] uppercase text-[#9a9a9a]">
                  Currently working on
                </span>
                <span className="text-sm">{content.currentProjectName}</span>
              </div>
            )}
          </div>
          <div className="absolute bottom-9 right-[5vw] z-10 hidden sm:flex items-center gap-3 font-mono-site text-[10px] tracking-[0.2em] uppercase text-[#9a9a9a]">
            Scroll
            <span className="scroll-line relative w-px h-8 bg-white/10 overflow-hidden" />
          </div>
        </section>
      )}

      {/* Info / About */}
      <section id="info" className="reveal border-t border-white/10 px-[5vw] py-24">
        <div className="flex items-baseline justify-between gap-5 flex-wrap mb-11">
          <h2 className="text-[clamp(24px,3.6vw,42px)] font-semibold tracking-tight">Info</h2>
          <span className="font-mono-site text-[12px] text-[#9a9a9a]">01 / Profile</span>
        </div>
        <div className="grid md:grid-cols-[1fr_1.4fr] gap-16">
          <div className="flex flex-col gap-6">
            {content.infoPhoto && (
              <div className="relative w-full max-w-[300px] aspect-square overflow-hidden border border-white/10 bg-[#151515] rounded-sm">
                <MediaTag url={content.infoPhoto} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {safeArray(content.infoSkills).map((skill) => (
                <span
                  key={skill}
                  className="font-mono-site text-[11px] uppercase tracking-wide border border-white/15 rounded-full px-3 py-1 text-[#9a9a9a]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-4 text-[#c8c6c1] leading-relaxed text-[16px]">
            {(content.infoText || "").split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Work */}
      {visibleWork.length > 0 && (
        <section id="work" className="reveal border-t border-white/10 px-[5vw] py-24">
          <div className="flex items-baseline justify-between gap-5 flex-wrap mb-11">
            <h2 className="text-[clamp(24px,3.6vw,42px)] font-semibold tracking-tight">Work</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`font-mono-site text-[11px] uppercase tracking-wide rounded-full px-3 py-1 border transition-colors ${
                    activeCategory === cat
                      ? "bg-white text-black border-white"
                      : "border-white/15 text-[#9a9a9a] hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWork.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedWork(w)}
                className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-[#151515] border border-white/10 text-left"
              >
                <MediaTag
                  url={w.cover || w.video}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  autoPlay={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-5">
                  <div className="font-mono-site text-[11px] uppercase tracking-wide text-[#d8cbb0]">
                    {w.category}
                  </div>
                  <div className="text-lg font-medium mt-1">{w.title}</div>
                  <div className="font-mono-site text-[11px] text-[#9a9a9a] mt-1">{w.year}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Collabs */}
      {visibleCollabs.length > 0 && (
        <section id="collabs" className="reveal border-t border-white/10 px-[5vw] py-24">
          <div className="flex items-baseline justify-between gap-5 flex-wrap mb-11">
            <h2 className="text-[clamp(24px,3.6vw,42px)] font-semibold tracking-tight">Collabs</h2>
            <span className="font-mono-site text-[12px] text-[#9a9a9a]">Creative Collaborations</span>
          </div>
          <div className="divide-y divide-white/10 border-t border-b border-white/10">
            {visibleCollabs.map((c) => (
              <div key={c.id} className="grid sm:grid-cols-[80px_1fr_1.4fr] items-center gap-5 py-6">
                {c.logo ? (
                  <MediaTag url={c.logo} className="w-14 h-14 object-contain rounded-full bg-white/5" autoPlay={false} />
                ) : (
                  <div className="w-14 h-14" />
                )}
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-[#9a9a9a]">
                    {c.role} {c.year ? `· ${c.year}` : ""}
                  </div>
                </div>
                <div className="text-sm text-[#c8c6c1]">{c.description}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Work Info / Experiences */}
      {visibleExperiences.length > 0 && (
        <section id="workinfo" className="reveal border-t border-white/10 px-[5vw] py-24">
          <div className="flex items-baseline justify-between gap-5 flex-wrap mb-11">
            <h2 className="text-[clamp(24px,3.6vw,42px)] font-semibold tracking-tight">Work Info</h2>
            <span className="font-mono-site text-[12px] text-[#9a9a9a]">Experience & Case Studies</span>
          </div>
          <div className="space-y-3">
            {visibleExperiences.map((e) => {
              const open = expandedExp === e.id;
              return (
                <div key={e.id} className="border border-white/10 rounded-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedExp(open ? null : e.id)}
                    className="w-full flex items-center justify-between gap-5 px-6 py-5 text-left"
                  >
                    <div>
                      <h3 className="font-medium">{e.company}</h3>
                      <div className="text-sm text-[#9a9a9a]">{e.role}</div>
                    </div>
                    <span className="font-mono-site text-xl leading-none">{open ? "−" : "+"}</span>
                  </button>
                  {open && (
                    <div className="px-6 pb-6 space-y-4 text-sm text-[#c8c6c1]">
                      {e.experience && (
                        <div>
                          <h4 className="font-mono-site text-[11px] uppercase tracking-wide text-[#d8cbb0] mb-1">
                            Experience
                          </h4>
                          <p>{e.experience}</p>
                        </div>
                      )}
                      {e.about && (
                        <div>
                          <h4 className="font-mono-site text-[11px] uppercase tracking-wide text-[#d8cbb0] mb-1">
                            About The Work
                          </h4>
                          <p>{e.about}</p>
                        </div>
                      )}
                      {e.myRole && (
                        <div>
                          <h4 className="font-mono-site text-[11px] uppercase tracking-wide text-[#d8cbb0] mb-1">
                            My Role
                          </h4>
                          <p>{e.myRole}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* New Launch */}
      {content.launchEnabled && (
        <section id="launch" className="reveal border-t border-white/10 px-[5vw] py-24 relative overflow-hidden">
          <div className="flex items-baseline justify-between gap-5 flex-wrap mb-11">
            <h2 className="text-[clamp(24px,3.6vw,42px)] font-semibold tracking-tight">New Launch</h2>
            <span className="font-mono-site text-[12px] text-[#9a9a9a]">
              {countdown.done ? "Launching Now" : "Coming Soon"}
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {(content.launchCover || content.launchVideo) && (
                <div className="aspect-video overflow-hidden rounded-sm border border-white/10 bg-[#151515] mb-6">
                  <MediaTag
                    url={content.launchVideo || content.launchCover}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h3 className="text-2xl font-semibold mb-2">{content.launchProjectName}</h3>
              <p className="text-[#9a9a9a] text-sm leading-relaxed">{content.launchDescription}</p>
            </div>
            <div>
              {!countdown.done ? (
                <div className="grid grid-cols-4 gap-3 text-center mb-8">
                  {[
                    ["Days", countdown.days],
                    ["Hours", countdown.hours],
                    ["Minutes", countdown.minutes],
                    ["Seconds", countdown.seconds],
                  ].map(([label, value]) => (
                    <div key={label as string} className="border border-white/10 rounded-sm py-5">
                      <div className="text-3xl font-bold tabular-nums">{String(value).padStart(2, "0")}</div>
                      <div className="font-mono-site text-[10px] uppercase tracking-wide text-[#9a9a9a] mt-1">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-8 text-lg text-[#d8cbb0] font-mono-site tracking-wide">
                  🎉 It&apos;s live!
                </div>
              )}
              {content.launchDestination && (
                <a
                  href={content.launchDestination}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-black rounded-full px-6 py-3 text-sm font-medium hover:bg-[#d8cbb0] transition-colors"
                >
                  {content.launchButtonText || "View Project"} →
                </a>
              )}
            </div>
          </div>
          {content.launchFireworks !== false && countdown.done && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-[#d8cbb0] animate-ping"
                  style={{
                    left: `${(i * 37) % 100}%`,
                    top: `${(i * 53) % 100}%`,
                    animationDelay: `${(i % 6) * 0.3}s`,
                    animationDuration: "2.4s",
                  }}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Currently Working On */}
      {showCurrent && (
        <section id="current" className="reveal border-t border-white/10 px-[5vw] py-24">
          <div className="flex items-baseline justify-between gap-5 flex-wrap mb-11">
            <h2 className="text-[clamp(24px,3.6vw,42px)] font-semibold tracking-tight">Currently Working On</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {(content.currentProjectCover || content.currentProjectVideo) && (
              <div className="aspect-video overflow-hidden rounded-sm border border-white/10 bg-[#151515]">
                <MediaTag
                  url={content.currentProjectVideo || content.currentProjectCover}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <div className="font-mono-site text-[11px] uppercase tracking-wide text-[#d8cbb0] mb-2">
                {content.currentProjectStatus || "In Progress"}
              </div>
              <h3 className="text-2xl font-semibold mb-3">{content.currentProjectName}</h3>
              <p className="text-[#9a9a9a] text-sm leading-relaxed mb-6">{content.currentProjectDescription}</p>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                <div
                  className="h-full bg-[#d8cbb0] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, content.currentProjectProgress ?? 0))}%` }}
                />
              </div>
              <div className="font-mono-site text-[11px] text-[#9a9a9a]">
                Progress {content.currentProjectProgress ?? 0}%
                {content.currentProjectExpectedLaunch ? ` · Expected: ${content.currentProjectExpectedLaunch}` : ""}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="reveal border-t border-white/10 px-[5vw] py-28">
        <div className="font-mono-site text-[11px] uppercase tracking-[0.18em] text-[#9a9a9a] mb-4">
          Get In Touch
        </div>
        <h2 className="text-[clamp(30px,6vw,72px)] font-semibold tracking-tight mb-8">
          Let&apos;s Create Something
        </h2>
        {content.email && (
          <a
            href={`mailto:${content.email}`}
            className="inline-block text-xl sm:text-2xl border-b border-white/20 pb-1 hover:border-white transition-colors mb-10"
          >
            {content.email}
          </a>
        )}
        {social.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-6">
            {social.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="font-mono-site text-[11px] uppercase tracking-wide border border-white/15 rounded-full px-4 py-2 text-[#9a9a9a] hover:text-white hover:border-white/40 transition-colors"
              >
                {platformLabel(s.platform)} · {s.platform}
              </a>
            ))}
          </div>
        )}
        <div className="mt-24 pt-8 border-t border-white/10 font-mono-site text-[11px] text-[#666] flex items-center justify-between flex-wrap gap-3">
          <span>© {new Date().getFullYear()} {content.heroName || "Portfolio"}</span>
          <a href="/admin" className="hover:text-white transition-colors">
            Admin
          </a>
        </div>
      </section>

      {/* Project modal */}
      {selectedWork && (
        <div
          className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-4 sm:p-10 overflow-y-auto"
          onClick={() => setSelectedWork(null)}
        >
          <div
            className="bg-[#0e0e0e] border border-white/10 rounded-sm max-w-3xl w-full my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <MediaTag
                url={selectedWork.video || selectedWork.cover}
                controls={!!selectedWork.video}
                className="w-full max-h-[60vh] object-cover"
              />
              <button
                onClick={() => setSelectedWork(null)}
                className="absolute top-3 right-3 bg-black text-white rounded-full w-9 h-9 flex items-center justify-center border border-white/20"
              >
                ✕
              </button>
            </div>
            <div className="p-7">
              <div className="font-mono-site text-[11px] uppercase tracking-wide text-[#d8cbb0]">
                {selectedWork.category}
              </div>
              <div className="text-2xl font-semibold mt-1">{selectedWork.title}</div>
              <div className="font-mono-site text-[11px] text-[#9a9a9a] mt-1">{selectedWork.year}</div>
              <p className="text-sm text-[#c8c6c1] mt-4 leading-relaxed">{selectedWork.description}</p>
              {safeArray(selectedWork.gallery).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                  {safeArray(selectedWork.gallery).map((g, i) => (
                    <MediaTag key={i} url={g} className="w-full aspect-square object-cover rounded-sm" autoPlay={false} />
                  ))}
                </div>
              )}
              {selectedWork.link && (
                <a
                  href={selectedWork.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-6 text-sm border-b border-white/30 hover:border-white pb-0.5"
                >
                  Visit project →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Music player */}
      {showMusicButton && (
        <>
          <audio ref={audioRef} src={content.musicUrl || undefined} loop preload="none" />
          <button
            onClick={toggleMusic}
            aria-label={musicPlaying ? "Pause music" : "Play music"}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-black border border-white/20 text-white flex items-center justify-center shadow-lg"
          >
            {musicPlaying ? "❚❚" : "♪"}
          </button>
        </>
      )}
    </div>
  );
}
