const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/authDB") 
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.log(error));

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// Signup API
app.post("/signup", async (req, res) => { 
  try {
    const { username, email, password,nr } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({ message: "Email eshte perdorur me heret" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email,nr, password: hashedPassword });

    await user.save();

    res.status(201).json({ message: "user u kriju" }); 
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req,res) =>{
  try{
    const {email, password } = req.body;
    
    //check if user exist
    const user = await User.findOne({email});

    if(!user) return res.status(400),json({message:"Emali ose paswordi eshte gabim"});

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400),json({message:"Emali ose paswordi eshte gabim"});

    const token = jwt.sign({id: user._id}, "SECRET_KEY",{expiresIn: "1h"});
    res.json({message: "Login u krye me sukses", token});

  }
  catch(error){
    console.log("Login error" ,error);
  }
})

app.listen(3000, () => console.log("serveri eshte lshut "));