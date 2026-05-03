const mongoose = require('mongoose');
require('dotenv').config();

async function updateRegisteredUsers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/selfless-app');
    console.log('Connected to MongoDB');

    // Define User schema inline
    const UserSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: String,
      password: String,
      phoneNumber: String,
      isAdmin: { type: Boolean, default: false },
      isSuperAdmin: { type: Boolean, default: false },
      isTutor: { type: Boolean, default: false },
      isRegistered: { type: Boolean, default: false },
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Update all existing users to be registered students
    const result = await User.updateMany(
      { isRegistered: { $exists: false } }, // Find users without isRegistered field
      { $set: { isRegistered: true } } // Set isRegistered to true
    );

    console.log(`Updated ${result.modifiedCount} users to be registered students`);

    // Verify the update
    const registeredCount = await User.countDocuments({ isRegistered: true });
    console.log(`Total registered users: ${registeredCount}`);

    // Show a few sample users
    const sampleUsers = await User.find({ isRegistered: true })
      .select('firstName lastName email isRegistered')
      .limit(5);

    console.log('\nSample registered users:');
    sampleUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - Registered: ${user.isRegistered}`);
    });

  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the update
updateRegisteredUsers();
