# WealthSecure Video Platform

A professional video hosting and management platform designed to replace expensive services like Wistia. Built with React, Express, PostgreSQL, and S3 storage.

## Features

### Video Management
- Upload and organize videos by category
- Video player with full playback controls
- View and share tracking
- Video deletion with automatic S3 cleanup

### Webinar Capabilities
- Timed forms that appear during video playback
- Custom form fields (text, email, phone, etc.)
- Configurable form timing
- Form submission tracking and management

### Call-to-Actions (CTAs)
- Overlay CTAs on videos
- Custom titles, descriptions, and button text
- Configurable CTA URLs
- Timing control for when CTAs appear

### Testimonials
- Text and video testimonial submissions
- Approval workflow for testimonials
- Display approved testimonials

### Analytics
- Total video views and shares
- Today's views statistics
- Form submission tracking
- Testimonial count

## Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS, Radix UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: S3 (via Manus Forge API)
- **Deployment**: Manus WebDev Platform

## API Endpoints

### Videos
- `GET /api/videos` - List all videos
- `GET /api/videos/:id` - Get single video
- `POST /api/videos/upload` - Upload new video
- `PUT /api/videos/:id/settings` - Update video settings
- `DELETE /api/videos/:id` - Delete video
- `POST /api/videos/:id/view` - Track video view
- `POST /api/videos/:id/share` - Track video share

### Forms
- `POST /api/videos/:id/form-submit` - Submit form data
- `GET /api/videos/:id/submissions` - Get form submissions

### Testimonials
- `GET /api/testimonials` - List all testimonials
- `POST /api/testimonials/upload` - Submit testimonial
- `PATCH /api/testimonials/:id/approve` - Approve testimonial

### Analytics
- `GET /api/stats` - Get platform statistics

