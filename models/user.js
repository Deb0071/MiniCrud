const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/sherytest2');


const userSchema=new mongoose.Schema({
    username:String,
    name:String,
    age:Number,
    email:String,
    password:String,
    profilepic:{
        type:String,
        default:"default.jpeg"
    },
    posts:[
        {
            type:mongoose.Schema.Types.ObjectID,
            ref:"post"
        }
    ],
});


module.exports=mongoose.model('user',userSchema);