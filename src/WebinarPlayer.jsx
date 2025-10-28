import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, X } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'

const API_URL = 'https://3001-iiup50pmdv7245dtj5faz-05ea5d79.manusvm.computer/api';

export function WebinarPlayer({ videoId, onClose }) {
  const [video, setVideo] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [formData, setFormData] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchVideo();
    trackView();
  }, [videoId]);

  useEffect(() => {
    if (video && video.formEnabled && currentTime > duration * 0.3 && !formSubmitted) {
      setShowForm(true);
    }
  }, [currentTime, duration, video, formSubmitted]);

  const fetchVideo = async () => {
    try {
      const response = await fetch(`${API_URL}/videos/${videoId}`);
      const data = await response.json();
      setVideo(data);
    } catch (error) {
      console.error('Error fetching video:', error);
    }
  };

  const trackView = async () => {
    try {
      await fetch(`${API_URL}/videos/${videoId}/view`, { method: 'POST' });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = () => {
    setPlaying(false);
    if (video && video.ctaEnabled) {
      setShowCTA(true);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await fetch(`${API_URL}/videos/${videoId}/form-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData })
      });
      
      setFormSubmitted(true);
      setShowForm(false);
      alert('Thank you! Your information has been submitted.');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!video) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Video Container */}
      <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center">
        <div className="relative w-full aspect-video bg-black">
          <video
            ref={videoRef}
            src={`https://3001-iiup50pmdv7245dtj5faz-05ea5d79.manusvm.computer/uploads/${video.filename}`}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnded}
            onClick={handlePlayPause}
          />

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div
              className="w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-purple-600 rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlayPause}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                </button>

                <button
                  onClick={handleMuteToggle}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button
                onClick={handleFullscreen}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Overlay */}
          {showForm && video.formEnabled && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
              <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Get More Information</CardTitle>
                  <CardDescription>Fill out this form to continue watching</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    {video.formFields && video.formFields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={`field-${field.id}`}>
                          {field.fieldLabel}
                          {field.fieldRequired && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        
                        {field.fieldType === 'text' && (
                          <Input
                            id={`field-${field.id}`}
                            type="text"
                            required={field.fieldRequired}
                            value={formData[field.fieldLabel] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.fieldLabel]: e.target.value })}
                          />
                        )}
                        
                        {field.fieldType === 'email' && (
                          <Input
                            id={`field-${field.id}`}
                            type="email"
                            required={field.fieldRequired}
                            value={formData[field.fieldLabel] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.fieldLabel]: e.target.value })}
                          />
                        )}
                        
                        {field.fieldType === 'phone' && (
                          <Input
                            id={`field-${field.id}`}
                            type="tel"
                            required={field.fieldRequired}
                            value={formData[field.fieldLabel] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.fieldLabel]: e.target.value })}
                          />
                        )}
                        
                        {field.fieldType === 'textarea' && (
                          <Textarea
                            id={`field-${field.id}`}
                            required={field.fieldRequired}
                            value={formData[field.fieldLabel] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.fieldLabel]: e.target.value })}
                            rows={3}
                          />
                        )}
                        
                        {field.fieldType === 'checkbox' && (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`field-${field.id}`}
                              required={field.fieldRequired}
                              checked={formData[field.fieldLabel] || false}
                              onCheckedChange={(checked) => setFormData({ ...formData, [field.fieldLabel]: checked })}
                            />
                            <label htmlFor={`field-${field.id}`} className="text-sm">
                              {field.fieldLabel}
                            </label>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">Submit & Continue</Button>
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                        Skip
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CTA Overlay */}
          {showCTA && video.ctaEnabled && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
              <Card className="w-full max-w-lg text-center">
                <CardHeader>
                  <CardTitle className="text-2xl">{video.ctaTitle || 'Ready to Get Started?'}</CardTitle>
                  <CardDescription className="text-base">
                    {video.ctaDescription || 'Take the next step today'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    size="lg"
                    className="w-full text-lg"
                    onClick={() => {
                      if (video.ctaButtonUrl) {
                        window.open(video.ctaButtonUrl, '_blank');
                      }
                    }}
                  >
                    {video.ctaButtonText || 'Get Started Now'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCTA(false)}
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Video Info */}
      <div className="absolute top-4 left-4 text-white max-w-md">
        <h2 className="text-2xl font-bold mb-1">{video.title}</h2>
        <p className="text-sm text-white/80">{video.category}</p>
      </div>
    </div>
  );
}

