import express from "express";
const app=express()


app.get("/api/login",(req,res)=>{

console.log("a req has been getd");
res.json({
    "message":"your req has been recieved"
})
;

    
})
app.listen(3000,()=>{

    console.log("your server has been started");

})