var mongodb = require('./db');
//引入markdown
var markdown = require('markdown').markdown;
function Post(name,title,content,tags) {
    this.name = name;
    this.title = title;
    this.content = content;
    this.tags = tags;

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
        time:now,
        //添加一个标签的字段
        tags:this.tags,
        // 添加留言字段
        comments:[],
        //添加一个访问量
        pv:0
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
Post.getTen = function (name,page,callback) {
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
           collection.count(query,function (err,total) {
               if(err){
                   mongodb.close();
                   return callback(err);
               }
               collection.find(query,{
                   skip:(page - 1) * 10,
                   limit:10
               }).sort({time:-1}).toArray(function (err,docs) {
                   mongodb.close();
                   if(err){
                       return callback(err);
                   }
                   //将每篇文章在读取的时候以Markdown的格式进行解析
                   docs.forEach(function (doc) {
                       doc.content = markdown.toHTML(doc.content);
                   })
                   return callback(null,docs,total);
               })
           })
        })
    })
}
//获取一篇文章
Post.getOne = function (name,title,time,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                name:name,
                title:title,
                time:time
            },function (err,doc) {
                if(err){
                    return callback(err);
                }
                if(doc){
                    collection.update({
                        name:name,
                        title:title,
                        time:time
                    },{
                        $inc:{pv:1}
                    },function (err) {
                        mongodb.close();
                    })
                //    解析文章内容


                    doc.content = markdown.toHTML(doc.content);
                //    留言内容也要通过Markdown解析
                    doc.comments.forEach((function (comment) {
                        comment.content = markdown.toHTML(comment.c_content)
                    }))
                }
                // console.log(doc)
                return callback(null,doc);
            })
        })
    })
}
Post.edit = function (name,title,time,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                name:name,
                title:title,
                time:time
            },function (err,doc) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null,doc);
            })
        })
    })
}
Post.update = function (name,title,time,content,callback) {
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
                $set:{content:content}
            },function (err,doc) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null,doc);
            })
        })
    })
}
//删除一个文章
Post.remove = function (name,title,time,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.remove({
                name:name,
                title:title,
                time:time
            },{
                w:1
            },function (err) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null);
            })
        })
    })
}
Post.getArchive = function (callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find({},{
                name:1,
                title:1,
                time:1
            }).sort({time:-1}).toArray(function (err,docs) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null,docs);
            })
        })
    })
}
//取出所有的标签
Post.getTags = function (callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.distinct('tags',function (err,docs) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null,docs)
            })
        })
    })
}
//获取标签所对应的文章列表
Post.getTag = function (tag,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find({
                tags:tag
            },{
                name:1,
                title:1,
                time:1
            }).sort({time:-1}).toArray(function (err,docs) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null,docs);
            })
        })
    })
}
//搜索
Post.search = function (keyword,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            var newRegex = new RegExp(keyword,'i');
            collection.find({
                title:newRegex
            },{
                name:1,
                title:1,
                time:1
            }).sort({time:-1}).toArray(function (err,docs) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null,docs)
            })
        })
    })
}
module.exports = Post;
