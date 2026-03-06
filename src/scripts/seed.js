import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env") });

import {
  userRepository,
  professionalRepository,
  bookingRepository,
  enquiryRepository,
  settingsRepository,
} from "../repositories/index.js";
import connectDB from "../config/db.js";
import CategoryModel from "../models/Category.js";
import {
  USER_ROLES,
  PROFESSIONAL_STATUS,
  PROFESSIONAL_CATEGORIES,
  BOOKING_STATUS,
  ENQUIRY_STATUS,
} from "../utils/constants.util.js";

const DEFAULT_PASSWORD = "12345678";
const SEED_BOOKING_MARKER = "__seed_booking_v2__";
const SEED_ENQUIRY_MARKER = "__seed_enquiry_v2__";

const DEFAULT_SETTINGS = {
  notifications: {
    push: true,
    email: false,
    whatsapp: true,
    marketing: true,
  },
  privacy: {
    showEmail: false,
    showPhone: false,
  },
  language: "en",
  timezone: "UTC",
};

const CATEGORIES = [
  {
    name: "Photographer",
    slug: "photographer",
    description: "Professional photo coverage",
  },
  {
    name: "Videographer",
    slug: "videographer",
    description: "Professional video coverage",
  },
  {
    name: "Cinematographer",
    slug: "cinematographer",
    description: "Cinematic storytelling",
  },
  {
    name: "Editor",
    slug: "editor",
    description: "Photo and video editing",
  },
];

const SAMPLE_CLIENTS = [
  { firstName: "Arjun", lastName: "Mehta", email: "client1@example.com" },
  { firstName: "Meera", lastName: "Nair", email: "client2@example.com" },
  { firstName: "Rohit", lastName: "Gupta", email: "client3@example.com" },
  { firstName: "Kavya", lastName: "Rao", email: "client4@example.com" },
];

const SAMPLE_PROFESSIONALS = [
  {
    firstName: "Rahul",
    lastName: "Sharma",
    email: "pro1@example.com",
    category: PROFESSIONAL_CATEGORIES.PHOTOGRAPHER,
    city: "Mumbai",
    status: PROFESSIONAL_STATUS.APPROVED,
    isVerified: true,
  },
  {
    firstName: "Priya",
    lastName: "Verma",
    email: "pro2@example.com",
    category: PROFESSIONAL_CATEGORIES.VIDEOGRAPHER,
    city: "Pune",
    status: PROFESSIONAL_STATUS.PENDING,
    isVerified: false,
  },
  {
    firstName: "Amit",
    lastName: "Singh",
    email: "pro3@example.com",
    category: PROFESSIONAL_CATEGORIES.CINEMATOGRAPHER,
    city: "Delhi",
    status: PROFESSIONAL_STATUS.REJECTED,
    isVerified: false,
  },
  {
    firstName: "Sneha",
    lastName: "Patel",
    email: "pro4@example.com",
    category: PROFESSIONAL_CATEGORIES.EDITOR,
    city: "Bengaluru",
    status: PROFESSIONAL_STATUS.APPROVED,
    isVerified: true,
  },
];

function searchTerms(firstName, lastName, email) {
  return [
    firstName.toLowerCase(),
    lastName.toLowerCase(),
    `${firstName} ${lastName}`.toLowerCase(),
    email.toLowerCase(),
  ];
}

function seedFirebaseUid(email) {
  return `seed_${String(email).toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildStats() {
  const totalBookings = randomInt(3, 25);
  const completedBookings = randomInt(0, totalBookings);
  const totalReviews = randomInt(0, completedBookings);

  return {
    totalBookings,
    completedBookings,
    totalReviews,
    averageRating: totalReviews > 0 ? randomInt(35, 50) / 10 : 0,
  };
}

async function upsertUser({
  email,
  firstName,
  lastName,
  role,
  passwordHash,
  isVerified = true,
  isActive = true,
}) {
  const existing = await userRepository.findByField("email", email);
  const payload = {
    email,
    firebaseUid: seedFirebaseUid(email),
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`.trim(),
    role,
    isActive,
    isVerified,
    isDeleted: false,
    password: passwordHash,
    settings: DEFAULT_SETTINGS,
    searchTerms: searchTerms(firstName, lastName, email),
  };

  if (existing) {
    return userRepository.update(existing.id, payload);
  }
  return userRepository.create(payload);
}

async function ensureCategories() {
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    await CategoryModel.findOneAndUpdate(
      { slug: c.slug },
      {
        $set: {
          name: c.name,
          description: c.description,
          isActive: true,
          displayOrder: i,
          isDeleted: false,
        },
      },
      { upsert: true, returnDocument: "after" },
    );
  }
}

async function ensureProfessionals(usersByEmail) {
  const professionalIds = [];
  for (let index = 0; index < SAMPLE_PROFESSIONALS.length; index++) {
    const sample = SAMPLE_PROFESSIONALS[index];
    const user = usersByEmail[sample.email];
    const existing = await professionalRepository.findByUserId(user.id);
    const docId = String(index + 1).padStart(2, "0");

    const proPayload = {
      userId: user.id,
      category: sample.category,
      businessName: `${sample.lastName} ${sample.category}`.replace(
        sample.category,
        "Studio",
      ),
      bio: `${sample.category} with 5+ years of industry experience.`,
      experience: randomInt(3, 12),
      specialties: [sample.category, "events"],
      location: {
        address: "Main Street",
        city: sample.city.toLowerCase(),
        state: "state",
        country: "india",
        pincode: "400001",
        coordinates: { latitude: 19.076, longitude: 72.8777 },
      },
      serviceAreas: [sample.city.toLowerCase()],
      contact: {
        phone: "+919900000000",
        email: sample.email,
        instagram: `${sample.firstName.toLowerCase()}_studio`,
      },
      pricing: {
        hourlyRate: randomInt(1000, 5000),
        minimumHours: 2,
        currency: "INR",
      },
      documents: {
        aadharNumber: `12345678${docId}90`,
        panNumber: `QWERT12${docId}Y`,
        aadharFront: `https://example.com/documents/pro-${docId}-aadhar-front.jpg`,
        aadharBack: `https://example.com/documents/pro-${docId}-aadhar-back.jpg`,
        panCard: `https://example.com/documents/pro-${docId}-pan-card.jpg`,
        policeVerificationCertificate: `https://example.com/documents/pro-${docId}-police-verification.pdf`,
        verificationStatus: "pending",
      },
      status: sample.status,
      isVerified: sample.isVerified,
      isActive: true,
      isDeleted: false,
      stats: buildStats(),
    };

    const pro = existing
      ? await professionalRepository.update(existing.id, proPayload)
      : await professionalRepository.create(proPayload);

    professionalIds.push(pro.id);
  }
  return professionalIds;
}

