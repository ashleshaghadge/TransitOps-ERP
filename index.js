const express=require("express");
const app=express();
const port=8080;
const path=require("path");
const mysql= require('mysql2');
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'transitops', 
  password:'Ashu@5492'
});
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.listen(port,()=>{
    console.log(`app is listening on port ${port}`);
});

app.get("/",(req,res)=>{
    res.render("home.ejs");
})