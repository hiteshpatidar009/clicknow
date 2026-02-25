
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env
dotenv.config({ path: join(__dirname, '.env') });

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

const PROFESSIONAL_CATEGORIES = {
  PHOTOGRAPHER: "photographer",
  VIDEOGRAPHER: "videographer",
  EDITOR: "editor",
  MAKEUP_ARTIST: "makeup_artist",
};


async function seedData() {
  console.log("🌱 Starting Database Seed...");

  // 1. Create Users (Professionals)
  const professionalUsers = [];
  const professionalProfiles = [];
  
  const profNames = [
    { first: "Rahul", last: "Sharma", category: "photographer", business: "Rahul Clicks" },
    { first: "Priya", last: "Verma", category: "makeup_artist", business: "Glam by Priya" },
    { first: "Amit", last: "Singh", category: "videographer", business: "Cinematic Vibes" },
    { first: "Sneha", last: "Patel", category: "photographer", business: "Sneha Lens" },
    { first: "Vikram", last: "Rao", category: "editor", business: "Vikram Edits" },
  ];

  const defaultPassword = await bcrypt.hash("12345678", 12);
  const now = new Date();

  for (const prof of profNames) {
    const userId = uuidv4();
    const profId = uuidv4();
    
    // User Doc
    const userDoc = {
        id: userId,
        email: `${prof.first.toLowerCase()}.${prof.last.toLowerCase()}@example.com`,
        password: defaultPassword,
        firstName: prof.first,
        lastName: prof.last,
        displayName: `${prof.first} ${prof.last}`,
        role: "professional",
        isActive: true,
        isVerified: true,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
    };
    professionalUsers.push(userDoc);

    // Professional Doc
    const profDoc = {
        id: profId,
        userId: userId,
        category: prof.category,
        businessName: prof.business,
        bio: `Professional ${prof.category} with 5+ years of experience.`,
        experience: 5,
        specialties: ["Wedding", "Portrait", "Events"],
        pricing: { hourlyRate: 1500, packages: [], currency: "INR" },
        location: { city: "Mumbai", state: "Maharashtra", country: "India" },
        status: ["Rahul", "Priya"].includes(prof.first) ? "approved" : "pending",
        isActive: true,
        isVerified: ["Rahul", "Priya"].includes(prof.first),
        stats: {
            totalBookings: Math.floor(Math.random() * 50),
            completedBookings: Math.floor(Math.random() * 40),
            totalReviews: Math.floor(Math.random() * 30),
            averageRating: (Math.random() * 2 + 3).toFixed(1)
        },
        createdAt: now,
        updatedAt: now,
    };
    professionalProfiles.push(profDoc);
  }

  // 2. Create Users (Clients)
  const clientUsers = [];
  const clientNames = [
      { first: "Arjun", last: "Mehta" },
      { first: "Meera", last: "Nair" },
      { first: "Rohit", last: "Gupta" },
      { first: "Kavya", last: "Krishnan" },
      { first: "Siddharth", last: "Rao" }
  ];

  for (const client of clientNames) {
      const userId = uuidv4();
      clientUsers.push({
        id: userId,
        email: `${client.first.toLowerCase()}@example.com`,
        password: defaultPassword,
        firstName: client.first,
        lastName: client.last,
        displayName: `${client.first} ${client.last}`,
        role: "client",
        isActive: true,
        isVerified: true,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      });
  }

  // 3. Create Bookings
  const bookings = [];
  // Create 2 bookings for first client
  bookings.push({
      id: "BK001",
      clientId: clientUsers[0].id,
      professionalId: professionalProfiles[0].id, // Rahul
      bookingDate: new Date("2024-03-15").toISOString(),
      status: "confirmed",
      pricing: { totalAmount: 45000, currency: "INR" },
      eventType: "Wedding",
      createdAt: now,
      updatedAt: now
  });
  bookings.push({
    id: "BK002",
    clientId: clientUsers[1].id,
    professionalId: professionalProfiles[1].id, // Priya
    bookingDate: new Date("2024-03-20").toISOString(),
    status: "pending",
    pricing: { totalAmount: 15000, currency: "INR" },
    eventType: "Party",
    createdAt: now,
    updatedAt: now
 });
 bookings.push({
    id: "BK003",
    clientId: clientUsers[2].id,
    professionalId: professionalProfiles[0].id, // Rahul
    bookingDate: new Date("2024-03-25").toISOString(),
    status: "completed",
    pricing: { totalAmount: 85000, currency: "INR" },
    eventType: "Corporate",
    createdAt: now,
    updatedAt: now
 });


  // --- BATCH WRITES ---
  
  // Write Users
  const userBatch = db.batch();
  [...professionalUsers, ...clientUsers].forEach(user => {
      const ref = db.collection('users').doc(user.id);
      userBatch.set(ref, user);
  });
  await userBatch.commit();
  console.log(`✅ Created ${professionalUsers.length + clientUsers.length} Users`);

  // Write Professionals
  const profBatch = db.batch();
  professionalProfiles.forEach(prof => {
      const ref = db.collection('professionals').doc(prof.id);
      profBatch.set(ref, prof);
  });
  await profBatch.commit();
  console.log(`✅ Created ${professionalProfiles.length} Professional Profiles`);

  // Write Bookings
  const bookingBatch = db.batch();
  bookings.forEach(booking => {
      const ref = db.collection('bookings').doc(booking.id);
      bookingBatch.set(ref, booking);
  });
  await bookingBatch.commit();
  console.log(`✅ Created ${bookings.length} Bookings`);

  console.log("🎉 Seeding Completed Successfully!");
}

seedData().catch(console.error);
