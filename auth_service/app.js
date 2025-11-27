const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/udemy_clone_v1')
.then(()=>{console.log("mongodb connected")})
.catch((error)=>{console.log(error)});

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : function(){
            return this.authProvider.length === 0
        }
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : function(){
            return this.authProvider.length === 0;
        }
    },
    role : {
        type : String,
        default : 'student'
    },
    authProvider : [
        {
            providerName : String,
            providerId : String
        }
    ],
    createdAt : {
        type : Date,
        default : Date.now()
    }
});

const userModel = mongoose.model('User',userSchema);

app.get('/',(req,res)=>{
    res.json({msg:'hi from backend'});
});

app.post('/register',async (req,res)=>{
    const { username , email , password } = req.body;
    console.log( username , email , password);
    
    const checkUser = await userModel.find({email});
    if(checkUser.length > 0){
        return res.json({success:false,msg:'user found',redirectUrl:'/login'});
    }

    const newUser = new userModel({
        username,
        password,
        email
    });

    try {
        const result = await newUser.save();
        return res.json({success:true , redirectUrl:'/login'})
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false , redirectUrl:'/register'});        
    }

});

app.post('/login',async (req,res)=>{
    const { email , password } = req.body;

    const result = await userModel.findOne({email});
    if(result){
        if(result.password === password){
            return res.json({success:true,username:result.username,redirectUrl:'/'}).status(200);
        }
    }else{
        return res.json({success:false,msg:'email or password wrong',redirectUrl:'/register'}).status(300);
    }
});

app.listen(4040);