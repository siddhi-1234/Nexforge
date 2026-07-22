import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    const users = await User.find({});
    console.log("Users:", users);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
