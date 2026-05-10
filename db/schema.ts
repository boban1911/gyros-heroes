import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const magicLinks = pgTable('magic_links', {
  tokenHash: text('token_hash').primaryKey(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const loyaltyCards = pgTable(
  'loyalty_cards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id')
      .notNull()
      .unique()
      .references(() => customers.id, { onDelete: 'cascade' }),
    stampsCount: integer('stamps_count').notNull().default(0),
    totalRedemptions: integer('total_redemptions').notNull().default(0),
    status: text('status').notNull().default('active'),
    googleObjectId: text('google_object_id').unique(),
    totpSecret: text('totp_secret'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check('loyalty_cards_status_check', sql`${t.status} in ('active','ready_to_redeem')`)],
);

export const stampEvents = pgTable(
  'stamp_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cardId: uuid('card_id')
      .notNull()
      .references(() => loyaltyCards.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    staffId: uuid('staff_id').references(() => staffUsers.id, { onDelete: 'set null' }),
    qrJti: text('qr_jti'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check('stamp_events_type_check', sql`${t.type} in ('stamp','redeem')`)],
);

export const qrTokens = pgTable('qr_tokens', {
  jti: text('jti').primaryKey(),
  cardId: uuid('card_id')
    .notNull()
    .references(() => loyaltyCards.id, { onDelete: 'cascade' }),
  issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
});

export const staffUsers = pgTable(
  'staff_users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').notNull().default('staff'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check('staff_users_role_check', sql`${t.role} in ('staff','admin')`)],
);

export const staffSessions = pgTable('staff_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  staffId: uuid('staff_id')
    .notNull()
    .references(() => staffUsers.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const loyaltyConfig = pgTable('loyalty_config', {
  id: integer('id').primaryKey().default(1),
  stampsRequired: integer('stamps_required').notNull().default(10),
  rewardDescription: text('reward_description').notNull().default('Besplatan Hero gyros'),
  scanCooldownSeconds: integer('scan_cooldown_seconds').notNull().default(1800),
  qrTokenTtlSeconds: integer('qr_token_ttl_seconds').notNull().default(60),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
