const express=require('express')
const session=require('express-session')
const passport=require('./stratergy')
const connectdb=require('./db')
const ObjectID = require('mongodb').ObjectID;

const svr=express()

svr.use('/', express.static(__dirname + '/public'))
svr.set('view engine', 'hbs')
svr.use(express.json())
svr.use(express.urlencoded({extended: true}))

svr.use(session({
    secret: 'kamehameha',
    resave: false,
    saveUninitialized: true
}))

svr.use(passport.initialize())
svr.use(passport.session())

function checklogin(req, res, next){
    if(req.user){
        return next()
    }
    res.redirect('/')
}

svr.get('/logout', checklogin, function(req, res){
    req.logout();
    res.redirect('/');
});

svr.get('/about', checklogin, (req, res) => {
    let name=req.user.username
    res.render('about', {name})
})

svr.get('/contact', checklogin, (req, res) => {
    let name=req.user.username
    res.render('contact', {name})
})

svr.get('/new', (req, res) => {
    // let user=req.user.username
    res.render('new')
})

svr.post('/new', (req, res) => {
    let ia
    if(req.body.admin == 'true')
        ia=true
    else
        ia=false
    connectdb('empmanag')
    .then(db => db.collection('users').insertOne({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        dept: req.body.dept,
        desig: req.body.desig,
        isAdmin: ia
    }))
    .then(() => res.redirect('/new'))
})

svr.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html')
})

svr.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/'
}))

svr.get('/home', checklogin, (req, res) => {
    let user=req.user.username
    let type=req.user.isAdmin
    res.render('home', {type, user})
})

svr.get('/adddetails', checklogin, (req, res) => {
    let id=req.user._id
    let email=req.user.email
    let name=req.user.username
    first=name.split(' ')[0]
    last=name.split(' ')[1]
    res.render('adddetails', { email, first, last, id })
})

svr.post('/newuser', checklogin, (req, res) => {
    let pjts=[]
    connectdb('empmanag')
        .then(db => db.collection('empdetails').insertOne({
            authId: req.body.id,
            name: req.body.fname + ' ' + req.body.lname,
            email: req.body.email,
            dob: req.body.dob,
            address: req.body.address,
            phone: req.body.phone,
            schoolname: req.body.schoolname,
            schoolmarks: req.body.schoolmarks,
            hname: req.body.hname,
            hcourse: req.body.hcourse,
            hmarks: req.body.hmarks,
            dept: req.user.dept,
            desig: req.user.desig,
            projects: pjts,
            projno: 0
        }))
        .then(() => res.redirect('/home'))
})

svr.get('/profile', checklogin, (req, res) => {
    let name=req.user.username
    let id=req.user._id
    connectdb('empmanag')
        .then(db => db.collection('empdetails').find({ authId: req.user._id }))
        .then(det => det.toArray())
        .then(det => {
            let len=det.length
            res.render('profile', {name, len, id})
        })
})

svr.get('/employees', checklogin, (req, res) => {
    let user=req.user.username
    connectdb('empmanag')
        .then(db => db.collection('users').find({isAdmin: false}).sort({projno: -1}).limit(10))
        .then(emps => emps.toArray())
        .then(emps => {
            console.log(emps);
            res.render('employees', {emps, user})
        })
})

svr.get('/getdetails/:id', checklogin, (req, res) => {
    console.log(req.params.id)
    connectdb('empmanag')
        .then(db => db.collection('empdetails').find({authId: req.params.id}))
        .then(det => det.toArray())
        .then(det => res.send(det))
})

svr.get('/employee/:id', checklogin, (req, res) => {
    let user=req.user.username
    connectdb('empmanag')
        .then(db => db.collection('empdetails').find({authId: req.params.id}))
        .then(det => det.toArray())
        .then(det => {
            console.log(det);
            res.render('employee', {det, user})
    })
})

svr.get('/getdept/:dept', checklogin, (req, res) => {
    let user=req.user.username
    let dept=req.user.dept
    connectdb('empmanag')
        .then(db => db.collection('users').find({dept: req.params.dept}))
        .then(det => det.toArray())
        .then(det => {
            console.log(det)
            res.render('all', {det, user, dept})
    })
})

svr.post('/updateemp/:id', checklogin, (req, res) => {
    let j=new ObjectID(req.params.id)
    connectdb('empmanag')
        .then(db => {
            let p=req.body.projects.split(',').length
            db.collection('users').updateOne({ _id: j }, { $set: { username: req.body.name, email: req.body.email, dept: req.body.dept, desig: req.body.desig } })
            db.collection('empdetails').updateOne({ authId: req.params.id }, { $set: { name: req.body.name,
                email: req.body.email,
                dob: req.body.dob,
                address: req.body.address,
                phone: req.body.phone,
                schoolname: req.body.schoolname,
                schoolmarks: req.body.schoolmarks,
                hname: req.body.hname,
                hcourse: req.body.hcourse,
                hmarks: req.body.hmarks,
                dept: req.body.dept,
                desig: req.body.desig,
                projects: req.body.projects,
                projno: p
             } })
        })
        .then(() => res.redirect('/employees'))
})

svr.delete('/delete/:id', checklogin, (req, res) => {
    connectdb('empmanag')
        .then(db => {
                let i=new ObjectID(req.params.id)
                db.collection('users').deleteOne({_id: i})
                db.collection('empdetails').deleteOne({authId: req.params.id})
        })
        .then(() => res.redirect('/employees'))
})

svr.get('/getresult/:key', checklogin, (req, res) => {
    connectdb('empmanag')
        .then(db => db.collection('users').find({$text: {$search: req.params.key}}))
        .then(data => data.toArray())
        .then(data => res.send(data))
})

svr.listen(3000, () => {
    console.log('http://localhost:3000/')
})