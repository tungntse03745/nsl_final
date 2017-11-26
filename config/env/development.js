/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/
   verify:{
   		student_link:'http://localhost:1337/student/verify',
   		teacher_link:'http://localhost:1337/teacher/verify',
   },
passport:{
      facebook:{
        clientID: "405743453161375", 
      clientSecret: "0b806b00aeb0e6b3eb1ffc90d6c53b64", 
      callbackURL: "http://localhost:1337/login/facebook/callback/mycourse",
      profileFields: ['id','name', 'picture.width(320).height(320)']
      },
      google:{
        clientID: '911920726359-2bof5sjse38sutlokjbb2kke56ddp1en.apps.googleusercontent.com',
        clientSecret: '1UU1f9ndxDupuwWA3q2HIV_R',
        callbackURL: "http://localhost:1337/login/google/callback",
      profileFields: ['id','email','name','displayName','picture']
      }
   },
  models: {
    connection: 'someMysqlServer'
  },
  hookTimeout: 1800000
};
