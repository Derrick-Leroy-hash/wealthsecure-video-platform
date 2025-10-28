import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db/index.js';
import { videos, testimonials, videoViews, videoFormFields, videoFormSubmissions } from './db/schema.js';
// For production with real S3, use:
import { uploadToS3, deleteFromS3 } from './storage.js';
// For local testing, use:
// import { uploadToS3, deleteFromS3 } from './storage-mock.js';
import { eq, desc, sql } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../dist')));

// Configure multer for memory storage (we'll upload to S3)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  }
});

// API Routes

// Get all videos
app.get('/api/videos', async (req, res) => {
  try {
    const allVideos = await db.select().from(videos).orderBy(desc(videos.uploadedAt));
    res.json(allVideos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single video
app.get('/api/videos/:id', async (req, res) => {
  try {
    const [video] = await db.select().from(videos).where(eq(videos.id, parseInt(req.params.id)));
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Get form fields if form is enabled
    if (video.formEnabled) {
      const formFields = await db.select()
        .from(videoFormFields)
        .where(eq(videoFormFields.videoId, parseInt(req.params.id)))
        .orderBy(videoFormFields.fieldOrder);
      video.formFields = formFields;
    }
    
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload video
app.post('/api/videos/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const { title, description, category } = req.body;

    // Upload to S3
    const uniqueFilename = `videos/${Date.now()}-${req.file.originalname}`;
    const s3Result = await uploadToS3(req.file.buffer, uniqueFilename, req.file.mimetype);

    // Insert into database
    const [newVideo] = await db.insert(videos).values({
      title,
      description: description || '',
      category,
      filename: uniqueFilename,
      s3Key: s3Result.key,
      s3Url: s3Result.url,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    }).returning();

    res.json({
      message: 'Video uploaded successfully',
      video: newVideo
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update video settings (forms, CTAs, timing)
app.put('/api/videos/:id/settings', async (req, res) => {
  try {
    const { formEnabled, formTiming, ctaEnabled, ctaTitle, ctaDescription, ctaButtonText, ctaButtonUrl, formFields: newFormFields } = req.body;
    
    // Update video settings
    await db.update(videos)
      .set({
        formEnabled: formEnabled || false,
        formTiming: formTiming || 30,
        ctaEnabled: ctaEnabled || false,
        ctaTitle: ctaTitle || null,
        ctaDescription: ctaDescription || null,
        ctaButtonText: ctaButtonText || null,
        ctaButtonUrl: ctaButtonUrl || null,
      })
      .where(eq(videos.id, parseInt(req.params.id)));
    
    // Update form fields if provided
    if (newFormFields && formEnabled) {
      // Delete existing form fields
      await db.delete(videoFormFields).where(eq(videoFormFields.videoId, parseInt(req.params.id)));
      
      // Insert new form fields
      for (let i = 0; i < newFormFields.length; i++) {
        const field = newFormFields[i];
        await db.insert(videoFormFields).values({
          videoId: parseInt(req.params.id),
          fieldLabel: field.label,
          fieldType: field.type,
          fieldRequired: field.required || false,
          fieldOrder: i,
        });
      }
    }
    
    res.json({ message: 'Video settings updated' });
  } catch (error) {
    console.error('Error updating video settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit video form
app.post('/api/videos/:id/form-submit', async (req, res) => {
  try {
    const { formData } = req.body;
    
    await db.insert(videoFormSubmissions).values({
      videoId: parseInt(req.params.id),
      formData: JSON.stringify(formData),
    });
    
    res.json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get video form submissions
app.get('/api/videos/:id/submissions', async (req, res) => {
  try {
    const submissions = await db.select()
      .from(videoFormSubmissions)
      .where(eq(videoFormSubmissions.videoId, parseInt(req.params.id)))
      .orderBy(desc(videoFormSubmissions.submittedAt));
    
    // Parse JSON formData
    const parsedSubmissions = submissions.map(sub => ({
      ...sub,
      formData: JSON.parse(sub.formData)
    }));
    
    res.json(parsedSubmissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Track video view
app.post('/api/videos/:id/view', async (req, res) => {
  try {
    const videoId = parseInt(req.params.id);
    
    // Insert view record
    await db.insert(videoViews).values({ videoId });
    
    // Update video views count
    await db.update(videos)
      .set({ views: sql`${videos.views} + 1` })
      .where(eq(videos.id, videoId));
    
    res.json({ message: 'View tracked' });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ error: error.message });
  }
});

// Track video share
app.post('/api/videos/:id/share', async (req, res) => {
  try {
    const videoId = parseInt(req.params.id);
    
    await db.update(videos)
      .set({ shares: sql`${videos.shares} + 1` })
      .where(eq(videos.id, videoId));
    
    res.json({ message: 'Share tracked' });
  } catch (error) {
    console.error('Error tracking share:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete video
app.delete('/api/videos/:id', async (req, res) => {
  try {
    const [video] = await db.select().from(videos).where(eq(videos.id, parseInt(req.params.id)));
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Delete from S3
    if (video.s3Key) {
      await deleteFromS3(video.s3Key);
    }

    // Delete from database
    await db.delete(videos).where(eq(videos.id, parseInt(req.params.id)));
    await db.delete(videoViews).where(eq(videoViews.videoId, parseInt(req.params.id)));
    await db.delete(videoFormFields).where(eq(videoFormFields.videoId, parseInt(req.params.id)));
    await db.delete(videoFormSubmissions).where(eq(videoFormSubmissions.videoId, parseInt(req.params.id)));

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all testimonials
app.get('/api/testimonials', async (req, res) => {
  try {
    const allTestimonials = await db.select().from(testimonials).orderBy(desc(testimonials.uploadedAt));
    res.json(allTestimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload testimonial
app.post('/api/testimonials/upload', upload.single('video'), async (req, res) => {
  try {
    const { name, email, phone, service, testimonialText } = req.body;

    let s3Result = null;
    if (req.file) {
      const uniqueFilename = `testimonials/${Date.now()}-${req.file.originalname}`;
      s3Result = await uploadToS3(req.file.buffer, uniqueFilename, req.file.mimetype);
    }

    const [newTestimonial] = await db.insert(testimonials).values({
      name,
      email,
      phone: phone || '',
      service,
      testimonialText: testimonialText || '',
      videoFilename: s3Result ? s3Result.key : null,
      s3Key: s3Result ? s3Result.key : null,
      s3Url: s3Result ? s3Result.url : null,
      originalName: req.file ? req.file.originalname : null,
      size: req.file ? req.file.size : null,
    }).returning();

    res.json({
      message: 'Testimonial submitted successfully',
      testimonial: newTestimonial
    });
  } catch (error) {
    console.error('Error uploading testimonial:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve testimonial
app.patch('/api/testimonials/:id/approve', async (req, res) => {
  try {
    await db.update(testimonials)
      .set({ approved: true })
      .where(eq(testimonials.id, parseInt(req.params.id)));
    
    res.json({ message: 'Testimonial approved' });
  } catch (error) {
    console.error('Error approving testimonial:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [videoCount] = await db.select({ count: sql`count(*)` }).from(videos);
    const [viewsSum] = await db.select({ total: sql`sum(${videos.views})` }).from(videos);
    const [sharesSum] = await db.select({ total: sql`sum(${videos.shares})` }).from(videos);
    const [testimonialCount] = await db.select({ count: sql`count(*)` }).from(testimonials);
    const [submissionCount] = await db.select({ count: sql`count(*)` }).from(videoFormSubmissions);
    const [todayViewsCount] = await db.select({ count: sql`count(*)` })
      .from(videoViews)
      .where(sql`DATE(${videoViews.viewedAt}) = CURRENT_DATE`);

    res.json({
      totalVideos: parseInt(videoCount.count) || 0,
      totalViews: parseInt(viewsSum.total) || 0,
      totalShares: parseInt(sharesSum.total) || 0,
      totalTestimonials: parseInt(testimonialCount.count) || 0,
      totalFormSubmissions: parseInt(submissionCount.count) || 0,
      todayViews: parseInt(todayViewsCount.count) || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend for all non-API routes
app.use((req, res, next) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

