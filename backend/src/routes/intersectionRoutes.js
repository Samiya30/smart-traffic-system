const express = require('express');
const router = express.Router();
const intersectionController = require('../controllers/intersectionController');

router.get('/', intersectionController.getAllIntersections);
router.get('/:id', intersectionController.getIntersectionById);
router.post('/', intersectionController.addIntersection);

module.exports = router;
