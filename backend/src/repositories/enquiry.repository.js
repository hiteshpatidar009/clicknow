/**
 * Enquiry Repository
 */

import BaseRepository from "./base.repository.js";
import { COLLECTIONS } from "../utils/constants.util.js";

class EnquiryRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.ENQUIRIES);
  }

  async findByClientId(clientId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [{ field: "clientId", operator: "==", value: clientId }],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  async findByProfessionalId(professionalId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  async findPendingByProfessional(professionalId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "status", operator: "==", value: "pending" },
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  async getStatistics() {
    const [total, pending, responded, converted] = await Promise.all([
      this.count([]),
      this.count([{ field: "status", operator: "==", value: "pending" }]),
      this.count([{ field: "status", operator: "==", value: "responded" }]),
      this.count([{ field: "status", operator: "==", value: "converted" }]),
    ]);

    return { total, pending, responded, converted };
  }
}

export default new EnquiryRepository();
