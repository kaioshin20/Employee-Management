const passport=require('passport')
const LocalStratergy=require('passport-local').Strategy
const FacebookStratergy = require('passport-facebook'),
const  GoogleStrategy    = require('passport-google-oauth20')
const connectdb=require('./db')

passport.use(new LocalStratergy((username, password, done) => {
        connectdb('empmanag')
            .then(db => db.collection('users').findOne({ username: username}))
            .then((user) => {
                if(!user) {
                    return done(new Error('username invalid'))
                }
                if(user.password != password) {
                    return done(null, false)
                }
                done(null, user)
            })
            .catch(done)
    }
  )
);

passport.use( new FacebookStratergy({
    clientID: 'fbID',
    clientSecret: 'fbSecret',
    callbackURL: 'http://localhost:3000/signin/facebook/callback',
    profileFields: ['emails', 'displayName', 'picture.type(large)']
},
(accessToken, refreshToken, profile, done) => {
    connectdb('empmanag')
        .then(db => db.collection('users').find({ email: profile.emails[0].value }))
        .then(user => user.toArray())
        .then((user) => {
            if(user.length == 0) {
                let fbuser = {
                    dp: profile.photos[0].value,
                    email: profile.emails[0].value,
                    username: profile.displayName,
                    fbAccessToken: accessToken
                }
                connectdb('empmanag')
                    .then(db => db.collection('users').insertOne(fbuser))
                    .then(fbuser => {
                        console.log(fbuser.ops)
                        done(null, fbuser.ops)
                    })
                    .catch(done)
            }
            else{
                done(null, user)
            }
        })
        .catch(done)
}))

passport.use(new GoogleStrategy({
    clientID: 'googleID',
    clientSecret: 'googleSecret',
    callbackURL: "http://localhost:3000/signin/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    connectdb('empmanag')
        .then(db => db.collection('users').find({ email: profile.emails[0].value }))
        .then(user => user.toArray())
        .then((user) => {
            if(user.length == 0) {
                let guser = {
                    dp: profile.photos[0].value,
                    email: profile.emails[0].value,
                    username: profile.displayName,
                    gAccessToken: accessToken
                }
                connectdb('empmanag')
                    .then(db => db.collection('users').insertOne(guser))
                    .then(guser => {
                        console.log(guser.ops)
                        return done(null, guser.ops)
                    })
                    .catch(done)
            }
            else{
                done(null, user)
            }
        })
        .catch(done)
  }
));


passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

module.exports=passport