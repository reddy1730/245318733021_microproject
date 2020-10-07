const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'hospitalInventory';
var express=require('express');
var middleware=require('./middleware');
const bodyParser = require('body-parser');
var server=require('./server');
var app=express();
app.use(bodyParser.json());
app.use(express.urlencoded({
    extended: true
 }))

MongoClient.connect(url,{ useUnifiedTopology: true }, (err, client) => {
    if (err) return console.log(err);
    db = client.db(dbName);
    console.log(`Connected MongoDB: ${url}`);
    console.log(`Database: ${dbName}`);

    //get all hospital details;
    app.get('/hospitaldetails',middleware.checkToken,(req,res)=>{
        console.log('visited hospitaldetails')
        db.collection('hospital').find({}).toArray().then(result=>res.json(result));
    });

    //get specific hospital details with hid;
    app.get('/hospitaldetails/:hid',middleware.checkToken,(req,res)=>{
        console.log('visited hospitaldetails/:hid')
        var hid=req.params.hid;
        db.collection('hospital').find({"hid":hid}).toArray().then(result=>res.json(result));
    });

    //get all ventilator details
    app.get('/ventilatordetails',middleware.checkToken,(req,res)=>{
        console.log('visited ventilatordetails')
        db.collection('ventilator').find({}).toArray().then(result=>res.json(result));
    })

    //get ventilatordetails of a specific hospital
    app.get('/ventilatordetails/:hid',middleware.checkToken,(req,res)=>{
        console.log('visited ventilatordetails/:hid')
        var hid=req.params.hid;
        db.collection('ventilator').find({"hid":hid}).toArray().then(result=>res.json(result));
    });

    //get ventilator details of a specific hospital and by status
    app.get('/ventilatordetails/:hid/:status',middleware.checkToken,(req,res)=>{
        console.log('visited  ventilatordetails/:hid/:status');
        var hid=req.params.hid;
        var status=req.params.status;
        db.collection('ventilator').find({'hid':hid,'status':status}).toArray().then(result=>res.json(result));
    });

    //insert ventilator via post
    app.post('/insertventilator',middleware.checkToken,(req,res)=>{
        console.log('visited /insertventilator');
        var vid=req.body.vid;
        var hid=req.body.hid;
        var hname=req.body.hname;
        var status=req.body.status;
        db.collection('ventilator').insertOne({"vid":vid,"hid":hid,"status":status,"hname":hname});
        res.send('Ventilator Data inserted');
    });

    //insert hospital via put
    app.put('/inserthospital',middleware.checkToken,(req,res)=>{
        console.log('visited /inserthospital');
        var hid=req.body.hid;
        var hname=req.body.hname;
        var address=req.body.address;
        var contact=req.body.contact;
        var pincode=req.body.pincode;
        db.collection('hospital').insertOne({"hid":hid,'hname':hname,'address':address,'contact':contact,'pincode':pincode});
        res.send('Hospital data inserted');
    });

    //delete hospital
    app.delete('/deletehospital',middleware.checkToken,(req,res)=>{
        console.log('visited /deletehospital');
        var hid=req.body.hid;
        db.collection('hospital').deleteOne({'hid':hid});
        db.collection('ventilator').deleteMany({'hid':hid});
        res.send('requested data of hospital deleted');
    });

    //delete ventilator
    app.delete('/deleteventilator',middleware.checkToken,(req,res)=>{
        console.log('visited  /deleteventilator');
        var vid=req.body.vid;
        db.collection('ventilator').deleteOne({'vid':vid});
        res.send('requested data of ventilator deleted');
    });

    //update status of ventilator
    app.post('/updateventilator',middleware.checkToken,(req,res)=>{
        console.log('visited  /updateventilator');
        var vid=req.body.vid;
        var status=req.body.status;
        db.collection('ventilator').updateOne({'vid':vid},{$set:{'status':status}});
        res.send(`updated status of ${vid} ventilator`);
    });

});

app.listen(3000);