import { pusherServer, getUserChannel, getRoleChannel } from './pusher';

// Broadcast to a specific user
export const broadcastToUser = async (userId: string, event: string, data: any) => {
  try {
    await pusherServer.trigger(getUserChannel(userId), event, data);
  } catch (error) {
    console.error('Error broadcasting to user:', error);
  }
};

// Broadcast to all users with a specific role
export const broadcastToRole = async (role: string, event: string, data: any) => {
  try {
    await pusherServer.trigger(getRoleChannel(role), event, data);
  } catch (error) {
    console.error('Error broadcasting to role:', error);
  }
};

// Broadcast to all users (requires a public channel)
export const broadcastToAll = async (event: string, data: any) => {
  try {
    await pusherServer.trigger('public-channel', event, data);
  } catch (error) {
    console.error('Error broadcasting to all:', error);
  }
};
