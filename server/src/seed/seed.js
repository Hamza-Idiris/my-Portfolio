import crypto from 'node:crypto';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { env } from '../config/env.js';
import { Admin } from '../models/Admin.js';
import { Project } from '../models/Project.js';
import { Skill } from '../models/Skill.js';
import { Service } from '../models/Service.js';
import { JourneyEvent } from '../models/JourneyEvent.js';
import { Certification } from '../models/Certification.js';
import { SiteSettings } from '../models/SiteSettings.js';
import * as data from './seedData.js';

/**
 * Idempotent seed: content is upserted by slug or name, so running it twice
 * does not create duplicates and does not overwrite edits made in the admin
 * dashboard for records that already exist.
 *
 * Analytics events and contact messages are never seeded. Every number in the
 * dashboard must come from real visitor activity.
 */

const generatePassword = () =>
  `Hi-${crypto.randomBytes(9).toString('base64url').replace(/[^A-Za-z0-9]/g, '')}-2026`;

async function seedAdmin() {
  const existing = await Admin.findOne({});
  if (existing) {
    console.log(`  admin: "${existing.username}" already exists, left unchanged`);
    return null;
  }

  const generated = !env.seedAdmin.password;
  const password = env.seedAdmin.password || generatePassword();

  const admin = await Admin.create({
    username: env.seedAdmin.username,
    email: env.seedAdmin.email,
    name: 'Hamza Idiris',
    passwordHash: await Admin.hashPassword(password),
    role: 'owner',
    // Forces a change on first sign-in when the password was auto-generated.
    mustChangePassword: generated,
  });

  console.log(`  admin: created "${admin.username}"`);
  return { username: admin.username, password, generated };
}

async function upsertMany(Model, items, keyField) {
  let created = 0;
  for (const item of items) {
    const key = { [keyField]: item[keyField] };
    // eslint-disable-next-line no-await-in-loop -- small, ordered data set
    const exists = await Model.exists(key);
    if (exists) continue;
    // eslint-disable-next-line no-await-in-loop
    await Model.create(item);
    created += 1;
  }
  console.log(`  ${Model.modelName}: ${created} created, ${items.length - created} already present`);
}

async function seedSettings() {
  const settings = await SiteSettings.getSingleton();
  const isFresh = !settings.profile.bio;

  if (!isFresh) {
    console.log('  SiteSettings: already configured, left unchanged');
    return;
  }

  settings.profile = { ...settings.profile.toObject(), ...data.settings.profile };
  settings.socialLinks = data.settings.socialLinks;
  settings.contact = { ...settings.contact.toObject(), ...data.settings.contact };
  settings.home = { ...settings.home.toObject(), ...data.settings.home };
  settings.seo = { ...settings.seo.toObject(), ...data.settings.seo };
  await settings.save();

  console.log('  SiteSettings: populated');
}

async function run() {
  console.log(`Seeding ${env.mongoUri}\n`);
  await connectDatabase();

  const adminResult = await seedAdmin();
  await upsertMany(Project, data.projects, 'slug');
  await upsertMany(Skill, data.skills, 'name');
  await upsertMany(Service, data.services, 'title');
  await upsertMany(JourneyEvent, data.journey, 'title');
  await upsertMany(Certification, data.certifications, 'title');
  await seedSettings();

  if (adminResult) {
    console.log(`
------------------------------------------------------------
  DEVELOPMENT ADMIN CREDENTIALS
  Username: ${adminResult.username}
  Password: ${adminResult.password}

  These are for local development only. Sign in at /admin/login
  and change the password from Settings -> Account before
  deploying anywhere public.
------------------------------------------------------------`);
  }

  console.log('\nSeed complete.');
  await disconnectDatabase();
  process.exit(0);
}

run().catch(async (error) => {
  console.error('Seed failed:', error);
  await disconnectDatabase();
  process.exit(1);
});
