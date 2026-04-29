import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import Registration from '@/models/Registration';

export async function GET() {
  try {
    await connectDB();

    // Fetch all registrations from database with populated user data
    const registrations = await Registration.find({}).populate({
      path: 'userId',
      select: 'firstName lastName email fullName',
      match: null // Ensure we get all registrations even if user is deleted
    }).sort({ createdAt: 1 });

    // Create cleaning days structure for May 2026
    const cleaningDays = [];
    let dayId = 1;

    // Week 1: May 4-8, 2026 (Monday to Friday)
    // Week 2: May 11-15, 2026 (Monday to Friday)  
    // Week 3: May 18-22, 2026 (Monday to Friday)
    const weekDates = [
      // Week 1 dates
      new Date('2026-05-04'), // Monday
      new Date('2026-05-05'), // Tuesday
      new Date('2026-05-06'), // Wednesday
      new Date('2026-05-07'), // Thursday
      new Date('2026-05-08'), // Friday
      // Week 2 dates
      new Date('2026-05-11'), // Monday
      new Date('2026-05-12'), // Tuesday
      new Date('2026-05-13'), // Wednesday
      new Date('2026-05-14'), // Thursday
      new Date('2026-05-15'), // Friday
      // Week 3 dates
      new Date('2026-05-18'), // Monday
      new Date('2026-05-19'), // Tuesday
      new Date('2026-05-20'), // Wednesday
      new Date('2026-05-21'), // Thursday
      new Date('2026-05-22'), // Friday
    ];

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    // Generate 15 cleaning days (3 weeks × 5 days)
    for (let i = 0; i < weekDates.length; i++) {
      const currentDate = weekDates[i];
      const dayName = dayNames[i % 5];
      const weekNumber = Math.floor(i / 5) + 1;

      // Find registrations for this specific day
      const dayRegistrations = registrations.filter(reg => reg.cleaningDayId === dayId);

      // Get user data directly from populated userId (always from database)
      const validRegisteredUsers = dayRegistrations
        .filter(reg => reg.userId && typeof reg.userId === 'object' && reg.userId.firstName)
        .map(reg => {
          return {
            id: reg.userId._id?.toString() || reg.userId.id,
            firstName: reg.userId.firstName,
            lastName: reg.userId.lastName,
            email: reg.userId.email,
            fullName: reg.userId.fullName || `${reg.userId.firstName} ${reg.userId.lastName}`,
            createdAt: reg.createdAt,
            updatedAt: reg.updatedAt
          };
        });

      // Clean up registrations that couldn't be populated (user was deleted)
      const invalidRegistrations = dayRegistrations.filter(reg =>
        !(reg.userId && typeof reg.userId === 'object' && reg.userId.firstName)
      );
      if (invalidRegistrations.length > 0) {
        // Clean up these invalid registrations
        await Registration.deleteMany({
          _id: { $in: invalidRegistrations.map(reg => reg._id) }
        });
      }

      cleaningDays.push({
        id: dayId,
        dayName: dayName,
        date: currentDate.toISOString().split('T')[0],
        week: weekNumber,
        registeredUsers: validRegisteredUsers,
        registeredCount: validRegisteredUsers.length,
        maxSlots: 5, // 5 students per day
        isFull: validRegisteredUsers.length >= 5,
        formattedDate: currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      });
      dayId++;
    }

    // Organize by weeks (1, 2, 3)
    const weeks: { [key: number]: typeof cleaningDays } = {};
    for (let week = 1; week <= 3; week++) {
      weeks[week] = cleaningDays.filter(day => day.week === week);
    }

    return NextResponse.json({
      success: true,
      weeks,
      summary: {
        totalDays: 15,
        totalStudents: 75,
        studentsPerDay: 5,
        weeks: 3,
        dates: {
          week1: 'May 4-8, 2026',
          week2: 'May 11-15, 2026',
          week3: 'May 18-22, 2026'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching cleaning days:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const dayId = searchParams.get('dayId');

    if (!userId || !dayId) {
      return NextResponse.json({ success: false, message: 'User ID and Day ID required' }, { status: 400 });
    }

    // Delete the registration for the specific user and day
    const deletedRegistration = await Registration.findOneAndDelete({
      userId: userId,
      cleaningDayId: parseInt(dayId)
    });

    if (!deletedRegistration) {
      return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
    }

    console.log(`Removed user ${userId} from cleaning day ${dayId}`);

    return NextResponse.json({
      success: true,
      message: 'User successfully removed from cleaning day',
      deletedRegistration: {
        id: deletedRegistration._id.toString(),
        userId: deletedRegistration.userId,
        dayId: deletedRegistration.cleaningDayId
      }
    });

  } catch (error) {
    console.error('Error removing user from cleaning day:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
