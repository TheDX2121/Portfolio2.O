import {
  pgTable,
  serial,
  text,
  boolean,
  integer,
  real,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

// Singleton row holding all "single instance" site content (hero, about,
// nav, launch countdown, current project, social links, settings, music).
export const siteContent = pgTable("site_content", {
  id: integer("id").primaryKey().default(1),

  heroLabel: text("hero_label").default("𝚂𝚊𝚖𝚞𝚎𝚕~"),
  heroName: text("hero_name").default("VEBHAV"),
  heroProfession: text("hero_profession").default("CODER & VERSATILE"),
  heroDescription: text("hero_description").default(
    "Building with code, lost in cinema, creating digitally, gaming & expressing through words.",
  ),
  heroMediaType: text("hero_media_type").default("none"),
  heroMediaUrl: text("hero_media_url").default(""),
  heroPoster: text("hero_poster").default(""),
  heroVisible: boolean("hero_visible").default(true),

  infoText: text("info_text").default(
    "Vebhav, professionally known as Aries, is a Video Editor & Creative Artist focused on cinematic editing, visual storytelling and creative content.",
  ),
  infoSkills: jsonb("info_skills").$type<string[]>().default([
    "Video Editing",
    "Motion Graphics",
    "Colour Grading",
    "Sound Design",
    "Creative Direction",
    "Visual Storytelling",
  ]),
  infoPhoto: text("info_photo").default(""),

  nav: jsonb("nav")
    .$type<{ id: string; label: string; visible: boolean; order: number }[]>()
    .default([
      { id: "info", label: "Info", visible: true, order: 1 },
      { id: "work", label: "Work", visible: true, order: 2 },
      { id: "collabs", label: "Collabs", visible: true, order: 3 },
      { id: "workinfo", label: "Work Info", visible: true, order: 4 },
      { id: "launch", label: "New Launch", visible: true, order: 5 },
      { id: "current", label: "Currently Working On", visible: true, order: 6 },
      { id: "contact", label: "Contact", visible: true, order: 7 },
    ]),

  launchEnabled: boolean("launch_enabled").default(false),
  launchProjectName: text("launch_project_name").default(""),
  launchDate: text("launch_date").default(""),
  launchTimezone: text("launch_timezone").default("Asia/Kolkata"),
  launchCover: text("launch_cover").default(""),
  launchVideo: text("launch_video").default(""),
  launchDescription: text("launch_description").default(""),
  launchFireworks: boolean("launch_fireworks").default(true),
  launchButtonText: text("launch_button_text").default("View Project"),
  launchDestination: text("launch_destination").default(""),

  currentProjectName: text("current_project_name").default(""),
  currentProjectCover: text("current_project_cover").default(""),
  currentProjectVideo: text("current_project_video").default(""),
  currentProjectDescription: text("current_project_description").default(""),
  currentProjectStatus: text("current_project_status").default("IN PROGRESS"),
  currentProjectProgress: integer("current_project_progress").default(0),
  currentProjectExpectedLaunch: text("current_project_expected_launch").default(""),
  currentProjectVisible: boolean("current_project_visible").default(false),

  social: jsonb("social").$type<{ id: string; platform: string; url: string }[]>().default([]),
  email: text("email").default(""),

  settingsTitle: text("settings_title").default("𝚂𝚊𝚖𝚞𝚎𝚕~ — Vebhav"),
  settingsFavicon: text("settings_favicon").default(""),
  settingsGrain: boolean("settings_grain").default(true),
  settingsCursor: boolean("settings_cursor").default(true),

  musicEnabled: boolean("music_enabled").default(false),
  musicUrl: text("music_url").default(""),
  musicVolume: real("music_volume").default(0.5),

  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workItems = pgTable("work_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default(""),
  category: text("category").default(""),
  year: text("year").default(""),
  cover: text("cover").default(""),
  video: text("video").default(""),
  gallery: jsonb("gallery").$type<string[]>().default([]),
  description: text("description").default(""),
  link: text("link").default(""),
  featured: boolean("featured").default(false),
  visible: boolean("visible").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const collabs = pgTable("collabs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  role: text("role").default(""),
  year: text("year").default(""),
  logo: text("logo").default(""),
  description: text("description").default(""),
  visible: boolean("visible").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  company: text("company").notNull().default(""),
  role: text("role").default(""),
  experience: text("experience").default(""),
  about: text("about").default(""),
  myRole: text("my_role").default(""),
  visible: boolean("visible").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
