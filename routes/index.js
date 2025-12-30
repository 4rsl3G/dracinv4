const express = require('express');
const router = express.Router();
const controller = require('../controllers/netshort.controller.js');

router.get('/', controller.home);
router.get('/browse', controller.browse);
router.get('/watch/:id', controller.player);

// Internal APIs for Client Interactions
router.get('/api/browse', controller.apiBrowse);
router.get('/api/search', controller.apiSearch);

module.exports = router;
