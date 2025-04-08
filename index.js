const express = require('express');
const passport = require('passport');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const staticPagesRoutes = require('./routes/static');
const connectDB = require('./db')
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const itfRoutes = require('./routes/itf')
const profileRoutes = require('./routes/user');
const institutionRoutes = require('./routes/institution');
const studentRoutes = require('./routes/student');
const employerRoutes = require('./routes/employer')

const app = express();
const PORT = 5000;
connectDB();


app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false,
    cookie: {}
}));

// Middleware to handle session messages
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})

app.use(passport.initialize());
app.use(passport.session());

// set template engine
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.set('layout', 'layout');

//define static folder
app.use(express.static('public'));

app.use('', staticPagesRoutes);
app.use('', profileRoutes);
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/student", studentRoutes);
app.use("/itf", itfRoutes);
app.use("/institution", institutionRoutes);
app.use("/employer", employerRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
