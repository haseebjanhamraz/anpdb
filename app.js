const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const User = require('./models/user')


  


const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/employeeDB', { useNewUrlParser: true, useUnifiedTopology: true });

const employeeSchema = new mongoose.Schema({
  name: String,
  contact: String,
  designation: String,
  district: String,
  image: String,
  active: Boolean
});

const Employee = mongoose.model('Employee', employeeSchema);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
app.use(session({ secret: 'anpsecretkey213', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false, { message: 'Incorrect username.' });
      if (user.password !== password) return done(null, false, { message: 'Incorrect password.' });
      return done(null, user);
    });
  }));
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  // Middleware for checking if a user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  };


// Routes
app.get('/register', (req, res) => {
    res.render('register'); // Create a register.ejs view
  });
  
  app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const newUser = new User({ username, password });
    newUser.save()
  .then(() => {
    res.redirect('/login');
  })
  .catch((err) => {
    console.error(err);
    res.redirect('/register');
  });
  });
  
  app.get('/login', (req, res) => {
    res.render('login'); // Create a login.ejs view
  });
  
  app.post('/login',
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })
  );
  
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
  });

  


  app.get('/', async (req, res) => {
    const employees = await Employee.find();
    res.render('index', { employees });
  });
  
  app.get('/add', isAuthenticated, (req, res) => {
    res.render('add');
  });
  
  app.get('/edit/:id', isAuthenticated, async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    res.render('edit', { employee });
  });
  
  app.get('/disable/:id', isAuthenticated, async (req, res) => {
    await Employee.findByIdAndUpdate(req.params.id, { active: false });
    res.redirect('/');
  });
  
  app.get('/delete/:id', isAuthenticated, async (req, res) => {
    await Employee.findByIdAndDelete(req.params.id);
    res.redirect('/');
  });
      

app.post(
  '/add',
  upload.single('image'),
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('contact').notEmpty().withMessage('Name is required'),
    check('designation').notEmpty().withMessage('Designation is required'),
    check('district').notEmpty().withMessage('District is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('add', { errors: errors.array() });
    }

    const { name, contact, designation, district } = req.body;
    const image = req.file.filename;

    const employee = new Employee({ name, contact, designation, district, image, active: true });
    await employee.save();

    res.redirect('/');
  }
);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
