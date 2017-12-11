
var mongodb = require('./db');
//创建一个构造函数 命名为user 里面的username password email分别存储用户名 密码和邮箱
function User(user) {
    this.username = user.username;
    this.password = user.password;
    this.email = user.email;
}
module.exports = User;
//保存用户的注册信息
User.prototype.save = function (callback) {

    var user = {
        username:this.username,
        password:this.password,
        email:this.email
    }
    mongodb.open(function (err,db) {
        //如果在打开数据库发生错误 将错误信息返回给回调
        if(err){
            return callback(err);
        }
        //    读取users集合
        db.collection('users',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
        //    将数据插入到users集合里面去
            collection.insert(user,{safe:true},function (err,user) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,user[0]);//成功的话返回用户名
            })
        })
    })
}
User.get = function (username,callback) {
    //打开数据库
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        //读取users集合
        db.collection('users',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            //查询name为指定用户名的用户信息 将结果返回
            collection.findOne({username:username},function (err,user) {
                mongodb.close();//关闭数据库
                if(err){
                    return callback(err);
                }
                return callback(null,user);
            })
        })
    })
}