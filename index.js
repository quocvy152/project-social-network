const express = require('express');
const app     = express();

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');

const PORT = process.env.PORT || 3000;

const URI_MONGOOSE = 'mongodb://localhost:27017/project-mxh';

const checkSession = require('./utils/checkSession');

const { USER_ROUTE } = require('./routes/user');
const { USER_COLL } = require('./database/user-coll');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(session({
    secret: 'Project learning about social network',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(express.static('public'));
app.all('*', (req, res, next) => {
    checkSession(req, res, next);
});

app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/user', USER_ROUTE);

app.get('/', (req, res) => {
    res.redirect('/user/login');
});

app.get('/home/:email', async (req, res) => {
    const { email } = req.params;

    let infoUser = await USER_COLL.findOne({ email });
    if(!infoUser) return res.json({ error: true, message: 'USER_NOT_FOUND' });

    res.render('home', { infoUser });
});

app.get('/logout/clear-session', async (req, res) => {
    try {
        let { email } = req.session;

        if(!email) res.redirect('/user/login');

        req.session.destroy((err) => {
            if(err){
               console.log(err);
            }else{
                res.redirect('/user/login');
            }
        });
    } catch (error) {
        return res.json({ error: true, message: error.message });
    }
});



mongoose.connect(URI_MONGOOSE, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

mongoose.connection.once('open', () => {
    app.listen(`${PORT}`, () => console.log(`Server start at port ${PORT}`))
});