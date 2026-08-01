import { prisma } from '@/lib/prisma/client';

export interface CreateNotificationParams {
  userIds: string[];
  title: string;
  message: string;
  type: string;
  link?: string;
  generatedBy?: string;
  entityType?: string;
  entityId?: string;
}

/**
 * Create notifications for multiple users
 * This utility can be called from any API endpoint to create instant notifications
 */
export async function createNotifications(params: CreateNotificationParams) {
  const {
    userIds,
    title,
    message,
    type,
    link,
    generatedBy,
    entityType,
    entityId
  } = params;

  if (userIds.length === 0) {
    return { created: 0 };
  }

  try {
    // Create notifications for all specified users
    const notifications = await prisma.notification.createMany({
      data: userIds.map(userId => ({
        userId,
        title,
        message,
        type,
        link,
        generatedBy,
        entityType,
        entityId,
        isRead: false,
      }))
    });

    return { created: notifications.count };
  } catch (error) {
    console.error('Error creating notifications:', error);
    throw error;
  }
}

/**
 * Create notification for all users in a tech center
 */
export async function createNotificationForTechCenter(params: {
  techCenterId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  generatedBy?: string;
  entityType?: string;
  entityId?: string;
  excludeUserIds?: string[];
}) {
  const {
    techCenterId,
    title,
    message,
    type,
    link,
    generatedBy,
    entityType,
    entityId,
    excludeUserIds = []
  } = params;

  try {
    console.log('Creating tech center notifications for:', { techCenterId, excludeUserIds });

    // Get all users in the tech center
    const users = await prisma.user.findMany({
      where: {
        techCenterId,
        id: {
          notIn: excludeUserIds
        }
      },
      select: {
        id: true
      }
    });

    console.log('Found users in tech center:', users.length);

    const userIds = users.map(user => user.id);

    if (userIds.length === 0) {
      console.log('No users to notify (all excluded or no users in tech center)');
      return { created: 0 };
    }

    const result = await createNotifications({
      userIds,
      title,
      message,
      type,
      link,
      generatedBy,
      entityType,
      entityId
    });

    console.log('Notifications created result:', result);
    return result;
  } catch (error) {
    console.error('Error creating tech center notifications:', error);
    throw error;
  }
}

/**
 * Create notification for a single user
 */
export async function createNotificationForUser(params: {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  generatedBy?: string;
  entityType?: string;
  entityId?: string;
}) {
  return await createNotifications({
    userIds: [params.userId],
    title: params.title,
    message: params.message,
    type: params.type,
    link: params.link,
    generatedBy: params.generatedBy,
    entityType: params.entityType,
    entityId: params.entityId
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
    return count;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}
