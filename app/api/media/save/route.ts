import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import { createNotificationForDevs } from '@/lib/notifications';
import {
  invalidJsonBodyResponse,
  isString,
  isStringOrNumber,
  optional,
  parseJsonBody,
} from '@/app/api/_lib/request-validation';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    const body = await parseJsonBody(request, {
      blobName: isString,
      publicUrl: isString,
      fileName: optional(isString),
      contentType: optional(isString),
      size: optional(isStringOrNumber),
      title: isString,
      description: optional(isString),
      category: optional(isString),
    });
    if (!body) return invalidJsonBodyResponse();
    const {
      blobName,
      publicUrl,
      fileName,
      contentType,
      size,
      title,
      description,
      category,
    } = body;

    if (!blobName || !publicUrl || !title) {
      return NextResponse.json(
        { success: false, error: 'blobName, publicUrl, and title are required' },
        { status: 400 },
      );
    }

    if (description && description.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Description must be 200 characters or fewer' },
        { status: 400 },
      );
    }

    // Safety: only allow saving blobs that belong to this user
    if (!blobName.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { success: false, error: 'You cannot save this file' },
        { status: 403 },
      );
    }

    const ext = fileName?.split('.').pop()?.toLowerCase() ?? null;

    const roleName = user.role?.name;
    const isPrivilegedUser = roleName === 'dev' || roleName === 'super_admin';
    const finalCategory =
      roleName === 'dev' && category && ['dashboard', 'gallery'].includes(category)
        ? category
        : 'gallery';

    // Non-dev posts require approval
    const requiresApproval = !isPrivilegedUser;

    const media = await prisma.media.create({
      data: {
        userId: user.id,
        blobName,
        publicUrl,
        containerName: 'media',
        contentType: contentType ?? 'application/octet-stream',
        size: size === undefined ? 0 : Number(size) || 0,
        fileExtension: ext,
        title: String(title).slice(0, 120),
        description: description ? String(description).slice(0, 500) : null,
        category: finalCategory,
        approvalStatus: requiresApproval ? 'PENDING' : 'APPROVED',
        approvedAt: requiresApproval ? null : new Date(),
        approvedById: requiresApproval ? null : user.id,
      },
    });

    // Notify dev users about the new post
    const userName = `${user.firstName} ${user.lastName}`.trim();
    try {
      await createNotificationForDevs({
        title: 'New post created',
        message: `${userName} created a new post: "${media.title}"`,
        type: 'media_created',
        link: `/dashboard/media-approvals#${media.id}`,
        generatedBy: user.id,
        entityType: 'media',
        entityId: media.id,
        excludeUserIds: isPrivilegedUser ? [user.id] : [],
      });
    } catch (notificationError) {
      console.error('Failed to notify dev users about new post:', notificationError);
    }

    return NextResponse.json({
      success: true,
      media,
      message: requiresApproval
        ? 'Your post has been created and will be published after review'
        : 'Post created successfully',
    });
  } catch (error) {
    console.error('Save media failed:', error);
    return NextResponse.json(
      { success: false, error: 'Could not save media' },
      { status: 500 },
    );
  }
}