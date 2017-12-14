var mongodb = require('./db');
function Comment(name,title,time,comment) {
    this.name = name;
    this.title = title;
    this.time = time;
    this.comment = comment;
}
module.exports = Comment;
Comment.prototype.save = function (callback) {
    var name = this.name;
    var title = this.title;
    var time= this.time;
    var comment = this.comment;
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.update({
                name:name,
                title:title,
                time:time
            },{
                $push:{comments:comment}
            },function (err) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null)
            })
        })
    })
}