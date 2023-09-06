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
const connection = mongoose.connect('mongodb://localhost:27017/employeeDB', { useNewUrlParser: true, useUnifiedTopology: true });

const employeeSchema = new mongoose.Schema({
  name: String,
  contact: String,
  email: String,
  designation: String,
  cabType: String,
  province: String,
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
    User.findOne({ username: username })
  .then(user => {
    if (!user) return done(null, false, { message: 'Incorrect username.' });
    if (user.password !== password) return done(null, false, { message: 'Incorrect password.' });
    return done(null, user);
  })
  .catch(err => {
    return done(err);
  });

  }));
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  

// Middleware for checking if a user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Routes
app.get('/', async (req, res) => {
  const employees = await Employee.find();
  res.render('index', { employees, isAuthenticated: req.isAuthenticated() });
});


app.get('/dashboard', isAuthenticated, async (req, res) =>{
  async function fetchEmployeeData() {
    const designation = client.db().collection('employees');
    const employees = await collection.find({}).toArray();
    return employees;
  }
  
  res.render('dashboard', { isAuthenticated: req.isAuthenticated()});
})

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
    res.render('login', { isAuthenticated: req.isAuthenticated() }); // Pass isAuthenticated to the login view
  });
  
  
  app.post('/login',
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })
  );
  

  app.get('/add', isAuthenticated, (req, res) => {
    res.render('add', { isAuthenticated: req.isAuthenticated()}); 
    
  });
  // Read the JSON file
  
  app.get('/edit/:id', isAuthenticated, async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    const isAuthenticated = req.isAuthenticated(); // Move this line here
    res.render('edit', { employee, isAuthenticated }); // Pass isAuthenticated to the view
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
      check('designation').notEmpty().withMessage('Designation is required'),
      check('cabType').notEmpty().withMessage('Cabinet is required'),
      check('district').notEmpty().withMessage('District is required'),
      check('province').notEmpty().withMessage('Province is required'),
      check('contact').notEmpty().withMessage('Contact number is required'),
      check('email').isEmail().withMessage('Invalid email address'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('add', { errors: errors.array() });
      }
  
      const { name, designation, cabType, district, province, contact, email } = req.body;
      const image = req.file.filename;
  
      const employee = new Employee({ name, designation, cabType, district, province, contact, email, image, active: true }); // Include contact field
      await employee.save();
  
      res.redirect('/');
    }
  );
  
app.post('/edit/:id', upload.single('image'), async (req, res) => {
    const { name, designation, district, contact, email } = req.body;
    const image = req.file ? req.file.filename : req.body.image;
  
    try {
      await Employee.findByIdAndUpdate(req.params.id, { name, designation, district, contact, email, image });
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.redirect('/edit/' + req.params.id); // Redirect back to the edit page with an error message
    }
  });

// Define the logout route
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/'); // Redirect to the home page
  });
});


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
