//连接数据库文件
var setting = require('../setting');//引入数据库配置文件
var Db = require('mongodb').Db;//引入mongodb模块下的Db对象
var Server = require('mongodb').Server;//引入mongodb模块下的Server对象
//数据库实例对象
module.exports = new Db(setting.db, new Server(setting.host,setting.port),{safe:true});