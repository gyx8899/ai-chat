import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { useTranslation } from './useTranslation'
import type { ImageAttachment } from '@/types'

export interface UseImageUploadOptions {
  maxImages?: number
  maxSizeMB?: number
  acceptTypes?: string[]
}

export interface UseImageUploadReturn {
  attachments: ImageAttachment[]
  hasAttachment: boolean
  addFiles: (files: FileList | null) => Promise<void>
  removeAt: (index: number) => void
  clearAll: () => void
  dragOver: boolean
  dragHandlers: {
    onDragOver: (e: React.DragEvent) => void
    onDragLeave: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent) => void
  }
  fileInputRef: React.RefObject<HTMLInputElement | null>
  triggerFileSelect: () => void
}

const DEFAULT_MAX_IMAGES = 5
const DEFAULT_MAX_SIZE_MB = 10
const DEFAULT_ACCEPT_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const { tv } = useTranslation()
  const {
    maxImages = DEFAULT_MAX_IMAGES,
    maxSizeMB = DEFAULT_MAX_SIZE_MB,
    acceptTypes = DEFAULT_ACCEPT_TYPES,
  } = options

  const [attachments, setAttachments] = useState<ImageAttachment[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const validateAndReadFile = useCallback(
    (file: File): Promise<ImageAttachment | null> => {
      return new Promise(resolve => {
        if (!acceptTypes.includes(file.type)) {
          const types = acceptTypes.map(t => t.replace('image/', '').toUpperCase()).join('、')
          toast.error(tv('input.imageTypeError', { types }))
          resolve(null)
          return
        }
        if (file.size > maxSizeBytes) {
          toast.error(tv('input.imageSizeError', { maxSize: maxSizeMB }))
          resolve(null)
          return
        }
        const reader = new FileReader()
        reader.onload = () => {
          resolve({
            type: 'image',
            name: file.name,
            dataUrl: reader.result as string,
            size: file.size,
          })
        }
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(file)
      })
    },
    [acceptTypes, maxSizeBytes, maxSizeMB, tv]
  )

  const addFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      const availableSlots = maxImages - attachments.length
      if (availableSlots <= 0) {
        toast.error(tv('input.imageMaxError', { max: maxImages }))
        return
      }
      const filesToProcess = Array.from(files).slice(0, availableSlots)
      const results = await Promise.all(filesToProcess.map(validateAndReadFile))
      const valid = results.filter((a): a is ImageAttachment => a !== null)
      if (valid.length > 0) {
        setAttachments(prev => [...prev, ...valid])
      }
    },
    [attachments.length, maxImages, validateAndReadFile, tv]
  )

  const removeAt = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearAll = useCallback(() => {
    setAttachments([])
  }, [])

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOver(false)
      addFiles(e.dataTransfer.files)
    },
    [addFiles]
  )

  return {
    attachments,
    hasAttachment: attachments.length > 0,
    addFiles,
    removeAt,
    clearAll,
    dragOver,
    dragHandlers: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
    fileInputRef,
    triggerFileSelect,
  }
}
