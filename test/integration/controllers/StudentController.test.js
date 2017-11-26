/**
 * Created by TuanAnh on 10/24/2017.
 */
var url ='http://localhost:1337';
var request = require('supertest')(url);


// var request = require('supertest');

describe('StudentController', function() {

    describe('#registerStudent()', function() {
        it('should mail to /student/register', function (done) {
            request(sails.hooks.http.app)
                //'POST /student/register': 'StudentController.registerStudent',
                .post('/student/register')
                .send({ name: 'lepacco19945@gmail.com', password: 'abc123' })
                .expect(302)
                .expect('location','/student/register', done);
        });
    });

});




// describe("category model",function () {
//     it("insert new record into category",function(done) {
//         var req = request.post("admin/category");
//         req.send({
//             data:{
//                 name:"Khoa hoc"
//             }
//         })
//         req.end(function(err,res) {
//             if(err)
//             {
//                 throw err;
//             }
//             console.log(res.text);
//             done();
//         })
//     })
// })