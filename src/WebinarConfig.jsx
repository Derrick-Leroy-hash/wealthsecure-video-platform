import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Save, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'

const API_URL = 'https://3001-iiup50pmdv7245dtj5faz-05ea5d79.manusvm.computer/api';

export function WebinarConfig({ video, onClose, onSave }) {
  const [config, setConfig] = useState({
    webinarEnabled: video.webinarEnabled || false,
    formEnabled: video.formEnabled || false,
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
        setConfig(prev => ({ ...prev, formFields: data.formFields }));
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
      const response = await fetch(`${API_URL}/videos/${video.id}/webinar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        alert('Webinar settings saved successfully!');
        if (onSave) onSave();
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addFormField = () => {
    setConfig(prev => ({
      ...prev,
      formFields: [
        ...prev.formFields,
        {
          id: Date.now(),
          label: '',
          type: 'text',
          required: false,
          order: prev.formFields.length
        }
      ]
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

  const moveFormField = (index, direction) => {
    const newFields = [...config.formFields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newFields.length) {
      [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
      newFields.forEach((field, idx) => {
        field.order = idx;
      });
      setConfig(prev => ({ ...prev, formFields: newFields }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Webinar Configuration</CardTitle>
              <CardDescription>{video.title}</CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="form">Lead Form</TabsTrigger>
              <TabsTrigger value="cta">Call-to-Action</TabsTrigger>
              <TabsTrigger value="submissions">Submissions ({submissions.length})</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Enable Webinar Mode</h4>
                    <p className="text-sm text-gray-500">Turn this video into an interactive presentation</p>
                  </div>
                  <Switch
                    checked={config.webinarEnabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, webinarEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Enable Lead Capture Form</h4>
                    <p className="text-sm text-gray-500">Collect viewer information during the video</p>
                  </div>
                  <Switch
                    checked={config.formEnabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, formEnabled: checked }))}
                    disabled={!config.webinarEnabled}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Enable Call-to-Action</h4>
                    <p className="text-sm text-gray-500">Show a CTA overlay when the video ends</p>
                  </div>
                  <Switch
                    checked={config.ctaEnabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, ctaEnabled: checked }))}
                    disabled={!config.webinarEnabled}
                  />
                </div>

                {config.webinarEnabled && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Webinar Features Active</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>✓ Professional video player with controls</li>
                      {config.formEnabled && <li>✓ Lead capture form will appear at 30% progress</li>}
                      {config.ctaEnabled && <li>✓ Call-to-action will display when video ends</li>}
                      <li>✓ View tracking and analytics enabled</li>
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Form Builder */}
            <TabsContent value="form" className="space-y-6">
              {!config.formEnabled ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Enable the lead capture form in General settings to configure fields</p>
                  <Button onClick={() => setConfig(prev => ({ ...prev, formEnabled: true, webinarEnabled: true }))}>
                    Enable Lead Form
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Form Fields</h4>
                      <p className="text-sm text-gray-500">Build your lead capture form</p>
                    </div>
                    <Button onClick={addFormField} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Field
                    </Button>
                  </div>

                  {config.formFields.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <p className="text-gray-500 mb-4">No form fields yet</p>
                      <Button onClick={addFormField} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Field
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {config.formFields.map((field, index) => (
                        <Card key={field.id}>
                          <CardContent className="p-4">
                            <div className="grid grid-cols-12 gap-4 items-start">
                              <div className="col-span-1 flex flex-col gap-2 pt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveFormField(index, 'up')}
                                  disabled={index === 0}
                                  className="h-6 w-6 p-0"
                                >
                                  ↑
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveFormField(index, 'down')}
                                  disabled={index === config.formFields.length - 1}
                                  className="h-6 w-6 p-0"
                                >
                                  ↓
                                </Button>
                              </div>

                              <div className="col-span-10 grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Field Label</Label>
                                  <Input
                                    placeholder="e.g., Full Name"
                                    value={field.label || ''}
                                    onChange={(e) => updateFormField(field.id, { label: e.target.value })}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Field Type</Label>
                                  <Select
                                    value={field.type}
                                    onValueChange={(value) => updateFormField(field.id, { type: value })}
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

                                <div className="col-span-2 flex items-center gap-2">
                                  <Switch
                                    checked={field.required}
                                    onCheckedChange={(checked) => updateFormField(field.id, { required: checked })}
                                  />
                                  <Label>Required field</Label>
                                </div>
                              </div>

                              <div className="col-span-1 pt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFormField(field.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 border rounded-lg">
                    <h5 className="font-semibold mb-2">Form Behavior</h5>
                    <p className="text-sm text-gray-600">
                      The form will appear as an overlay at 30% video progress. Viewers can fill it out and continue watching, or skip it.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* CTA Settings */}
            <TabsContent value="cta" className="space-y-6">
              {!config.ctaEnabled ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Enable the call-to-action in General settings to configure it</p>
                  <Button onClick={() => setConfig(prev => ({ ...prev, ctaEnabled: true, webinarEnabled: true }))}>
                    Enable Call-to-Action
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-4">Call-to-Action Settings</h4>
                    <p className="text-sm text-gray-500 mb-6">This will appear when the video ends</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cta-title">CTA Title</Label>
                    <Input
                      id="cta-title"
                      placeholder="e.g., Ready to Get Started?"
                      value={config.ctaTitle}
                      onChange={(e) => setConfig(prev => ({ ...prev, ctaTitle: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cta-description">CTA Description</Label>
                    <Textarea
                      id="cta-description"
                      placeholder="e.g., Take the next step and schedule your free consultation today"
                      value={config.ctaDescription}
                      onChange={(e) => setConfig(prev => ({ ...prev, ctaDescription: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cta-button-text">Button Text</Label>
                    <Input
                      id="cta-button-text"
                      placeholder="e.g., Get Started Now"
                      value={config.ctaButtonText}
                      onChange={(e) => setConfig(prev => ({ ...prev, ctaButtonText: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cta-button-url">Button URL</Label>
                    <Input
                      id="cta-button-url"
                      type="url"
                      placeholder="https://your-website.com/contact"
                      value={config.ctaButtonUrl}
                      onChange={(e) => setConfig(prev => ({ ...prev, ctaButtonUrl: e.target.value }))}
                    />
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h5 className="font-semibold text-purple-900 mb-2">Preview</h5>
                    <div className="bg-white p-6 rounded-lg text-center">
                      <h3 className="text-2xl font-bold mb-2">{config.ctaTitle || 'Ready to Get Started?'}</h3>
                      <p className="text-gray-600 mb-4">{config.ctaDescription || 'Take the next step today'}</p>
                      <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                        {config.ctaButtonText || 'Get Started Now'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Submissions */}
            <TabsContent value="submissions" className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4">Form Submissions</h4>
                {submissions.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-gray-500">No submissions yet</p>
                    <p className="text-sm text-gray-400 mt-2">Submissions will appear here when viewers fill out your form</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((submission) => (
                      <Card key={submission.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">
                              {new Date(submission.submittedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(submission.formData).map(([key, value]) => (
                              <div key={key}>
                                <Label className="text-xs text-gray-500">{key}</Label>
                                <p className="text-sm font-medium">{value.toString()}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

