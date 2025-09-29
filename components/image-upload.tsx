"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  currentImageUrl?: string
  className?: string
}

export function ImageUpload({ onImageSelect, currentImageUrl, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      onImageSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const clearImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={className}>
      <Label>Product Image</Label>
      <div
        className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <div className="relative w-full h-48 mb-4">
              <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover rounded-lg" />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
            <p className="text-sm text-gray-600">Click to change image or drag a new one</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium">Upload product image</p>
              <p className="text-sm text-gray-600">Drag and drop or click to select</p>
            </div>
          </div>
        )}

        <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" />

        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="mt-4">
          <Upload className="h-4 w-4 mr-2" />
          Select Image
        </Button>
      </div>
    </div>
  )
}
