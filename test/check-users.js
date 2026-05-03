const mongoose = require('mongoose');
require('dotenv').config();

async function checkYourUsers() {
  console.log('🔍 Checking Your User Accounts');
  console.log('=' .repeat(50));
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/selfless-app');
    
    // Define User schema
    const UserSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: String,
      password: String,
      isRegistered: Boolean,
      isAdmin: Boolean,
      isTutor: Boolean
    });
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    // Check your specific users
    const emails = ['atbriz256@gmail.com', 'kiwanukatonny@gmail.com'];
    
    for (const email of emails) {
      console.log(`\n📧 Checking: ${email}`);
      
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (user) {
        console.log(`   ✅ User found!`);
        console.log(`   👤 Name: ${user.firstName} ${user.lastName}`);
        console.log(`   🆔 ID: ${user._id}`);
        console.log(`   📝 Registered: ${user.isRegistered}`);
        console.log(`   👑 Admin: ${user.isAdmin}`);
        console.log(`   🎓 Tutor: ${user.isTutor}`);
        console.log(`   🔐 Password Hash: ${user.password ? 'Present' : 'Missing'}`);
      } else {
        console.log(`   ❌ User not found`);
      }
    }
    
    // Check total registered users
    const totalUsers = await User.countDocuments({ isRegistered: true });
    console.log(`\n📊 Total Registered Users: ${totalUsers}`);
    
    // Show sample users for testing
    const sampleUsers = await User.find({ isRegistered: true })
      .select('firstName lastName email _id')
      .limit(5);
    
    console.log('\n👥 Sample Users for Testing:');
    sampleUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ID: ${user._id}`);
    });
    
    await mongoose.disconnect();
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Make sure you know the correct passwords for your accounts');
    console.log('2. Try logging into your app manually first');
    console.log('3. Then test the messaging system through the UI');
    console.log('4. The messaging system should work like WhatsApp once logged in');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkYourUsers();
