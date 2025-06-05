const Collection = require('../models/collection');
const { logger } = require('../middlewares/logger');

class CollectionController {
    static async getCollectionWithSearch(req, res, next) {
        try {
            const { search } = req.query;
            const { collections } = await Collection.findAll({ 
                search,
                limit: 0
            });

            res.status(200).json({
                collections: collections || [],
                success: true,
            });
        } catch (error) {
            logger.error({
                status: error.status || 500,
                message: "Error in getCollectionWithSearch",
                error: error.message,
                stack: error.stack,
                query: req.query
            });
            next(error);
        }
    }

    static async getCollectionById(req, res, next) {
        try {
            const collectionId = req.params.id;
            const collection = await Collection.findById(collectionId, { populate: true });

            if (!collection) {
                logger.error({ 
                    status: 404, 
                    message: "Collection Not Found",
                    collectionId
                });
                return res.status(404).json({
                    success: false,
                    message: "Collection not found"
                });
            }

            res.status(200).json({
                success: true,
                collection
            });
        } catch (error) {
            logger.error({ 
                status: error.status || 500, 
                message: "Error getting collection", 
                error: error.message,
                stack: error.stack
            });
            next(error);
        }
    }

    static async getCollectionsByIds(req, res, next) {
        try {
            const collectionIds = req.params.ids.split(',');
            if (!collectionIds.length) {
                return res.status(400).json({
                    success: false,
                    message: "Collection IDs are required"
                });
            }

            const collections = await Collection.findByIds(collectionIds);
    
            res.status(200).json({
                success: true,
                collections: collections || []
            });
        } catch (error) {
            logger.error({
                status: error.status || 500,
                message: "Failed to get collections",
                error: error.message,
                stack: error.stack
            });
            next(error);
        }
    }

    static async createCollection(req, res, next) {
        try {
            if (!req.body?.collectionName) {
                return res.status(400).json({
                    success: false,
                    message: "Collection name is required"
                });
            }

            const collectionData = {
                ...req.body,
                creator: req.user.id
            };

            const collection = await Collection.create(collectionData);

            res.status(201).json({
                collection,
                success: true
            });
        } catch (error) {
            if (error.status === 409) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            logger.error({ 
                status: error.status || 500, 
                message: "Error creating collection", 
                error: error.message,
                stack: error.stack
            });
            next(error);
        }
    }

    static async getAllCollections(req, res, next) {
        try {
            const { collections } = await Collection.findAll({ limit: 0 });
            res.status(200).json({
                success: true,
                collections: collections || []
            });
        } catch (error) {
            logger.error({ 
                status: error.status || 500, 
                message: "Error getting collections", 
                error: error.message,
                stack: error.stack
            });
            next(error);
        }
    }

    static async getAllCollectionsPagination(req, res, next) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const result = await Collection.findAll({ 
                page: parseInt(page), 
                limit: parseInt(limit) 
            });

            res.status(200).json({
                ...result,
                success: true
            });
        } catch (error) {
            logger.error({ 
                status: error.status || 500, 
                message: "Error getting paginated collections", 
                error: error.message,
                stack: error.stack
            });
            next(error);
        }
    }

    static async getAllCollectionsFilterPagination(req, res, next) {
        try {
            const { page = 1, limit = 10, dateCreation, nom, membre, user_count } = req.query;
            const result = await Collection.findAll({ 
                page: parseInt(page), 
                limit: parseInt(limit),
                dateCreation,
                nom,
                membre,
                user_count: user_count ? parseInt(user_count) : null
            });

            const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
            const query = { ...req.query };
            
            query.page = parseInt(page) + 1;
            const nextUrl = parseInt(page) < result.pagination.totalPages ? 
                `${baseUrl}?${new URLSearchParams(query).toString()}` : null;
            
            query.page = parseInt(page) - 1;
            const previousUrl = parseInt(page) > 1 ? 
                `${baseUrl}?${new URLSearchParams(query).toString()}` : null;

            res.status(200).json({
                ...result,
                next: nextUrl,
                previous: previousUrl,
                success: true
            });
        } catch (error) {
            logger.error({ 
                status: error.status || 500, 
                message: "Error getting filtered collections", 
                error: error.message,
                stack: error.stack
            });
            next(error);
        }
    }

    static async deleteCollection(req, res, next) {
        try {
            const collectionId = req.params.id;
            const deleted = await Collection.delete(collectionId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Collection not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Collection deleted successfully"
            });
        } catch (error) {
            logger.error({ 
                status: error.status || 500, 
                message: "Error deleting collection", 
                error: error.message,
                stack: error.stack
            });
            next(error);
        }
    }

    static async updateCollection(req, res, next) {
        try {
            const collectionId = req.params.id;
            const updated = await Collection.update(collectionId, req.body);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: "Collection not found or update failed"
                });
            }

            const collection = await Collection.findById(collectionId);
            res.status(200).json({
                success: true,
                collection
            });
        } catch (error) {
            logger.error({
                status: error.status || 500,
                message: "Error updating collection",
                error: error.message,
                stack: error.stack
            });
            next(error);
        }
    }

    static async cloneCollection(req, res, next) {
        try {
            const { _id: originalId, collectionName: baseName } = req.body;
            
            if (!originalId || !baseName) {
                return res.status(400).json({
                    success: false,
                    message: "Original collection ID and base name are required"
                });
            }

            const newCollection = await Collection.clone(
                originalId, 
                baseName,
                req.user.id
            );

            res.status(201).json({
                success: true,
                collection: newCollection
            });
        } catch (error) {
            if (error.status === 409) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            logger.error({ 
                status: error.status || 500, 
                message: "Error cloning collection", 
                error: error.message,
                stack: error.stack,
                body: req.body
            });
            next(error);
        }
    }

    static async updateCollections(req, res, next) {
        try {
            const collectionIds = req.params.ids.split(',');
            const { selectedProfiles } = req.body;
            
            if (!collectionIds.length || !selectedProfiles?.length) {
                return res.status(400).json({
                    success: false,
                    message: "Collection IDs and profiles are required"
                });
            }

            await Collection.addProfilesToCollections(collectionIds, selectedProfiles);

            res.status(200).json({
                success: true,
                message: "Collections updated successfully"
            });
        } catch (error) {
            logger.error({ 
                status: error.status || 500, 
                message: "Error updating collections", 
                error: error.message,
                stack: error.stack
            });
            next(error);
        }
    }
}

module.exports = CollectionController;