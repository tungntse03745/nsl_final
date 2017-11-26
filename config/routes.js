/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  // guest

  'GET /': 'HomeController.index',

  'GET /course/view/:id': 'HomeController.course',

  'GET /user/view/:id': 'HomeController.viewProfile',
  
  'GET /cart': 'HomeController.cart',

  'GET /purchase': 'HomeController.purchase',

  'GET /profile': 'HomeController.profile',

  'GET /mycourse': 'HomeController.mycourse',

  'GET /course-detail/:id': 'HomeController.courseDetail',

  'GET /payment-history': 'HomeController.paymentHistory',



  // student


  'POST /add-to-cart': 'CourseController.addToCard',

  'POST /list-cart': 'CourseController.listCart',

  'POST /destroy-item-cart': 'CourseController.destroyItemCart',

  'POST /payment': 'OrderCourseController.payment',

  'POST /get-course-paid': 'CourseController.getCoursePaid',

  'POST /update-last-trace': 'CourseController.updateLastTrace',




  ///////////////////////////////////////////////////////////////////

  // AUTHENTICATION
  '/logout': 'AuthController.logout',
  
  '/login/facebook':'AuthController.facebook',

  '/login/facebook/callback':'AuthController.facebook',

  '/login/google':'AuthController.google',

  '/login/google/callback':'AuthController.google',

  'POST /student/login/local': 'AuthController.studentLocal',

  'POST /teacher/login/local': 'AuthController.teacherLocal',

  'POST /admin/login/local': 'AuthController.adminLocal',


  'POST /student/register': 'StudentController.registerStudent',

  '/student/verify':'StudentController.verifyStudent',

  'POST /student/myprofile': 'StudentController.myprofile',

  'POST /student/edit': 'StudentController.edit',

///////23/11 changePassword
  'GET /changePassword':'HomeController.changePassword',
  'POST /changePassword':'StudentController.changePassword',
 
  'GET /changePasswordTeacher':'HomeController.changePasswordTeacher',
  'POST /changePasswordTeacher':'TeacherController.changePasswordTeacher',

////////////////////////////////////////////////////////
  'GET /teacher/register': 'HomeController.registerTeacher',

  'GET /teacher/login': 'HomeController.loginTeacher',

  'POST /teacher/register': 'TeacherController.registerTeacher',

  '/teacher/verify':'TeacherController.verifyTeacher',

  // 'POST /teacher/myprofile': 'TeacherController.myprofile',

  // 'POST /teacher/edit': 'TeacherController.edit',

  'POST /course/get-details': 'CourseController.getDetails',

  'POST /course/update': 'CourseController.update',

  'POST /course/delete': 'CourseController.delete',

  'POST /course/re-active': 'CourseController.reActive',

  'POST /teacher/submit-approve-teacher': 'TeacherController.submitApproveTeacher',


  'GET /withdraw': 'HomeController.withdraw',

  'POST /withdraw': 'TransactionController.withdraw',


  'GET /new-course': 'HomeController.newCourse',

  'GET /repository': 'HomeController.repository',

  'GET /repository/waiting': 'HomeController.waitingCourse',

  'GET /repository/save': 'HomeController.saveCourse',
  'GET /repository/reject': 'HomeController.rejectCourse',

  'GET /repository/edit/:id': 'HomeController.editCourse',

  'POST /teacher/new-course': 'CourseController.newCourse',

  'POST /teacher/save-course': 'CourseController.saveCourse',

/////////////////////////////////////////////////////
  'POST /user/myprofile': 'HomeController.myprofile',

  'POST /user/edit': 'HomeController.editProfile',

//////////////////////////////////////////////////////////
  'GET /admin/login': 'HomeController.loginAdmin',

  'GET /admin': 'HomeController.admin',


  'GET /admin/approve-teacher': 'HomeController.approveTeacher',

  'GET /admin/approve-course': 'HomeController.approveCourse',

  'GET /admin/category': 'HomeController.category',

  'GET /admin/level': 'HomeController.level',

  'GET /admin/active-course': 'HomeController.activeCourse',

  'GET /admin/transaction': 'HomeController.adminTransaction',

  'POST /admin/list-active-order': 'AdminController.listActiveOrder',

  'POST /admin/change-status-order': 'AdminController.changeStatusOrder',


  'POST /admin/list-teacher': 'AdminController.listTeacher',
  'POST /admin/update-acount-to-teacher-role':'AdminController.updateAcountToTeacherRole',
  'POST /admin/reject-acount-to-teacher-role':'AdminController.rejectAcountToTeacherRole',
// hide

  'POST /list-simple-category':'CategoryController.listSimpleCategory',

  'POST /add-category':'CategoryController.addCategory',

  'POST /edit-category':'CategoryController.editCategory',

  'POST /category-count-course':'CategoryController.countCourse',

  'POST /remove-category':'CategoryController.remove',



  'POST /list-simple-level':'LevelController.listSimpleLevel',

  'POST /add-level':'LevelController.addLevel',

  'POST /edit-level':'LevelController.editLevel',

  'POST /level-count-course':'LevelController.countCourse',

  'POST /remove-level':'LevelController.remove',



  'POST /admin/list-course': 'CourseController.listCourse',

  'POST /admin/active-course': 'CourseController.activeCourse',

  'POST /admin/reject-course': 'CourseController.rejectCourse',


  'POST /admin/list-transaction': 'AdminController.listTransaction',

  'POST /admin/change-status-transaction': 'AdminController.changeStatusTransaction',
  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
