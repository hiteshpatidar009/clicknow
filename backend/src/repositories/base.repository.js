/**
 * Base Repository
 * Abstract base class for all repositories implementing common CRUD operations
 */

import firebaseDatabase from "../database/firebase.database.js";
import Logger from "../utils/logger.util.js";
import { v4 as uuidv4 } from "uuid";

class BaseRepository {
  /**
   * @param {string} collectionName - Firestore collection name
   */
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.db = firebaseDatabase;
  }

  /**
   * Get collection reference
   */
  get collection() {
    return this.db.collection(this.collectionName);
  }

  /**
   * Generate a new unique ID
   */
  generateId() {
    return uuidv4();
  }

  /**
   * Create a new document
   * @param {Object} data - Document data
   * @param {string} [id] - Optional document ID
   * @returns {Promise<Object>} Created document with ID
   */
  async create(data, id = null) {
    try {
      const docId = id || this.generateId();
      const timestamp = this.db.timestamp();

      const documentData = {
        ...data,
        id: docId,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await this.collection.doc(docId).set(documentData);

      Logger.debug(`Document created in ${this.collectionName}:`, docId);

      return { id: docId, ...documentData };
    } catch (error) {
      Logger.error(`Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Find document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Object|null>} Document data or null
   */
  async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() };
    } catch (error) {
      Logger.error(
        `Error finding document by ID in ${this.collectionName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Find single document by field
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @returns {Promise<Object|null>} Document data or null
   */
  async findByField(field, value) {
    try {
      const snapshot = await this.collection
        .where(field, "==", value)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      Logger.error(
        `Error finding document by field in ${this.collectionName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Find all documents matching criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of documents
   */
  async findAll(options = {}) {
    try {
      const {
        where = [],
        orderBy = null,
        orderDirection = "asc",
        limit = null,
        startAfter = null,
      } = options;

      let query = this.collection;

      // Apply where clauses
      for (const condition of where) {
        const { field, operator, value } = condition;
        query = query.where(field, operator, value);
      }

      // Apply ordering
      if (orderBy) {
        query = query.orderBy(orderBy, orderDirection);
      }

      // Apply pagination cursor
      if (startAfter) {
        const startDoc = await this.collection.doc(startAfter).get();
        if (startDoc.exists) {
          query = query.startAfter(startDoc);
        }
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      Logger.error(
        `Error finding all documents in ${this.collectionName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Find documents with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated results
   */
  async findPaginated(options = {}) {
    try {
      const {
        where = [],
        orderBy = "createdAt",
        orderDirection = "desc",
        page = 1,
        pageSize = 20,
        cursor = null,
      } = options;

      let query = this.collection;

      // Apply where clauses
      for (const condition of where) {
        const { field, operator, value } = condition;
        query = query.where(field, operator, value);
      }

      // Apply ordering
      query = query.orderBy(orderBy, orderDirection);

      // Get total count (for non-cursor pagination)
      const countQuery = this.collection;
      let totalCount = 0;

      if (!cursor) {
        let countRef = countQuery;
        for (const condition of where) {
          const { field, operator, value } = condition;
          countRef = countRef.where(field, operator, value);
        }
        const countSnapshot = await countRef.count().get();
        totalCount = countSnapshot.data().count;
      }

      // Apply cursor or offset
      if (cursor) {
        const cursorDoc = await this.collection.doc(cursor).get();
        if (cursorDoc.exists) {
          query = query.startAfter(cursorDoc);
        }
      } else if (page > 1) {
        const offset = (page - 1) * pageSize;
        query = query.offset(offset);
      }

      // Apply limit
      query = query.limit(pageSize);

      const snapshot = await query.get();

      const documents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const nextCursor = lastDoc ? lastDoc.id : null;
      const hasMore = documents.length === pageSize;

      return {
        data: documents,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: totalCount ? Math.ceil(totalCount / pageSize) : null,
          hasMore,
          nextCursor,
        },
      };
    } catch (error) {
      Logger.error(
        `Error finding paginated documents in ${this.collectionName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Update document by ID
   * @param {string} id - Document ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated document
   */
  async update(id, data) {
    try {
      const updateData = {
        ...data,
        updatedAt: this.db.timestamp(),
      };

      // Remove undefined fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await this.collection.doc(id).update(updateData);

      Logger.debug(`Document updated in ${this.collectionName}:`, id);

      return this.findById(id);
    } catch (error) {
      Logger.error(`Error updating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete document by ID
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      await this.collection.doc(id).delete();

      Logger.debug(`Document deleted in ${this.collectionName}:`, id);

      return true;
    } catch (error) {
      Logger.error(`Error deleting document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Object>} Updated document
   */
  async softDelete(id) {
    return this.update(id, {
      isDeleted: true,
      deletedAt: this.db.timestamp(),
    });
  }

  /**
   * Check if document exists
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} Existence status
   */
  async exists(id) {
    try {
      const doc = await this.collection.doc(id).get();
      return doc.exists;
    } catch (error) {
      Logger.error(
        `Error checking document existence in ${this.collectionName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Count documents matching criteria
   * @param {Array} where - Where clauses
   * @returns {Promise<number>} Document count
   */
  async count(where = []) {
    try {
      let query = this.collection;

      for (const condition of where) {
        const { field, operator, value } = condition;
        query = query.where(field, operator, value);
      }

      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error) {
      Logger.error(
        `Error counting documents in ${this.collectionName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Batch create documents
   * @param {Array} documents - Array of document data
   * @returns {Promise<Array>} Created documents
   */
  async batchCreate(documents) {
    try {
      const batch = this.db.batch();
      const timestamp = this.db.timestamp();
      const results = [];

      for (const data of documents) {
        const docId = data.id || this.generateId();
        const docRef = this.collection.doc(docId);

        const documentData = {
          ...data,
          id: docId,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        batch.set(docRef, documentData);
        results.push({ id: docId, ...documentData });
      }

      await batch.commit();

      Logger.debug(
        `Batch created ${documents.length} documents in ${this.collectionName}`,
      );

      return results;
    } catch (error) {
      Logger.error(
        `Error batch creating documents in ${this.collectionName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Batch update documents
   * @param {Array} updates - Array of { id, data } objects
   * @returns {Promise<boolean>} Success status
   */
  async batchUpdate(updates) {
    try {
      const batch = this.db.batch();
      const timestamp = this.db.timestamp();

      for (const { id, data } of updates) {
        const docRef = this.collection.doc(id);
        batch.update(docRef, { ...data, updatedAt: timestamp });
      }

      await batch.commit();

      Logger.debug(
        `Batch updated ${updates.length} documents in ${this.collectionName}`,
      );

      return true;
    } catch (error) {
      Logger.error(
        `Error batch updating documents in ${this.collectionName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Batch delete documents
   * @param {Array} ids - Array of document IDs
   * @returns {Promise<boolean>} Success status
   */
  async batchDelete(ids) {
    try {
      const batch = this.db.batch();

      for (const id of ids) {
        const docRef = this.collection.doc(id);
        batch.delete(docRef);
      }

      await batch.commit();

      Logger.debug(
        `Batch deleted ${ids.length} documents in ${this.collectionName}`,
      );

      return true;
    } catch (error) {
      Logger.error(
        `Error batch deleting documents in ${this.collectionName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Increment a numeric field
   * @param {string} id - Document ID
   * @param {string} field - Field name
   * @param {number} amount - Increment amount
   * @returns {Promise<Object>} Updated document
   */
  async incrementField(id, field, amount = 1) {
    try {
      await this.collection.doc(id).update({
        [field]: this.db.increment(amount),
        updatedAt: this.db.timestamp(),
      });

      return this.findById(id);
    } catch (error) {
      Logger.error(
        `Error incrementing field in ${this.collectionName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Add element to array field
   * @param {string} id - Document ID
   * @param {string} field - Field name
   * @param {any} element - Element to add
   * @returns {Promise<Object>} Updated document
   */
  async addToArray(id, field, element) {
    try {
      await this.collection.doc(id).update({
        [field]: this.db.arrayUnion(element),
        updatedAt: this.db.timestamp(),
      });

      return this.findById(id);
    } catch (error) {
      Logger.error(`Error adding to array in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Remove element from array field
   * @param {string} id - Document ID
   * @param {string} field - Field name
   * @param {any} element - Element to remove
   * @returns {Promise<Object>} Updated document
   */
  async removeFromArray(id, field, element) {
    try {
      await this.collection.doc(id).update({
        [field]: this.db.arrayRemove(element),
        updatedAt: this.db.timestamp(),
      });

      return this.findById(id);
    } catch (error) {
      Logger.error(
        `Error removing from array in ${this.collectionName}:`,
        error,
      );
      throw error;
    }
  }
}

export default BaseRepository;
