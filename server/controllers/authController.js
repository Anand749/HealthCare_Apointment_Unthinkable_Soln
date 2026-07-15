const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmailWithRetry } = require('../config/email');

// Helper to sign JWT
const getSignedJwtToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret-token-key-123', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register a patient
// @route   POST /api/auth/register
// @access  Public
exports.registerPatient = async (req, res) => {
  try {
    const { name, email, password, dob, gender, bloodGroup, language } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Create base user
    const user = await User.create({
      name,
      email,
      password,
      role: 'patient'
    });

    // Create corresponding patient details
    await Patient.create({
      user: user._id,
      dob,
      gender,
      bloodGroup,
      preferredLanguage: language || 'English'
    });

    const token = getSignedJwtToken(user._id);

    // Send Welcome Email
    sendEmailWithRetry(
      email,
      'Welcome to HealSync! Confirm Your Registration',
      `Hi ${name},\n\nWelcome to HealSync! Your account has been created successfully.\n\nTo activate your personalized dashboard, please verify your email by clicking the link below:\n\nhttps://healsync.app/verify?code=${user._id}\n\nStay healthy,\nThe HealSync Team`,
      `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px;background:#f0f9ff;border-radius:12px">
        <h2 style="color:#0ea5e9">Welcome to HealSync, ${name}! 🎉</h2>
        <p>Your patient account has been created successfully. We're thrilled to have you onboard.</p>
        <p>To get started with personalized AI health insights, booking appointments, and scanning prescriptions, please activate your account.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="http://localhost:5173/login?verified=true" style="background:#0284c7;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Activate My Account</a>
        </div>
        <p style="color:#64748b;font-size:14px">If the button doesn't work, copy and paste this link into your browser: <br/> <a href="http://localhost:5173/login?verified=true">http://localhost:5173/login?verified=true</a></p>
        <p>— The HealSync Team</p>
      </div>`
    );

    res.status(201).json({ success: true, token, user: { id: user._id, name, email, role: 'patient' } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login user (Patient, Doctor, Admin)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = getSignedJwtToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Forgot password — generate OTP and send email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      // Always return 200 to prevent email enumeration attacks
      return res.status(200).json({ success: true, message: 'If that email exists, a reset code has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordExpire = expiry;
    await user.save({ validateBeforeSave: false });

    await sendEmailWithRetry(
      user.email,
      'HealSync — Your Password Reset Code',
      `Your HealSync password reset code is: ${otp}\n\nThis code expires in 15 minutes. Do not share it with anyone.`,
      `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f0f9ff;border-radius:12px">
        <h2 style="color:#0ea5e9">🔐 Password Reset Request</h2>
        <p>You requested to reset your <strong>HealSync</strong> account password. Use the code below:</p>
        <div style="text-align:center;margin:30px 0">
          <span style="font-size:42px;font-weight:900;letter-spacing:14px;color:#1e40af;background:#dbeafe;padding:16px 28px;border-radius:12px;display:inline-block">${otp}</span>
        </div>
        <p style="color:#64748b;font-size:14px">This code expires in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
        <p>— The HealSync Team</p>
      </div>`
    );

    res.status(200).json({ success: true, message: 'A 6-digit reset code has been sent to your email.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, OTP code, and new password are all required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    }

    const hashedOtp = crypto.createHash('sha256').update(otp.toString().trim()).digest('hex');
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordOtp: hashedOtp,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset code. Please request a new one.' });
    }

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully! You can now log in with your new password.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

