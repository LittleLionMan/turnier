import { relations } from "drizzle-orm";
import type { DrinkChoice } from "@/lib/constants";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const event = pgTable("event", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  eventDate: date("event_date"),
  startTime: text("start_time"),
  location: text("location"),
  feeCents: integer("fee_cents").notNull().default(1000),
  paypalMeUrl: text("paypal_me_url"),
  paymentEnabled: boolean("payment_enabled").notNull().default(false),
  genderEnabled: boolean("gender_enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdultGuestPreference = {
  food: FoodChoice | null;
  drinks: DrinkChoice[];
};

export type ChildGuestPreference = {
  food: FoodChoice | null;
};

export type GuestPreferences = {
  adults: AdultGuestPreference[];
  children: ChildGuestPreference[];
};

export const EMPTY_GUEST_PREFERENCES: GuestPreferences = { adults: [], children: [] };

export const genderEnum = pgEnum("gender", ["weiblich", "maennlich", "divers"]);
export const paymentStatusEnum = pgEnum("payment_status", ["offen", "bezahlt"]);
export const foodChoiceEnum = pgEnum("food_choice", ["fleisch", "vegetarisch", "vegan"]);

export const prospectStatusEnum = pgEnum("prospect_status", ["vorgeschlagen", "offen", "informiert", "angemeldet"]);
export const contactMethodEnum = pgEnum("contact_method", ["anruf", "nachricht", "persoenlich", "social_media"]);

export const prospect = pgTable("prospect", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  hint: text("hint"),
  status: prospectStatusEnum("status").notNull().default("vorgeschlagen"),
  suggestedById: text("suggested_by_id").references(() => user.id, { onDelete: "set null" }),
  informedById: text("informed_by_id").references(() => user.id, { onDelete: "set null" }),
  contactMethod: contactMethodEnum("contact_method"),
  contactNote: text("contact_note"),
  informedAt: timestamp("informed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const registration = pgTable(
  "registration",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    nickname: text("nickname"),
    activeFrom: integer("active_from"),
    activeTo: integer("active_to"),
    showPublicly: boolean("show_publicly").notNull().default(false),
    playsTournament: boolean("plays_tournament").notNull().default(false),
    positions: text("positions").array().notNull().default([]),
    gender: genderEnum("gender"),
    insuranceAccepted: boolean("insurance_accepted").notNull().default(false),
    foodChoice: foodChoiceEnum("food_choice"),
    drinkChoices: text("drink_choices").array().notNull().default([]),
    guestAdults: integer("guest_adults").notNull().default(0),
    guestChildren: integer("guest_children").notNull().default(0),
    guestPreferences: jsonb("guest_preferences").$type<GuestPreferences>().notNull().default(EMPTY_GUEST_PREFERENCES),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("offen"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("registration_event_user_idx").on(table.eventId, table.userId)],
);

export const helperRole = pgTable("helper_role", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  exemptsFromFee: boolean("exempts_from_fee").notNull().default(false),
  maxCount: integer("max_count"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const registrationHelperRole = pgTable(
  "registration_helper_role",
  {
    registrationId: integer("registration_id")
      .notNull()
      .references(() => registration.id, { onDelete: "cascade" }),
    helperRoleId: integer("helper_role_id")
      .notNull()
      .references(() => helperRole.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.registrationId, table.helperRoleId] })],
);

export const registrationRelations = relations(registration, ({ one, many }) => ({
  user: one(user, { fields: [registration.userId], references: [user.id] }),
  event: one(event, { fields: [registration.eventId], references: [event.id] }),
  helperRoles: many(registrationHelperRole),
}));

export const registrationHelperRoleRelations = relations(registrationHelperRole, ({ one }) => ({
  registration: one(registration, {
    fields: [registrationHelperRole.registrationId],
    references: [registration.id],
  }),
  helperRole: one(helperRole, {
    fields: [registrationHelperRole.helperRoleId],
    references: [helperRole.id],
  }),
}));

export type Gender = (typeof genderEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type FoodChoice = (typeof foodChoiceEnum.enumValues)[number];
export type ProspectStatus = (typeof prospectStatusEnum.enumValues)[number];
export type ContactMethod = (typeof contactMethodEnum.enumValues)[number];
export type EventRow = typeof event.$inferSelect;
export type RegistrationRow = typeof registration.$inferSelect;
export type HelperRoleRow = typeof helperRole.$inferSelect;
