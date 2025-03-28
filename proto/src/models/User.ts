import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  isAdmin: { type: Boolean, default: false },
  image: String,
  
  // Privacy and blockchain related fields
  privacyConsent: { type: Boolean, default: false },
  blockchainAddress: { type: String },
  lastPrivacyTransactionHash: { type: String },
  privacySettings: {
    epsilon: { type: Number, default: 0.5 },
    delta: { type: Number, default: 0.00001 }
  }
}, {
  timestamps: true
});

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema); 