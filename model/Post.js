var mongodb = require('./db');
//引入markdown
var markdown = require('markdown').markdown;
function Post(name,title,content) {
    this.name = name;
    this.title = title;
    this.content = content;

}
//格式化时间的函数
function formatDate(num) {
    return num < 10 ? '0' + num : num;
}
Post.prototype.save = function (callback) {
    //存储各种时间格式
    var date = new Date();
    var now = date.getFullYear() + '-' + formatDate(date.getMonth()+1) + '-' + formatDate(date.getDate()) + ' ' + formatDate(date.getHours()) + ':' + formatDate(date.getMinutes()) + ':' + formatDate(date.getSeconds());
    //2.收集数据
    var newContent = {
        name:this.name,
        title:this.title,
        content:this.content,
        time:now
    }
    //3.打开数据库
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        //4.读取post集合
        db.collection('posts',function (err,collection) {
           if(err){
               mongodb.close();
               return callback(err);
           }
            //5.将数据插入集合中 并跳转页面
           collection.insert(newContent,function (err,doc) {
               mongodb.close();
               if (err){
                   return callback(err);
               }
               callback(null,doc);
           })

        })

    })


}
Post.get = function (name,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(name){


                query.name = name;
            }
            collection.find(query).sort({time:-1}).toArray(function (err,docs) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                //将每篇文章在读取的时候以Markdown的格式进行解析
                docs.forEach(function (doc) {
                    doc.content = markdown.toHTML(doc.content);
                })
                return callback(null,docs);
            })
        })
    })
}
module.exports = Post;
