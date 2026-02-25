import mongoose from 'mongoose';

const FIREBASE_UID_INDEX_NAME = "firebaseUid_1";
const FIREBASE_UID_INDEX_SPEC = { firebaseUid: 1 };
const FIREBASE_UID_PARTIAL_FILTER = {
  firebaseUid: { $exists: true, $type: "string" },
};

function isExpectedFirebaseUidIndex(index) {
  if (!index || index.name !== FIREBASE_UID_INDEX_NAME) return false;

  const keyMatches = JSON.stringify(index.key) === JSON.stringify(FIREBASE_UID_INDEX_SPEC);
  const partialMatches =
    JSON.stringify(index.partialFilterExpression || {}) ===
    JSON.stringify(FIREBASE_UID_PARTIAL_FILTER);

  return index.unique === true && keyMatches && partialMatches;
}

async function ensureFirebaseUidIndex() {
  const usersCollection = mongoose.connection.collection("users");
  const indexes = await usersCollection.indexes();
  const firebaseUidIndex = indexes.find((idx) => idx.name === FIREBASE_UID_INDEX_NAME);

  if (firebaseUidIndex && !isExpectedFirebaseUidIndex(firebaseUidIndex)) {
    await usersCollection.dropIndex(FIREBASE_UID_INDEX_NAME);
    console.log("Dropped legacy users.firebaseUid_1 index");
  }

  const refreshedIndexes = await usersCollection.indexes();
  const hasExpectedIndex = refreshedIndexes.some(isExpectedFirebaseUidIndex);

  if (!hasExpectedIndex) {
    await usersCollection.updateMany(
      { firebaseUid: "" },
      { $unset: { firebaseUid: "" } },
    );
    await usersCollection.createIndex(FIREBASE_UID_INDEX_SPEC, {
      name: FIREBASE_UID_INDEX_NAME,
      unique: true,
      partialFilterExpression: FIREBASE_UID_PARTIAL_FILTER,
    });
    console.log("Created partial unique users.firebaseUid_1 index");
  }
}

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      maxPoolSize: 5,
    });
    await ensureFirebaseUidIndex();

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    const isVercel = String(process.env.VERCEL || "").toLowerCase() === "true";
    const allowWithoutMongo = (
      process.env.ALLOW_START_WITHOUT_MONGO || (isVercel ? "true" : "false")
    )
      .toLowerCase()
      .trim() === "true";

    if (allowWithoutMongo) {
      console.warn(`MongoDB connection skipped: ${error.message}`);
      return false;
    }

    console.error(`MongoDB connection failed: ${error.message}`);
    // Do not exit the process in serverless/runtime-managed environments.
    // Let caller decide whether to fail startup or continue.
    throw error;
  }
};

export default connectDB;
