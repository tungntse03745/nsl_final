/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
  *                                                                          *
  ***************************************************************************/

  '*': true,
  'HomeController': {
    'registerTeacher': 'sessionTeacher',
    'loginTeacher': 'sessionTeacher',

    'newCourse': 'sessionTeacherLogin',
    'editCourse': 'sessionTeacherLogin',
    'repository': 'sessionTeacherLogin',
    'waitingCourse': 'sessionTeacherLogin',
    'saveCourse':'sessionTeacherLogin',//
    'withdraw': 'sessionTeacherLogin',

    


    'cart': 'sessionStudentLogin',
    'purchase': 'sessionStudentLogin',
    'paymentHistory': 'sessionStudentLogin',
    'mycourse': 'sessionStudentLogin',
    'courseDetail': 'sessionStudentLogin',
    'changePassword': 'sessionStudentLogin',



    'loginAdmin': 'sessionAdmin',
    'admin': 'sessionAdminLogin',

    
    'approveTeacher': 'sessionAdminLogin',
    'approveCourse': 'sessionAdminLogin',
    'category': 'sessionAdminLogin',
    'level': 'sessionAdminLogin',
    'activeCourse': 'sessionAdminLogin',
    'adminTransaction': 'sessionAdminLogin',

  },
  'CategoryController': {
    'countCourse': 'admin',
    'addCategory': 'admin',
    'editCategory': 'admin',
    'remove': 'admin',
  },
  'LevelController': {
    'countCourse': 'admin',
    'addLevel': 'admin',
    'editLevel': 'admin',
    'remove': 'admin',
  }
  /***************************************************************************
  *                                                                          *
  * Here's an example of mapping some policies to run before a controller    *
  * and its actions                                                          *
  *                                                                          *
  ***************************************************************************/
	// RabbitController: {

		// Apply the `false` policy as the default for all of RabbitController's actions
		// (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
		// '*': false,

		// For the action `nurture`, apply the 'isRabbitMother' policy
		// (this overrides `false` above)
		// nurture	: 'isRabbitMother',

		// Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
		// before letting any users feed our rabbits
		// feed : ['isNiceToAnimals', 'hasRabbitFood']
	// }
};
