/**
 * Created by TuanAnh on 10/25/2017.
 */

var url ='http://localhost:1337';
var request = require('supertest')(url);


  describe("category model",function () {
    it("insert new record into category",function(done) {
        var req = request.post("admin/category");
        req.send({
            data:{
                name:"Khoa hoc"
            }
        })
        req.end(function(err,res) {
            if(err)
            {
                throw err;
            }
            console.log(res.text);
            done();
        })
    }



    )
})