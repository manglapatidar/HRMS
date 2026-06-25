const express = require('express');
const router = express.Router();
const { 
  getEmployees, 
  getOrgStructure, 
  addEmployee, 
  getMyProfile, 
  uploadAvatar, 
  getManagers, 
  getOrgChart, 
  bulkAddEmployees, 
  initiateExit, 
  updateEmployee, 
  getTeamDirectory, 
  updateDelegation,
  // Org CRUD controllers
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation
} = require('../controllers/orgController');
const { protect } = require('../middleware/authMiddleware');
const { tenantMiddleware } = require('../middleware/tenantMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);
router.use(tenantMiddleware);

// Org Structure Lookup (Read-only)
router.route('/structure').get(getOrgStructure);
router.route('/managers').get(getManagers);
router.route('/chart').get(getOrgChart);
router.route('/team/directory').get(getTeamDirectory);

// Department CRUD Routes
router.route('/departments')
  .get(getDepartments)
  .post(authorize('HR Admin'), createDepartment);
router.route('/departments/:id')
  .patch(authorize('HR Admin'), updateDepartment)
  .delete(authorize('HR Admin'), deleteDepartment);

// Designation CRUD Routes
router.route('/designations')
  .get(getDesignations)
  .post(authorize('HR Admin'), createDesignation);
router.route('/designations/:id')
  .patch(authorize('HR Admin'), updateDesignation)
  .delete(authorize('HR Admin'), deleteDesignation);

// Location CRUD Routes
router.route('/locations')
  .get(getLocations)
  .post(authorize('HR Admin'), createLocation);
router.route('/locations/:id')
  .patch(authorize('HR Admin'), updateLocation)
  .delete(authorize('HR Admin'), deleteLocation);

// Employee Administration
router.route('/employees/bulk').post(bulkAddEmployees);
router.route('/employees/me').get(getMyProfile);
router.route('/employees/me/avatar').post(upload.single('avatar'), uploadAvatar);
router.route('/employees/me/delegate').put(updateDelegation);
router.route('/employees').get(getEmployees).post(addEmployee);
router.route('/employees/:id').put(updateEmployee);
router.route('/employees/:id/exit').patch(initiateExit);

module.exports = router;
