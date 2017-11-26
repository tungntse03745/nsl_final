/**
 * Created by TuanAnh on 10/24/2017.
 */
var sails = require('sails');

before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(100000);

  sails.lift({
    // configuration for testing purposes
    connections: {
      someMysqlServer: {
      adapter: 'sails-mysql',
      host: 'localhost',
      user: 'root', //optional
      password: 'abc123', //optional
      database: 'test' //optional
      },
    },
    models: {
      migrate: 'safe'
    }
  }, function(err) {
    if (err) return done(err);
    app = sails;
    // here you can load fixtures, etc.
    done(err, sails);
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});