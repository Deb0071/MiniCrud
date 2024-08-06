const mongoose = require('mongoose');


const postSchema=new mongoose.Schema({
    user: {
        type:mongoose.Schema.Types.ObjectID,
        ref:"user"
    },
    date:{
        type: Date,
        default: Date.now
    },
    content:String,
    likes:[
        {
            type: mongoose.Schema.Types.ObjectID,
            ref:"user"
        }
    ]
    
});


module.exports=mongoose.model('post',postSchema);