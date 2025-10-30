import { useState, useEffect } from 'react'
import { Video, Upload, Library, Users, BarChart3, Share2, Eye, Trash2, Play, Copy, Check, Settings, Presentation } from 'lucide-react'
import { WebinarPlayer } from './WebinarPlayer.jsx'
import { VideoSettings } from './VideoSettings.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import './App.css'

const API_URL = '/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [videos, setVideos] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState({});
  const [uploading, setUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [webinarPlayerOpen, setWebinarPlayerOpen] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [videoSettingsOpen, setVideoSettingsOpen] = useState(false);
  const [webinarConfig, setWebinarConfig] = useState({
    webinarEnabled: false,
    formEnabled: false,
    ctaEnabled: false,
    ctaTitle: '',
    ctaDescription: '',
    ctaButtonText: '',
    ctaButtonUrl: '',
    formFields: []
  });

  // Form states
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: '',
    file: null
  });

  useEffect(() => {
    fetchVideos();
    fetchTestimonials();
    fetchStats();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_URL}/videos`);
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`${API_URL}/testimonials`);
      const data = await response.json();
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title || !uploadForm.category) {
      alert('Please fill in all required fields');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('video', uploadForm.file);
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);
    formData.append('category', uploadForm.category);

    try {
      const response = await fetch(`${API_URL}/videos/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Video uploaded successfully!');
        setUploadForm({ title: '', description: '', category: '', file: null });
        fetchVideos();
        fetchStats();
        setActiveTab('library');
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await fetch(`${API_URL}/videos/${id}`, { method: 'DELETE' });
      fetchVideos();
      fetchStats();
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const handleShare = (video) => {
    setSelectedVideo(video);
    setShareDialogOpen(true);
    // Track share
    fetch(`${API_URL}/videos/${video.id}/share`, { method: 'POST' });
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/watch/${selectedVideo.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WealthSecure Insights</h1>
                <p className="text-sm text-amber-600 font-semibold">Turn Credit Into Capital</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">{stats.totalVideos || 0}</div>
                <div className="text-xs text-gray-500">Videos</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{stats.totalViews || 0}</div>
                <div className="text-xs text-gray-500">Views</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Video
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <Library className="w-4 h-4" />
              Video Library
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-2">
              <Users className="w-4 h-4" />
              Testimonials
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalVideos || 0}</div>
                  <p className="text-xs text-muted-foreground">Wealth-building education</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalViews || 0}</div>
                  <p className="text-xs text-muted-foreground">Future wealth builders</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalShares || 0}</div>
                  <p className="text-xs text-muted-foreground">Opportunities shared</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTestimonials || 0}</div>
                  <p className="text-xs text-muted-foreground">Wealth transformation stories</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Videos</CardTitle>
                <CardDescription>Your latest wealth-building content</CardDescription>
              </CardHeader>
              <CardContent>
                {videos.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No videos uploaded yet</p>
                    <Button onClick={() => setActiveTab('upload')}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Your First Video
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {videos.slice(0, 5).map((video) => (
                      <div key={video.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Play className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{video.title}</h4>
                            <p className="text-sm text-gray-500">{video.category} • {formatDate(video.uploadedAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Eye className="w-4 h-4" />
                              {video.views}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleShare(video)}>
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Marketing Video</CardTitle>
                <CardDescription>Upload your minute billboards, sales presentations, and marketing content</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Video Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Combined Insurance - 60 Second Billboard"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the video content..."
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={uploadForm.category} onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Combined Insurance">Combined Insurance</SelectItem>
                        <SelectItem value="Business Funding">Business Funding</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="WealthSecure Systems">WealthSecure Systems</SelectItem>
                        <SelectItem value="Traffic Solutions">Traffic Solutions</SelectItem>
                        <SelectItem value="Insights">Insights</SelectItem>
                        <SelectItem value="Business Payments">Business Payments</SelectItem>
                        <SelectItem value="Credit Repair">Credit Repair</SelectItem>
                        <SelectItem value="General Marketing">General Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video">Video File *</Label>
                    <Input
                      id="video"
                      type="file"
                      accept="video/mp4,video/mov,video/avi,video/webm"
                      onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                      required
                    />
                    <p className="text-sm text-gray-500">Supported formats: MP4, MOV, AVI, WebM (Max 500MB)</p>
                  </div>

                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? (
                      <>Uploading...</>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Video
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library">
            <Card>
              <CardHeader>
                <CardTitle>Video Library</CardTitle>
                <CardDescription>Manage and share your marketing videos</CardDescription>
              </CardHeader>
              <CardContent>
                {videos.length === 0 ? (
                  <div className="text-center py-12">
                    <Library className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Your video library is empty</p>
                    <Button onClick={() => setActiveTab('upload')}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Your First Video
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video) => (
                      <Card key={video.id} className="overflow-hidden">
                        <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                          <Play className="w-16 h-16 text-purple-600" />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-1 line-clamp-1">{video.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">{video.category}</p>
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {video.views}
                            </div>
                            <div className="flex items-center gap-1">
                              <Share2 className="w-4 h-4" />
                              {video.shares}
                            </div>
                            <span>{formatFileSize(video.size)}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="flex-1" 
                              onClick={() => {
                                setPlayingVideoId(video.id);
                                setWebinarPlayerOpen(true);
                              }}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Play
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedVideo(video);
                                setVideoSettingsOpen(true);
                              }}
                              title="Video Settings"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleShare(video)}>
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(video.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials">
            <Card>
              <CardHeader>
                <CardTitle>Client Testimonials</CardTitle>
                <CardDescription>Video testimonials collected from clients</CardDescription>
              </CardHeader>
              <CardContent>
                {testimonials.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No testimonials yet</p>
                    <p className="text-sm text-gray-400 mb-4">Share the testimonial upload link with your clients</p>
                    <Button onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/testimonial-upload`);
                      alert('Upload link copied to clipboard!');
                    }}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Upload Link
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testimonials.map((testimonial) => (
                      <div key={testimonial.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{testimonial.name}</h4>
                            <p className="text-sm text-gray-500">{testimonial.service}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${testimonial.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {testimonial.approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        {testimonial.testimonialText && (
                          <p className="text-sm text-gray-600 mb-2">{testimonial.testimonialText}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{testimonial.email}</span>
                          <span>•</span>
                          <span>{formatDate(testimonial.uploadedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Webinar Player */}
      {webinarPlayerOpen && playingVideoId && (
        <WebinarPlayer
          videoId={playingVideoId}
          onClose={() => {
            setWebinarPlayerOpen(false);
            setPlayingVideoId(null);
          }}
        />
      )}

      {/* Video Settings */}
      {videoSettingsOpen && selectedVideo && (
        <VideoSettings
          video={selectedVideo}
          onClose={() => {
            setVideoSettingsOpen(false);
            setSelectedVideo(null);
          }}
          onSave={() => {
            fetchVideos();
            setVideoSettingsOpen(false);
            setSelectedVideo(null);
          }}
        />
      )}

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Video</DialogTitle>
            <DialogDescription>
              Copy this link to share with clients
            </DialogDescription>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">{selectedVideo.title}</h4>
                <p className="text-sm text-gray-500">{selectedVideo.category}</p>
              </div>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/watch/${selectedVideo.id}`}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={copyShareLink}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              {copied && <p className="text-sm text-green-600">Link copied to clipboard!</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App

