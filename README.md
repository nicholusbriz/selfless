# Selfless Student Portal

A multi-tenant academic management system built with Next.js 16, MongoDB, and Prisma ORM. The platform serves multiple tech centers with role-based access for Super Admins, Admins, Teachers, and Students, providing comprehensive tools for academic management, student interaction, and administrative oversight.

## Project Overview

The Selfless Student Portal is a centralized multi-tenant platform for students across all Selfless CE Tech Centers. Students can track BYU-Idaho courses and credits, receive tutor feedback, participate in daily chores, communicate with peers, access organizational policies, receive announcements, and manage their academic journey through one centralized student portal.

## Media uploads

Media is uploaded directly from the browser to Azure Blob Storage. Configure Blob service CORS for each application origin (including `http://localhost:3000` for local development), allowing `PUT` and the `content-type` and `x-ms-blob-type` request headers. Keep existing CORS rules for other origins. A rejected preflight can prevent uploads even when Azure credentials are valid.

Photos uploaded from profile settings are kept in the user's profile gallery, not the community feed. They use the existing media review process. Existing community posts are not moved automatically.
