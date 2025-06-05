const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collections.controller');
const { authenticate } = require('../config/jwt.config');
const isAdmin = require('../middlewares/isAdmin');

// Public routes (authenticated but not necessarily admin)
router.get('/collection/getAllCollections', authenticate, collectionController.getAllCollections);
router.get('/collection/getCollectionById/:id', authenticate, collectionController.getCollectionById);
router.get('/collection/getCollectionsByIds/:ids', authenticate, collectionController.getCollectionsByIds);
router.get('/collection/getCollectionWithSearch', authenticate, collectionController.getCollectionWithSearch);
router.get('/collection/getAllCollectionsFilterPagination', authenticate, collectionController.getAllCollectionsFilterPagination);

// Admin protected routes
router.post('/collection/createCollection', authenticate, isAdmin, collectionController.createCollection);
router.post('/collection/cloneCollection', authenticate, isAdmin, collectionController.cloneCollection);
router.put('/collection/updateCollection/:id', authenticate, isAdmin, collectionController.updateCollection);
router.put('/collection/updateCollections/:ids', authenticate, isAdmin, collectionController.updateCollections);
router.delete('/collection/deleteCollection/:id', authenticate, isAdmin, collectionController.deleteCollection);

module.exports = router;