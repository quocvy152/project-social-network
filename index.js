const express = require('express');
const app     = express();

const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;

const URI_MONGOOSE = 'mongodb://localhost:27017/project-mxh';

const { USER_ROUTE } = require('./routes/user');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/user', USER_ROUTE);

app.get('/', (req, res) => {
    res.redirect('/user/login');
});

app.get('*', (req, res) => {
    res.json({
        message: 'Hello Everybody',
        error: false,
        author: 'quocvy152'
    });
});

mongoose.connect(URI_MONGOOSE, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {
    app.listen(`${PORT}`, () => console.log(`Server start at port ${PORT}`))
});