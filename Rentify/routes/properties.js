const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Property = require('../models/Property');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const router = express.Router();

// Create a property
router.post(
  '/',
  [
    auth,
    [
      check('place', 'Place is required').not().isEmpty(),
      check('area', 'Area is required').isNumeric(),
      check('bedrooms', 'Number of bedrooms is required').isNumeric(),
      check('bathrooms', 'Number of bathrooms is required').isNumeric(),
      check('nearbyHospitals', 'Nearby hospitals are required').not().isEmpty(),
      check('nearbyColleges', 'Nearby colleges are required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      place,
      area,
      bedrooms,
      bathrooms,
      nearbyHospitals,
      nearbyColleges,
    } = req.body;

    try {
      const newProperty = new Property({
        place,
        area,
        bedrooms,
        bathrooms,
        nearbyHospitals,
        nearbyColleges,
        seller: req.user.id,
      });

      const property = await newProperty.save();
      res.json(property);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Get all properties with pagination
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const properties = await Property.find()
      .populate('seller', ['firstName', 'lastName', 'email', 'phone'])
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Property.countDocuments();

    res.json({
      properties,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get a property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('seller', ['firstName', 'lastName', 'email', 'phone']);
    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }
    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update a property
router.put('/:id', auth, async (req, res) => {
  const { place, area, bedrooms, bathrooms, nearbyHospitals, nearbyColleges } = req.body;

  const propertyFields = { place, area, bedrooms, bathrooms, nearbyHospitals, nearbyColleges };

  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }

    // Check user
    if (property.seller.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: propertyFields },
      { new: true }
    );

    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete a property
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }

    // Check user
    if (property.seller.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await property.remove();

    res.json({ msg: 'Property removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Like a property
router.put('/like/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    // Check if the property has already been liked by this user
    if (property.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Property already liked' });
    }

    property.likes.unshift(req.user.id);

    await property.save();

    res.json(property.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Unlike a property
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    // Check if the property has not yet been liked by this user
    if (!property.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Property has not yet been liked' });
    }

    // Remove the like
    property.likes = property.likes.filter(
      ({ id }) => id.toString() !== req.user.id
    );

    await property.save();

    res.json(property.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Interested in a property
router.put('/interested/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }

    const seller = await User.findById(property.seller);

    // Sending email to buyer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.user.email,
      subject: 'Property Interest',
      text: `You have shown interest in the property at ${property.place}. Contact the seller at ${seller.email} or ${seller.phone}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error.message);
        return res.status(500).send('Email sending failed');
      }
      res.json({ msg: 'Interest shown and email sent' });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
