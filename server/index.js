import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

import TeacherModel from './models/Teacher.model.js';
import StudentModel from './models/Student.model.js';
import AppointmentModel from './models/Appointment.model.js';

dotenv.config();
//  http://localhost:5173
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors({
  origin: 'https://edumate-tutor.vercel.app',
  methods: ['POST', 'GET', 'PUT', 'DELETE'],
  credentials: true
}));

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database Connected.');
  } catch (err) {
    console.log('Database connection error:', err.message);
    process.exit(1); // Exit process with failure
  }
};

connectToDatabase();

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: "lwjg fekg qmmq btwu"
  },
});

let verificationCodes = {};
app.post('/api/send-verification-code', async (req, res) => {
  const { email } = req.body;
  const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
  verificationCodes[email] = verificationCode;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Edumate Verification Code',
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #555;">
      <div style="text-align: center; padding: 20px; background: linear-gradient(to right, #fbcffb 0%, #c4c3fc 50%, #c5b4ff 100%); border-bottom: 1px solid #ddd; border-radius: 12px;">
        <h1 style="color: #ffffff;">Welcome to Edumate!</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #333;">Dear User,</h2>
        <p>Thank you for signing up!</p>
        <p>Your verification code is:</p>
        <p style="font-size: 28px; font-weight: bold; color: #E67AFA; text-align: center; border: 1px dashed #4CAF50; padding: 10px; margin: 20px 0;">${verificationCode}</p>
        <p>Please enter this code in the verification field to activate your account.</p>
        <p>If you did not request this email, please ignore it.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>Edumate Team</strong></p>
      </div>
      <div style="text-align: center; padding: 15px 10px; background-color: #f4f4f4;border-bottom: 1px solid #ddd; border-radius: 12px;; color: #999;">
        <p style="margin: 0;">Noida, India</p>
        <p style="margin: 0;">Follow us on: 
          <a href="https://www.linkedin.com/in/akshat-kumar-86203224a/" style="color: #1da1f2;">Linkedin</a> | 
          <a href="https://akshat-kumar-portfolio.vercel.app/" style="color: #1da1f2;">Portfolio</a> |
          <a href="https://github.com/Akshat-Kumar-X" style="color: #1da1f2;">GitHub</a>
        </p>
      </div>
    </div>
  `,

  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).json({ message: 'Error sending email', error: error.message });
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json({ message: 'Verification code sent' });
    }
  });
});

app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body;
  if (verificationCodes[email] === code) {
    delete verificationCodes[email];
    res.status(200).json({ message: 'Code verified' });
  } else {
    res.status(400).json({ message: 'Invalid code' });
  }
});

// Profile update route
app.post('/api/profile', async (req, res) => {
  const { name, email, password, subject, experience, location, contact, image, description } = req.body;
  try {
    const user = await TeacherModel.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      user.name = name;
      user.subject = subject;
      user.experience = experience;
      user.location = location;
      user.contact = contact;
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
    const { email, password, name, subject, experience, location, contact, description, image } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = await TeacherModel.create({
      email,
      password: hashedPassword,
      name,
      subject,
      experience,
      location,
      contact,
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
        contact: user.contact,
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

app.put('/api/update-appointment-status', async (req, res) => {
  const { appointmentId, status } = req.body;

  if (!appointmentId || !status) {
    return res.status(400).json({ message: 'Appointment ID and status are required' });
  }

  try {
    const appointment = await AppointmentModel.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error updating appointment status:', error.message);
    res.status(500).json({ message: 'Could not update appointment status', error: error.message });
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

app.use('/', (req, res) => {
  res.json({message : "Running"});
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}.`);
});
