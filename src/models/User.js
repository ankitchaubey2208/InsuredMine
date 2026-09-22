const mongoose = require('mongoose');
const { baseSchemaOptions } = require('./options');

const userSchema = new mongoose.Schema({
  userKey: { type: String, required: true, unique: true, index: true },
  firstName: { type: String, required: true, trim: true, index: true },
  dob: Date,
  address: { type: String, trim: true },
  phoneNumber: { type: String, trim: true },
  state: { type: String, trim: true },
  zipCode: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true, index: true },
  gender: { type: String, trim: true },
  userType: { type: String, trim: true }
}, baseSchemaOptions);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
