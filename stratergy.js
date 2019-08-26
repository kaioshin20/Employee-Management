const passport=require('passport')
const LocalStratergy=require('passport-local').Strategy
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

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

module.exports=passport