import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'

const API_URL = 'https://3001-iiup50pmdv7245dtj5faz-05ea5d79.manusvm.computer/api';

export function VideoSettings({ video, onClose, onSave }) {
  const [config, setConfig] = useState({
    formEnabled: video.formEnabled || false,
    formTiming: video.formTiming || 30, // Percentage when form appears
    ctaEnabled: video.ctaEnabled || false,
    ctaTitle: video.ctaTitle || '',
    ctaDescription: video.ctaDescription || '',
    ctaButtonText: video.ctaButtonText || 'Get Started Now',
    ctaButtonUrl: video.ctaButtonUrl || '',
    formFields: []
  });

  const [submissions, setSubmissions] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVideoDetails();
    fetchSubmissions();
  }, [video.id]);

  const fetchVideoDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/videos/${video.id}`);
      const data = await response.json();
      if (data.formFields) {
        setConfig(prev => ({ 
          ...prev, 
          formFields: data.formFields,
          formTiming: data.formTiming || 30,
          formEnabled: data.formEnabled || false,
          ctaEnabled: data.ctaEnabled || false,
          ctaTitle: data.ctaTitle || '',
          ctaDescription: data.ctaDescription || '',
          ctaButtonText: data.ctaButtonText || 'Get Started Now',
          ctaButtonUrl: data.ctaButtonUrl || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`${API_URL}/videos/${video.id}/submissions`);
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/videos/${video.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
    } finally {
      setSaving(false);
    }
  };

  const addFormField = () => {
    setConfig(prev => ({
      ...prev,
      formFields: [...prev.formFields, {
        id: Date.now(),
        label: '',
        type: 'text',
        required: true
      }]
    }));
  };

  const updateFormField = (id, updates) => {
    setConfig(prev => ({
      ...prev,
      formFields: prev.formFields.map(field =>
        field.id === id ? { ...field, ...updates } : field
      )
    }));
  };

  const removeFormField = (id) => {
    setConfig(prev => ({
      ...prev,
      formFields: prev.formFields.filter(field => field.id !== id)
    }));
  };

  const moveField = (id, direction) => {
    const index = config.formFields.findIndex(f => f.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === config.formFields.length - 1)
    ) return;

    const newFields = [...config.formFields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    
    setConfig(prev => ({ ...prev, formFields: newFields }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Video Settings</CardTitle>
            <CardDescription>{video.title}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="form">Lead Form</TabsTrigger>
              <TabsTrigger value="cta">Call-to-Action</TabsTrigger>
              <TabsTrigger value="submissions">
                Submissions ({submissions.length})
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Lead Capture Form</Label>
                    <p className="text-sm text-muted-foreground">
                      Show a form overlay during video playback to capture viewer information
                    </p>
                  </div>
                  <Switch
                    checked={config.formEnabled}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({ ...prev, formEnabled: checked }))
                    }
                  />
                </div>

                {config.formEnabled && (
                  <div className="p-4 border rounded-lg space-y-4">
                    <div>
                      <Label>Form Timing</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        When should the form appear during video playback?
                      </p>
                      <Select
                        value={config.formTiming.toString()}
                        onValueChange={(value) =>
                          setConfig(prev => ({ ...prev, formTiming: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">At Start (0%)</SelectItem>
                          <SelectItem value="25">Early (25%)</SelectItem>
                          <SelectItem value="30">30% (Default)</SelectItem>
                          <SelectItem value="50">Middle (50%)</SelectItem>
                          <SelectItem value="75">Late (75%)</SelectItem>
                          <SelectItem value="100">At End (100%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Call-to-Action</Label>
                    <p className="text-sm text-muted-foreground">
                      Show a call-to-action overlay when the video ends
                    </p>
                  </div>
                  <Switch
                    checked={config.ctaEnabled}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({ ...prev, ctaEnabled: checked }))
                    }
                  />
                </div>

                {(config.formEnabled || config.ctaEnabled) && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Active Features</h4>
                    <ul className="space-y-1 text-sm text-purple-800">
                      <li>✓ Professional video player with controls</li>
                      {config.formEnabled && (
                        <li>✓ Lead capture form will appear at {config.formTiming}% progress</li>
                      )}
                      {config.ctaEnabled && (
                        <li>✓ Call-to-action will display when video ends</li>
                      )}
                      <li>✓ View tracking and analytics enabled</li>
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Lead Form Tab */}
            <TabsContent value="form" className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Form Fields</h3>
                    <p className="text-sm text-muted-foreground">
                      Build your lead capture form
                    </p>
                  </div>
                  <Button onClick={addFormField} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </div>

                {config.formFields.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">No form fields yet</p>
                    <Button onClick={addFormField} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Field
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {config.formFields.map((field, index) => (
                      <Card key={field.id}>
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            <div className="flex flex-col gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveField(field.id, 'up')}
                                disabled={index === 0}
                              >
                                ↑
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveField(field.id, 'down')}
                                disabled={index === config.formFields.length - 1}
                              >
                                ↓
                              </Button>
                            </div>

                            <div className="flex-1 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Field Label</Label>
                                  <Input
                                    placeholder="e.g., Full Name"
                                    value={field.label}
                                    onChange={(e) =>
                                      updateFormField(field.id, { label: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Field Type</Label>
                                  <Select
                                    value={field.type}
                                    onValueChange={(value) =>
                                      updateFormField(field.id, { type: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Text</SelectItem>
                                      <SelectItem value="email">Email</SelectItem>
                                      <SelectItem value="phone">Phone</SelectItem>
                                      <SelectItem value="textarea">Text Area</SelectItem>
                                      <SelectItem value="checkbox">Checkbox</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={field.required}
                                    onCheckedChange={(checked) =>
                                      updateFormField(field.id, { required: checked })
                                    }
                                  />
                                  <Label>Required field</Label>
                                </div>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFormField(field.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Form Behavior</h4>
                  <p className="text-sm text-muted-foreground">
                    The form will appear as an overlay at {config.formTiming}% video progress. 
                    Viewers can fill it out and continue watching, or skip it.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* CTA Tab */}
            <TabsContent value="cta" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Call-to-Action Settings</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  This will appear when the video ends
                </p>

                <div className="space-y-4">
                  <div>
                    <Label>CTA Title</Label>
                    <Input
                      placeholder="e.g., Ready to Get Started?"
                      value={config.ctaTitle}
                      onChange={(e) =>
                        setConfig(prev => ({ ...prev, ctaTitle: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <Label>CTA Description</Label>
                    <Textarea
                      placeholder="e.g., Take the next step and schedule your free consultation today"
                      value={config.ctaDescription}
                      onChange={(e) =>
                        setConfig(prev => ({ ...prev, ctaDescription: e.target.value }))
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Button Text</Label>
                      <Input
                        placeholder="e.g., Get Started Now"
                        value={config.ctaButtonText}
                        onChange={(e) =>
                          setConfig(prev => ({ ...prev, ctaButtonText: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Button URL</Label>
                      <Input
                        placeholder="https://your-website.com/contact"
                        value={config.ctaButtonUrl}
                        onChange={(e) =>
                          setConfig(prev => ({ ...prev, ctaButtonUrl: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  {config.ctaTitle && (
                    <div className="mt-6">
                      <Label className="mb-2 block">Preview</Label>
                      <div className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg text-center">
                        <h3 className="text-2xl font-bold mb-2">{config.ctaTitle || 'Ready to Get Started?'}</h3>
                        <p className="text-muted-foreground mb-6">
                          {config.ctaDescription || 'Take the next step today'}
                        </p>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          {config.ctaButtonText || 'Get Started Now'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Submissions Tab */}
            <TabsContent value="submissions" className="space-y-4">
              {submissions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">No submissions yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Form submissions will appear here when viewers fill out your lead capture form
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Submission #{submissions.length - index}
                        </CardTitle>
                        <CardDescription>
                          {new Date(submission.submittedAt).toLocaleString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-2 gap-4">
                          {Object.entries(JSON.parse(submission.formData)).map(([key, value]) => (
                            <div key={key}>
                              <dt className="text-sm font-medium text-muted-foreground">{key}</dt>
                              <dd className="text-sm mt-1">{value.toString()}</dd>
                            </div>
                          ))}
                        </dl>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

