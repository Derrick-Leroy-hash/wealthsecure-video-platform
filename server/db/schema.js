import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const videos = pgTable('videos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  filename: text('filename').notNull(),
  s3Key: text('s3_key').notNull(),
  s3Url: text('s3_url').notNull(),
  originalName: text('original_name').notNull(),
  size: integer('size').notNull(),
  mimetype: text('mimetype').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
  views: integer('views').default(0),
  shares: integer('shares').default(0),
  formEnabled: boolean('form_enabled').default(false),
  formTiming: integer('form_timing').default(30),
  ctaEnabled: boolean('cta_enabled').default(false),
  ctaTitle: text('cta_title'),
  ctaDescription: text('cta_description'),
  ctaButtonText: text('cta_button_text'),
  ctaButtonUrl: text('cta_button_url'),
});

export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  service: text('service').notNull(),
  testimonialText: text('testimonial_text'),
  videoFilename: text('video_filename'),
  s3Key: text('s3_key'),
  s3Url: text('s3_url'),
  originalName: text('original_name'),
  size: integer('size'),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
  approved: boolean('approved').default(false),
});

export const videoViews = pgTable('video_views', {
  id: serial('id').primaryKey(),
  videoId: integer('video_id').notNull().references(() => videos.id),
  viewedAt: timestamp('viewed_at').defaultNow(),
});

export const videoFormFields = pgTable('video_form_fields', {
  id: serial('id').primaryKey(),
  videoId: integer('video_id').notNull().references(() => videos.id),
  fieldLabel: text('field_label').notNull(),
  fieldType: text('field_type').notNull(),
  fieldRequired: boolean('field_required').default(false),
  fieldOrder: integer('field_order').default(0),
});

export const videoFormSubmissions = pgTable('video_form_submissions', {
  id: serial('id').primaryKey(),
  videoId: integer('video_id').notNull().references(() => videos.id),
  formData: text('form_data').notNull(),
  submittedAt: timestamp('submitted_at').defaultNow(),
});

