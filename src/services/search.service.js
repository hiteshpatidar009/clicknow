/**
 * Search Service
 */

import { professionalRepository } from "../repositories/index.js";

class SearchService {
  async searchProfessionals(filters, options = {}) {
    const {
      query,
      category,
      specialty,
      city,
      state,
      latitude,
      longitude,
      radius,
      minRating,
      maxPrice,
      minPrice,
      sortBy,
    } = filters;

    const searchFilters = {
      category,
      specialty,
      city,
      state,
      minRating,
      maxPrice,
      minPrice,
    };

    if (latitude && longitude && radius) {
      searchFilters.location = { latitude, longitude, radius };
    }

    const result = await professionalRepository.search(searchFilters, {
      ...options,
      sortBy,
    });

    return {
      data: result.data,
      pagination: result.pagination,
      filters: this.getAppliedFilters(filters),
    };
  }

  async getAutocompleteSuggestions(query, type = "all") {
    const suggestions = [];

    if (type === "all" || type === "professionals") {
      const professionals = await professionalRepository.searchByName(query, {
        limit: 5,
      });
      suggestions.push(
        ...professionals.map((p) => ({
          type: "professional",
          id: p.id,
          name: p.businessName,
          category: p.category,
        }))
      );
    }

    return suggestions;
  }

  getAppliedFilters(filters) {
    const applied = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null) {
        applied[key] = filters[key];
      }
    });
    return applied;
  }
}

export default new SearchService();
