import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import Registration from '@/models/Registration';

export async function DELETE(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 });
    }
    
    // First, find the user to get their information for logging
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    
    console.log(`Starting permanent deletion for user: ${user.email}`);
    
    // First, delete all registrations associated with this user
    const deletedRegistrations = await Registration.deleteMany({ userId });
    console.log(`Deleted ${deletedRegistrations.deletedCount} registrations for user ${user.email}`);
    
    // Then permanently delete the user from database
    const deletedUser = await User.findByIdAndDelete(userId);
    console.log(`Permanently deleted user account: ${deletedUser.email}`);
    
    return NextResponse.json({
      success: true,
      message: 'User permanently deleted from database',
      deletedUser: {
        id: deletedUser._id.toString(),
        firstName: deletedUser.firstName,
        lastName: deletedUser.lastName,
        email: deletedUser.email
      },
      deletedRegistrations: deletedRegistrations.deletedCount
    });

  } catch (error) {
    console.error('Error permanently deleting user:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
