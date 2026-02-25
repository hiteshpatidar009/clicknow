import { CategoryModel } from "../models/index.js";
import ApiResponse from "../utils/response.util.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { cleanupSlug } from "../utils/helpers.util.js";

class CategoryController {
    // GET /api/v1/categories
    getAll = asyncHandler(async (req, res) => {
        const isAdmin = req.user && req.user.role === 'admin';
        const query = isAdmin ? { isDeleted: false } : { isActive: true, isDeleted: false };
        const categories = await CategoryModel.find(query).sort({ displayOrder: 1 });
        return ApiResponse.success(res, categories);
    });

    // POST /api/v1/categories
    create = asyncHandler(async (req, res) => {
        const { name } = req.body;
        const slug = req.body.slug || cleanupSlug(name);
        
        const existing = await CategoryModel.findOne({ slug });
        if (existing) {
            return ApiResponse.error(res, "Category with this slug already exists", 400);
        }

        const category = await CategoryModel.create({ ...req.body, slug });
        return ApiResponse.created(res, category);
    });

    // PUT /api/v1/categories/:id
    update = asyncHandler(async (req, res) => {
        const { name, slug: reqSlug } = req.body;
        
        const category = await CategoryModel.findById(req.params.id);
        if (!category) {
            return ApiResponse.notFound(res, "Category not found");
        }

        const slug = reqSlug || (name ? cleanupSlug(name) : category.slug);
        if (slug !== category.slug) {
            const existing = await CategoryModel.findOne({ slug });
            if (existing) {
                return ApiResponse.error(res, "Category with this slug already exists", 400);
            }
        }

        const updatedCategory = await CategoryModel.findByIdAndUpdate(
            req.params.id, 
            { ...req.body, slug, updatedAt: new Date() },
            { returnDocument: "after" }
        );
        return ApiResponse.success(res, updatedCategory);
    });

    // DELETE /api/v1/categories/:id
    delete = asyncHandler(async (req, res) => {
        await CategoryModel.findByIdAndUpdate(req.params.id, { isDeleted: true });
        return ApiResponse.success(res, null, "Category deleted successfully");
    });

    // GET /api/v1/categories/slug/:slug
    getBySlug = asyncHandler(async (req, res) => {
        const category = await CategoryModel.findOne({ slug: req.params.slug, isDeleted: false });
        if (!category) {
            return ApiResponse.notFound(res, "Category not found");
        }
        return ApiResponse.success(res, category);
    });
}

export default new CategoryController();
