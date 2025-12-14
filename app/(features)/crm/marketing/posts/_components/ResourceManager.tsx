'use client'

import { useState, useEffect } from 'react'
import { Upload, Trash2, FileText, Loader2, X } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@shared/ui/dialog'
import { Label } from '@shared/ui/label'
import { toast } from 'sonner'
import type { Resource } from '@/core/domain/marketing/resource'

interface ResourceManagerProps {
  open: boolean
  onClose: () => void
}

export default function ResourceManager({ open, onClose }: ResourceManagerProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Load resources on mount
  useEffect(() => {
    if (open) {
      loadResources()
    }
  }, [open])

  const loadResources = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/resources')

      if (!res.ok) {
        throw new Error('Failed to load resources')
      }

      const data = await res.json()
      setResources(data)
    } catch (error) {
      console.error('[ResourceManager] Load failed:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['text/markdown', 'text/plain', 'application/pdf']
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const validExts = ['md', 'txt', 'pdf']

    if (!validTypes.includes(file.type) && !validExts.includes(fileExt || '')) {
      toast.error('Invalid file type. Only .md, .txt, and .pdf files are allowed')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large. Maximum 10MB allowed')
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('fileType', selectedFile.name.split('.').pop()?.toLowerCase() || '')

      const res = await fetch('/api/resources', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await res.json()
      toast.success(`Uploaded ${result.resource.name} (${result.chunkCount} chunks)`)

      // Reset selection and reload
      setSelectedFile(null)
      loadResources()
    } catch (error) {
      console.error('[ResourceManager] Upload failed:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload resource')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (resourceId: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return

    setDeleting(resourceId)
    try {
      const res = await fetch(`/api/resources/${resourceId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('Failed to delete resource')
      }

      toast.success('Resource deleted successfully')
      loadResources()
    } catch (error) {
      console.error('[ResourceManager] Delete failed:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete resource')
    } finally {
      setDeleting(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Knowledge Resources</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Upload documents (.md, .txt, .pdf) to enhance AI content generation with your knowledge base
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Upload Section */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload New Resource
            </h3>

            <div className="space-y-2">
              <Label htmlFor="resource-file">Select File (.md, .txt, .pdf)</Label>
              <input
                id="resource-file"
                type="file"
                accept=".md,.txt,.pdf,text/markdown,text/plain,application/pdf"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {selectedFile && (
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(selectedFile.size)})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading & Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Resource
                </>
              )}
            </Button>
          </div>

          {/* Resources List */}
          <div className="space-y-2">
            <h3 className="font-semibold">Uploaded Resources</h3>

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center p-8 border rounded-lg border-dashed">
                <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No resources uploaded yet. Upload your first document to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{resource.name}</div>
                        <div className="text-xs text-muted-foreground flex gap-2">
                          <span>{resource.fileType.toUpperCase()}</span>
                          <span>•</span>
                          <span>{formatFileSize(resource.size)}</span>
                          <span>•</span>
                          <span>{resource.chunkCount} chunks</span>
                          <span>•</span>
                          <span>{new Date(resource.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(resource.id)}
                      disabled={deleting === resource.id}
                    >
                      {deleting === resource.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