async function ensureSeedBookings(clientIds, professionalIds) {
  const existingSeedBookings = await bookingRepository.count([
    { field: "clientNotes", operator: "==", value: SEED_BOOKING_MARKER },
  ]);
  if (existingSeedBookings > 0) {
    console.log("Bookings already exist, skipping booking seed.");
    return;
  }

  const statuses = [
    BOOKING_STATUS.PENDING,
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.COMPLETED,
    BOOKING_STATUS.CANCELLED,
  ];

  for (let i = 0; i < 12; i++) {
    const status = randomChoice(statuses);
    await bookingRepository.create({
      clientId: randomChoice(clientIds),
      professionalId: randomChoice(professionalIds),
      status,
      bookingDate: new Date(Date.now() + i * 86400000),
      eventType: "Wedding",
      startTime: "10:00",
      endTime: "12:00",
      duration: 120,
      pricing: {
        type: "hourly",
        baseAmount: 10000,
        hours: 2,
        totalAmount: 20000,
        currency: "INR",
        paymentStatus: randomChoice(["pending", "paid"]),
      },
      location: {
        address: "Event Venue",
        city: "mumbai",
        state: "maharashtra",
        pincode: "400001",
      },
      notes: "Seed booking",
      clientNotes: SEED_BOOKING_MARKER,
      isDeleted: false,
    });
  }
}

async function ensureSeedEnquiries(clientIds, professionalIds) {
  const existingSeedEnquiries = await enquiryRepository.count([
    { field: "statusNote", operator: "==", value: SEED_ENQUIRY_MARKER },
  ]);
  if (existingSeedEnquiries > 0) {
    console.log("Enquiries already exist, skipping enquiry seed.");
    return;
  }

  const statuses = [
    ENQUIRY_STATUS.PENDING,
    ENQUIRY_STATUS.RESPONDED,
    ENQUIRY_STATUS.CLOSED,
  ];

  for (let i = 0; i < 10; i++) {
    await enquiryRepository.create({
      clientId: randomChoice(clientIds),
      professionalId: randomChoice(professionalIds),
      eventType: "Wedding",
      eventDate: new Date(Date.now() + (i + 10) * 86400000),
      requirements: "Need candid and traditional coverage.",
      budget: {
        min: 20000,
        max: 80000,
        currency: "INR",
      },
      location: {
        address: "Client Venue",
        city: "pune",
        state: "maharashtra",
        pincode: "411001",
      },
      status: randomChoice(statuses),
      statusNote: SEED_ENQUIRY_MARKER,
      isDeleted: false,
    });
  }
}

async function seed() {
  console.log("🌱 Starting database seed...");
  try {
    const isMongoConnected = await connectDB();
    if (!isMongoConnected) {
      throw new Error(
        "MongoDB is not connected. Seed requires a working MongoDB connection.",
      );
    }

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    console.log("Seeding admin, clients, and professionals...");
    const usersByEmail = {};

    usersByEmail["admin123@gmail.com"] = await upsertUser({
      email: "admin123@gmail.com",
      firstName: "System",
      lastName: "Admin",
      role: USER_ROLES.ADMIN,
      passwordHash,
      isVerified: true,
      isActive: true,
    });

    for (const client of SAMPLE_CLIENTS) {
      usersByEmail[client.email] = await upsertUser({
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName,
        role: USER_ROLES.CLIENT,
        passwordHash,
        isVerified: true,
        isActive: true,
      });
    }

    for (const pro of SAMPLE_PROFESSIONALS) {
      usersByEmail[pro.email] = await upsertUser({
        email: pro.email,
        firstName: pro.firstName,
        lastName: pro.lastName,
        role: USER_ROLES.PROFESSIONAL,
        passwordHash,
        isVerified: pro.isVerified,
        isActive: true,
      });
    }

    console.log("Seeding categories...");
    await ensureCategories();

    console.log("Seeding professional profiles...");
    const professionalIds = await ensureProfessionals(usersByEmail);

    const clientIds = SAMPLE_CLIENTS.map((c) => usersByEmail[c.email].id);

    console.log("Seeding bookings...");
    await ensureSeedBookings(clientIds, professionalIds);

    console.log("Seeding enquiries...");
    await ensureSeedEnquiries(clientIds, professionalIds);

    console.log("Upserting system settings...");
    await settingsRepository.updateSystemSettings({
      commission: { globalRate: 15 },
      tax: { gstRate: 18, serviceTax: 0 },
      policies: { cancellationWindow: 48, rescheduleLimit: 2, refundDays: 7 },
    });

    console.log("✅ Seed completed.");
    console.log("Admin login: admin123@gmail.com / 12345678");
    console.log("Professional sample login: pro1@example.com / 12345678");
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

seed();
