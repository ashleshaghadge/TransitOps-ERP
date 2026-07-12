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
app.get("/dashboard", (req, res) => {


    let type = req.query.type || "";
    let status = req.query.status || "";
    let region = req.query.region || "";



    // KPI Queries

    let q = `

    SELECT

    (SELECT COUNT(*) 
     FROM vehicles 
     WHERE status='On Trip') AS activeVehicles,


    (SELECT COUNT(*) 
     FROM vehicles 
     WHERE status='Available') AS availableVehicles,


    (SELECT COUNT(*) 
     FROM vehicles 
     WHERE status='In Shop') AS maintenanceVehicles,


    (SELECT COUNT(*) 
     FROM trips 
     WHERE status='Dispatched') AS activeTrips,


    (SELECT COUNT(*) 
     FROM trips 
     WHERE status='Draft') AS pendingTrips,


    (SELECT COUNT(*) 
     FROM drivers 
     WHERE status='On Trip') AS driversOnDuty,


    ROUND(

    (
     (SELECT COUNT(*) 
      FROM vehicles 
      WHERE status='On Trip')
      /
     NULLIF((SELECT COUNT(*) FROM vehicles),0)
    ) * 100

    ,2) AS utilization

    `;




    connection.query(q,(err,result)=>{


        if(err)
        {
            console.log(err);
            return res.send("Database Error");
        }



        // Vehicle Filter Query


        let vehicleQuery = 
        "SELECT * FROM vehicles WHERE 1=1";


        let values=[];



        if(type)
        {
            vehicleQuery += " AND vehicle_type=?";
            values.push(type);
        }



        if(status)
        {
            vehicleQuery += " AND status=?";
            values.push(status);
        }



        if(region)
        {
            vehicleQuery += " AND region=?";
            values.push(region);
        }






        connection.query(
            vehicleQuery,
            values,
            (err,vehicles)=>{


                if(err)
                {
                    console.log(err);
                    return res.send("Database Error");
                }



                res.render("dashboard.ejs",
                {

                    data:result[0],

                    vehicles:vehicles

                });


            }
        );



    });



});
// ================= VEHICLE REGISTRY =================


// Display all vehicles

app.get("/vehicles", (req,res)=>{


    let q = "SELECT * FROM vehicles";


    connection.query(q,(err,result)=>{


        if(err)
        {
            console.log(err);
            return res.send("Database Error");
        }


        res.render("vehicles.ejs",{
            vehicles:result
        });


    });


});





// Add Vehicle Page

app.get("/vehicles/add",(req,res)=>{


    res.render("addVehicle.ejs");


});





// Register Vehicle

app.post("/vehicles/add",(req,res)=>{


    let {

        registration_number,
        vehicle_name,
        vehicle_type,
        max_load_capacity,
        odometer,
        acquisition_cost,
        region

    } = req.body;




    let q = `

    INSERT INTO vehicles

    (
    registration_number,
    vehicle_name,
    vehicle_type,
    max_load_capacity,
    odometer,
    acquisition_cost,
    status,
    region
    )

    VALUES(?,?,?,?,?,?,?,?)

    `;



    connection.query(

        q,

        [

        registration_number,
        vehicle_name,
        vehicle_type,
        max_load_capacity,
        odometer,
        acquisition_cost,
        "Available",
        region

        ],


        (err,result)=>{


            if(err)
            {
                console.log(err);
                return res.send("Vehicle Registration Failed");
            }


            res.redirect("/vehicles");


        }


    );



});
// ================= DRIVER MANAGEMENT =================


// Display all drivers

app.get("/drivers",(req,res)=>{


    let q = "SELECT * FROM drivers";


    connection.query(q,(err,result)=>{


        if(err)
        {
            console.log(err);
            return res.send("Database Error");
        }


        res.render("drivers.ejs",{

            drivers:result

        });


    });


});





// Add Driver Page

app.get("/drivers/add",(req,res)=>{


    res.render("addDriver.ejs");


});





// Register Driver

app.post("/drivers/add",(req,res)=>{


    let {

        name,
        license_number,
        license_category,
        license_expiry,
        contact_number,
        safety_score

    } = req.body;



    let q = `

    INSERT INTO drivers

    (
    name,
    license_number,
    license_category,
    license_expiry,
    contact_number,
    safety_score,
    status
    )

    VALUES(?,?,?,?,?,?,?)

    `;



    connection.query(q,
         [
        name,
        license_number,
        license_category,
        license_expiry,
        contact_number,
        safety_score,
        "Available"

        ],
        (err,result)=>{
if(err)
{
    return res.render("error.ejs",
    {
        message:"License number already exists"
    });
}
            res.redirect("/drivers");


        }


    );


});
