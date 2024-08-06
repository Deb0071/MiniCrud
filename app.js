const express = require('express');
const app=express();
const path = require('path')
const userModel=require('./models/user');
const postModel = require('./models/post');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const upload = require('./config/multer');


app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser());




app.get('/', (req, res) => {
        res.render('index.ejs');
});

app.get('/profile/upload', (req, res) => {
    res.render('upload.ejs');
});

app.post('/upload',isLoggedIn,upload.single('image'),async (req, res) => {
    let user=await userModel.findOne({email:req.user.email});
    user.profilepic=req.file.filename;
    await user.save();
    res.redirect("./profile");
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.get('/profile',isLoggedIn, async (req, res) => {
    
    let user=await userModel.findOne({email:req.user.email}).populate('posts');
    res.render('profile.ejs', {user:user});
});

app.get('/like/:id',isLoggedIn, async (req, res) => {
    
    let post=await postModel.findOne({_id:req.params.id}).populate('user');

    if(post.likes.indexOf(req.user.userid) === -1)
    {
        post.likes.push(req.user.userid);

    }else{
        post.likes.splice(post.likes.indexOf(req.user.userid),1);
    }


    await post.save();
    res.redirect("/profile");
});

app.get('/edit/:id',isLoggedIn, async (req, res) => {
    
    let post=await postModel.findOne({_id:req.params.id});
    res.render("edit.ejs", {post:post});
});

app.post('/edit/:id',isLoggedIn, async (req, res) => {
    
    let post=await postModel.findOneAndUpdate({_id:req.params.id},{content:req.body.content});
    res.redirect("/profile");
});

app.post('/post',isLoggedIn, async (req, res) => {
    
    let user=await userModel.findOne({email:req.user.email});
    let {content}=req.body;
    let post=await postModel.create({
        user:user._id,
        content,
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile');
});


app.post('/register', async (req, res) => {
    
    let{username,name,age,email,password}=req.body;

    let user=await userModel.findOne({email});
    if(user) return res.status(304).send("User already registered");

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, async function(err, hash) {
             let user= await userModel.create({
                username,
                name,
                age,
                email,
                password: hash,
            });

            let token = jwt.sign({ email: email, userid:user._id }, 'shhhhh');
            res.cookie("token", token);
            res.redirect("/profile");

        });
    });




});

app.post('/login', async (req, res) => {
    
    let{email,password}=req.body;

    let user=await userModel.findOne({email});
    if(!user) return res.status(500).send("something went wrong");
    
    bcrypt.compare(password, user.password, function(err, result) {
        if(result) {
            let token = jwt.sign({ email: email, userid:user._id }, 'shhhhh');
            res.cookie("token", token);
            res.status(200).redirect("/profile");
        }
        else res.redirect("/login");
    });
});

app.get('/logout', (req, res) => {
        res.cookie("token","");
        res.redirect("/login");
});



function isLoggedIn(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');  // Redirect to login if no token is present
    }

    jwt.verify(token, 'shhhhh', (err, decoded) => {
        if (err) {
            return res.redirect('/login');  // Redirect to login if token is invalid
        }

        req.user = decoded;  // Attach decoded user information to the request
        next();  // Continue to the next middleware or route handler
    });
}




app.listen(3000, () => {
    console.log(`Server started on ${3000}`);
});