'use strict'
// -------------------------
// Application Dependencies
// -------------------------
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

// -------------------------
// Environment variables
// -------------------------
require('dotenv').config();
const HP_API_URL = process.env.HP_API_URL;

// -------------------------
// Application Setup
// -------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));

// Application Middleware override
app.use(methodOverride('_method'));

// Specify a directory for static resources
app.use(express.static('./public'));
app.use(express.static('./img'));

// Database Setup

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

// Set the view engine for server-side templating

app.set('view engine', 'ejs');

// ----------------------
app.get('/home' , getHouses) 
app.post('/house_name' , house_name)
app.post('/my_characters' , my_characters)
app.get('/character/:character_id' , hundleDetails)
app.post('/update/:id' , updateData);
app.get('/favoratePage' , getPageFavorate)
app.post('/delete/:id' , deleteFavorte)
// ----------------------


// --------------------------------
function getHouses(req,res) {
    let url = `http://hp-api.herokuapp.com/api/characters`
    let AllHouses = [];
    superagent.get(url).then(data=>{
        data.body.forEach(item=>{
AllHouses.push(item.house)
        })
        var uniq = AllHouses.reduce(function(a,b){
            if (a.indexOf(b) < 0 ) a.push(b);
            return a;
          },[]);
          console.log(uniq)
        res.render('index' , {result : uniq})
    })
}

function house_name(req,res) {
let nameHouse = req.body.name;
console.log(nameHouse)
let url = `http://hp-api.herokuapp.com/api/characters/house/${nameHouse}`;
let info = [];
superagent.get(url).then(data=>{
    data.body.forEach(item=>{
        info.push(new Charectores(item))
    })
  res.render('pages/charectrs' , {result : info})
})
}

function my_characters(req,res) {
    let {name,alive,patronus} = req.body;
    let sqlAdd = `insert into characters (name,alive,patronus) values ($1 , $2 , $3);`;
    let safeValues = [name,alive,patronus]
    client.query(sqlAdd,safeValues);
    let sqlGet = 'select * from characters;';
    client.query(sqlGet).then(data=>{
        res.render('pages/myFavorate/show' , {result : data.rows})
    })
}

function hundleDetails(req,res) {
    let id = req.params.character_id;
    console.log(id)
    let sqlDetails = `select * from characters where id = $1;`;
    client.query(sqlDetails , [id]).then(data=>{
        console.log(data.rows)
        res.render('pages/myFavorate/details' , {result : data.rows})
    })
}

function updateData(req,res) {
    let id = req.params.id
    let {name,alive,patronus} = req.body;
    let sqlUpdate = `update characters set name = $1 , alive = $2 , patronus = $3 where id = $4;`;
    let safeValues = [name,alive,patronus,id]
    client.query(sqlUpdate,safeValues);
    let sqlGet = 'select * from characters;';
    client.query(sqlGet).then(data=>{
        res.render('pages/myFavorate/show' , {result : data.rows})
    })
}

function deleteFavorte(req,res) {
    let id = req.params.id
    console.log(id)
    let sqlDelete = `delete from characters where id = $1;`; 
    let safeValues = [id]
    client.query(sqlDelete,safeValues);
    let sqlGet = 'select * from characters;';
    client.query(sqlGet).then(data=>{
    res.render('pages/myFavorate/show' , {result : data.rows})
    })
}

function getPageFavorate(req,res) {
    let sqlGet = 'select * from characters;';
    client.query(sqlGet).then(data=>{
        res.render('pages/myFavorate/show' , {result : data.rows})
    })
}

// --------------------------------



// -----------------------------------
function Charectores(data) {
    this.name = data.name
    this.image = data.image
    this.alive = data.alive
    this.patronus = data.patronus
}
// -----------------------------------



// Express Runtime
client.connect().then(() => {
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
}).catch(error => console.log(`Could not connect to database\n${error}`));
