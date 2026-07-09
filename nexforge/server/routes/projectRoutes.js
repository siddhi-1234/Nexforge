const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.put('/:id/sprint', projectController.updateProjectSprint);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
