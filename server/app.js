import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

import TeacherModel from './models/Teacher.model.js';
import StudentModel from './models/Student.model.js';
import AppointmentModel from './models/Appointment.model.js';

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Database Connected.'))
  .catch((err) => console.log('Database connection error:', err.message));

// Profile update route
app.post('/api/profile', async (req, res) => {
  const { name, email, password, subject, experience, location, image, description } = req.body;
  try {
    const user = await TeacherModel.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      user.name = name;
      user.subject = subject;
      user.experience = experience;
      user.location = location;
      user.description = description;
      user.image = image;

      await user.save();
      res.json({ message: "Update successful", user });
    } else {
      res.json({ message: "Incorrect password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
});

// Teacher registration endpoint
app.post('/api/teacher-register', async (req, res) => {
  try {
    const { email, password, name, subject, experience, location, description, image } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = await TeacherModel.create({
      email,
      password: hashedPassword,
      name,
      subject,
      experience,
      location,
      description,
      image,
    });
    res.status(201).json(teacher);
  } catch (error) {
    res.status(400).json({ message: 'User not created', error: error.message });
  }
});

// Teacher login endpoint
app.post('/api/teacher-login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await TeacherModel.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ message: "Login successful", 
        user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        subject: user.subject,
        experience: user.experience,
        location: user.location,
        type: 'teacher',
        description: user.description,
        image: user.image,
      }});
    } else {
      res.json({ message: "Wrong email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Student registration endpoint
app.post('/api/student-register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await StudentModel.create({ email, password: hashedPassword, name });
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: 'User not created', error: error.message });
  }
});

// Student login endpoint
app.post('/api/student-login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await StudentModel.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ message: "Login successful", 
        user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        type: 'student',
      }});
    } else {
      res.json({ message: "Wrong email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Schedule appointment endpoint
app.post('/api/appointments', async (req, res) => {
  const { studentId, teacherId, date, time } = req.body;
  try {
    const appointment = await AppointmentModel.create({
      studentId,
      teacherId,
      date,
      time
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: 'Appointment not created', error: error.message });
  }
});

app.get('/api/my-appointments', async (req, res) => {
  const { studentId, teacherId } = req.query;

  try {
    let appointments;
    if (studentId) {
      appointments = await AppointmentModel.find({ studentId }).populate('teacherId');
    } else if (teacherId) {
      appointments = await AppointmentModel.find({ teacherId }).populate('studentId');
    } else {
      return res.status(400).json({ message: 'Student ID or Teacher ID is required' });
    }

    console.log('Fetched appointments:', appointments);  // Log fetched appointments
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error.message);  // Log error details
    res.status(500).json({ message: 'Could not fetch appointments', error: error.message });
  }
});

app.get('/api/teachers', async (req, res) => {
  try {
    const teachers = await TeacherModel.find({});
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error: error.message });
  }
});

app.get('/api/teacher-profile/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const teacher = await TeacherModel.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher profile', error: error.message });
  }
});



app.listen(3000, () => {
  console.log('Server Running.');
});
