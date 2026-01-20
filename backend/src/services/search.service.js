/**
 * Search Service
 * Indexed search with filters for professionals
 */

import { professionalRepository } from "../repositories/index.js";
import { ProfessionalModel } from "../models/index.js";
import Logger from "../utils/logger.util.js";
import { calculateDistance } from "../utils/helpers.util.js";

class SearchService {
  /**
   * Search professionals with filters
   */
  async searchProfessionals(searchParams, options = {}) {
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
      availability,
      sortBy,
    } = searchParams;

    const { page = 1, pageSize = 20 } = options;

    // Build filters
    const filters = {
      category,
      city,
      minRating,
      maxPrice,
      minPrice,
    };

    // Get filtered results from repository
    let result = await professionalRepository.search(filters, {
      page,
      pageSize: radius ? 100 : pageSize, // Get more results if filtering by location
      orderBy: this.getSortField(sortBy),
      orderDirection: this.getSortDirection(sortBy),
    });

    let professionals = result.data;

    // Apply specialty filter (array-contains handled separately due to Firestore limitations)
    if (specialty) {
      professionals = professionals.filter((p) =>
        p.specialties?.includes(specialty),
      );
    }

    // Apply location-based filtering
    if (latitude && longitude && radius) {
      professionals = this.filterByLocation(
        professionals,
        latitude,
        longitude,
        radius,
      );
    }

    // Apply text search on multiple fields
    if (query) {
      professionals = this.textSearch(professionals, query);
    }

    // Sort results
    professionals = this.sortResults(professionals, sortBy, {
      latitude,
      longitude,
    });

    // Paginate if we over-fetched for location filtering
    const startIndex = (page - 1) * pageSize;
    const paginatedResults = professionals.slice(
      startIndex,
      startIndex + pageSize,
    );

    // Transform to public profiles
    const data = paginatedResults.map((p) =>
      ProfessionalModel.fromDocument(p).toPublicProfile(),
    );

    return {
      data,
      pagination: {
        page,
        pageSize,
        totalCount: professionals.length,
        totalPages: Math.ceil(professionals.length / pageSize),
        hasMore: startIndex + pageSize < professionals.length,
      },
      filters: {
        category,
        specialty,
        city,
        minRating,
        maxPrice,
        radius,
      },
    };
  }

  /**
   * Text search across multiple fields
   */
  textSearch(professionals, query) {
    const searchTerms = query.toLowerCase().split(/\s+/);

    return professionals.filter((professional) => {
      const searchableText = [
        professional.businessName,
        professional.bio,
        ...(professional.specialties || []),
        professional.location?.city,
        professional.location?.state,
      ]
        .join(" ")
        .toLowerCase();

      return searchTerms.every((term) => searchableText.includes(term));
    });
  }

  /**
   * Filter professionals by location radius
   */
  filterByLocation(professionals, lat, lng, radiusKm) {
    return professionals
      .map((professional) => {
        const profLat = professional.location?.coordinates?.latitude;
        const profLng = professional.location?.coordinates?.longitude;

        if (!profLat || !profLng) {
          return { ...professional, distance: null };
        }

        const distance = calculateDistance(lat, lng, profLat, profLng);
        return { ...professional, distance };
      })
      .filter((p) => p.distance === null || p.distance <= radiusKm);
  }

  /**
   * Sort results based on criteria
   */
  sortResults(professionals, sortBy, locationParams = {}) {
    const { latitude, longitude } = locationParams;

    switch (sortBy) {
      case "rating_desc":
        return professionals.sort(
          (a, b) =>
            (b.stats?.averageRating || 0) - (a.stats?.averageRating || 0),
        );

      case "rating_asc":
        return professionals.sort(
          (a, b) =>
            (a.stats?.averageRating || 0) - (b.stats?.averageRating || 0),
        );

      case "price_desc":
        return professionals.sort(
          (a, b) => (b.pricing?.hourlyRate || 0) - (a.pricing?.hourlyRate || 0),
        );

      case "price_asc":
        return professionals.sort(
          (a, b) => (a.pricing?.hourlyRate || 0) - (b.pricing?.hourlyRate || 0),
        );

      case "distance":
        if (latitude && longitude) {
          return professionals.sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          });
        }
        return professionals;

      case "popular":
        return professionals.sort(
          (a, b) =>
            (b.stats?.totalBookings || 0) - (a.stats?.totalBookings || 0),
        );

      case "newest":
        return professionals.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

      default:
        // Default: combination of rating and bookings
        return professionals.sort((a, b) => {
          const scoreA =
            (a.stats?.averageRating || 0) * 0.7 +
            Math.min((a.stats?.totalBookings || 0) / 10, 3) * 0.3;
          const scoreB =
            (b.stats?.averageRating || 0) * 0.7 +
            Math.min((b.stats?.totalBookings || 0) / 10, 3) * 0.3;
          return scoreB - scoreA;
        });
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async getAutocompleteSuggestions(query, type = "all") {
    const suggestions = {
      professionals: [],
      specialties: [],
      locations: [],
    };

    const searchTerm = query.toLowerCase();

    if (type === "all" || type === "professionals") {
      const professionals = await professionalRepository.findAll({
        where: [
          { field: "status", operator: "==", value: "approved" },
          { field: "isActive", operator: "==", value: true },
        ],
        limit: 50,
      });

      suggestions.professionals = professionals
        .filter((p) => p.businessName?.toLowerCase().includes(searchTerm))
        .slice(0, 5)
        .map((p) => ({
          id: p.id,
          name: p.businessName,
          category: p.category,
          city: p.location?.city,
        }));
    }

    if (type === "all" || type === "specialties") {
      // Predefined specialties
      const allSpecialties = [
        "wedding",
        "portrait",
        "corporate",
        "birthday",
        "engagement",
        "maternity",
        "newborn",
        "family",
        "product",
        "fashion",
        "real_estate",
        "food",
        "concert",
        "party",
      ];

      suggestions.specialties = allSpecialties
        .filter((s) => s.includes(searchTerm))
        .slice(0, 5);
    }

    if (type === "all" || type === "locations") {
      const professionals = await professionalRepository.findAll({
        where: [
          { field: "status", operator: "==", value: "approved" },
          { field: "isActive", operator: "==", value: true },
        ],
        limit: 100,
      });

      const cities = [
        ...new Set(
          professionals
            .map((p) => p.location?.city)
            .filter(Boolean)
            .filter((city) => city.toLowerCase().includes(searchTerm)),
        ),
      ].slice(0, 5);

      suggestions.locations = cities.map((city) => ({ city }));
    }

    return suggestions;
  }

  /**
   * Get sort field
   */
  getSortField(sortBy) {
    const sortFields = {
      rating_desc: "stats.averageRating",
      rating_asc: "stats.averageRating",
      price_desc: "pricing.hourlyRate",
      price_asc: "pricing.hourlyRate",
      newest: "createdAt",
      popular: "stats.totalBookings",
    };
    return sortFields[sortBy] || "stats.averageRating";
  }

  /**
   * Get sort direction
   */
  getSortDirection(sortBy) {
    return sortBy?.includes("asc") ? "asc" : "desc";
  }
}

export default new SearchService();
