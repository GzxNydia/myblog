
//引入users集合操作方法
var User = require('../model/User');
//引入Post集合操作方法
var Post = require('../model/Post');
//未登录情况下不允许访问登录和注册
function checkLogin(req,res,next) {
    if (!req.session.user) {
        req.flash('error', '未登录!');
        return res.redirect('/login');
    }
    next();
}
//已登录情况下不能访问登录和注册
function checkNotLogin(req,res,next) {
    if (req.session.user) {
        req.flash('error', '已登录!');
        return res.redirect('back');
    }
    next();
}
//引入一个加密插件
var crypto = require('crypto');
//引入上传的插件
var multer = require('multer');
var storage = multer.diskStorage({
    destination:function (req,file,cb) {
        cb(null,'./public/images');
    },
    filename:function (req,file,cb) {
        cb(null,file.originalname);
    }
})
var upload = multer({storage:storage});
module.exports = function (app) {
    app.get('/',function(req,res){

        Post.get(null,function (err,docs) {
            if(err){
                req.flash('error',err);
                return res.redirect('/')
            }
            res.render('index',{
                title:'首页',
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString(),
                docs:docs
            });

        })
    })
    //注册页面
    app.get('/reg',checkNotLogin,function (req,res) {
        res.render('reg',{
            title:'注册页面',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    //注册行为
    app.post('/reg',function (req,res) {
        //1.收集数据
        var username = req.body.username;
        var password = req.body.password;
        var password_repeat = req.body['password_repeat'];
        // 2.判断两次密码输入是否一致
        if(password != password_repeat){
            //给出提示信息
            req.flash('error','两次输入密码不一致');
            return res.redirect('/reg');//返回注册
        }
        // 3.对密码进行加密
        var md5 = crypto.createHash('md5');
        password = md5.update(req.body.password).digest('hex');
        var newUser = new User({
            username:username,
            password:password,
            email:req.body.email
        })
        // 4.判断用户名是否存在
        User.get(newUser.username,function (err,user) {
            if(err){
                req.flash('error',err);
                return res.redirect('/reg');
            }
            if(user){
                req.flash('error','用户名已存在');
                return res.redirect('/reg');
            }

        // 5.将用户信息存入数据库 并且跳转到首页
        newUser.save(function (err,user) {
            if(err){
                req.flash('error',err)
                return res.redirect('/reg');
            }
            req.session.user = newUser;
            req.flash('success','注册成功');
            // console.log(req.flash('success').toString());
            return res.redirect('/')
            })
        })
    })
    //登录页面
    app.get('/login',checkNotLogin,function (req,res) {
        res.render('login',{
            title:'登录页面',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    //登录行为
    app.post('/login',function (req,res) {
        //要把数据存放到数据库当中
        //对密码进行加密
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');
        //判断用户名是否存在
        User.get(req.body.username,function (err,user) {
            if(!user){
                req.flash('error','用户名不存在');
                return res.redirect('/login');
            }
            //检查两次密码是否一致
            if(user.password != password){
                req.flash('error','密码错误');
                return res.redirect('/login');
            }
            //把用户信息保存在session中 病给出提示
            req.session.user = user;
            req.flash('success','欢迎您：' + req.body.username );
            res.redirect('/');

        })
        //修改get login 添加提示信息
        user:req.session.user;
        success:req.flash('success').toString();
        error:req.flash('error').toString();




    })
    //发表页面
    app.get('/post',checkLogin,function (req,res) {
        res.render('post',{
            title:'发表页面',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    //发表行为
    app.post('/post',function (req,res) {
        //获取用户名
        var currentName = req.session.user;
        var newPost = new Post(currentName.username,req.body.title,req.body.content);
        newPost.save(function (err) {
            if(err){
                req.flash('err',err);
                return res.redirect('/');
            }
            req.flash('success','发布成功');
            return res.redirect('/');
        })
    })
    //上传页面
    app.get('/upload',checkLogin,function (req,res) {
        res.render('upload',{
            title:'文件上传',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    //上传行为
    app.post('/upload',upload.array('filename',5),function (req,res) {
        req.flash('success','文件上传成功');
        res.redirect('/upload');
    })
    //退出登录
    app.get('/logout',checkLogin,function (req,res) {
        //登出 将session里面的信息清除 并给出提示信息 跳转到主页
        req.session.user = null;
        req.flash('success', '登出成功!');
        return res.redirect('/');//登出成功后跳转到主页
    })
}