import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../../config/api';

export default function EditEventModal({ event, societyId, userEmail, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    image: null,
    description: ''
  })
  const [imagePreview, setImagePreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        image: null,
        description: event.description || ''
      })
      setImagePreview(event.image || '')
    }
  }, [event])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      setFormData({ ...formData, image: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.date || !formData.description.trim()) {
      toast.error('Please fill in required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const url = event._id
        ? `${API_BASE_URL}/api/societies/${societyId}/past-gallery/${event._id}`
        : `${API_BASE_URL}/api/societies/${societyId}/past-gallery`
      
      const method = event._id ? 'put' : 'post'
      
      // Prepare data to send
      const dataToSend = {
        title: formData.title,
        date: formData.date,
        description: formData.description,
        userEmail
      }

      // Convert image to base64 if it's a File object
      if (formData.image instanceof File) {
        dataToSend.image = imagePreview
      }
      
      const response = await fetch(url, {
        method: method.toUpperCase(),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        onSuccess()
        onClose()
      } else {
        toast.error(data.message || 'Operation failed')
      }
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Failed to save event')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {event._id ? 'Edit Past Event' : 'Add Past Event'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-[#e50914] focus:outline-none"
              placeholder="Enter event title"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Event Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-[#e50914] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Event Image</label>
            <div className="space-y-3">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-[#e50914] focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum file size: 5MB</p>
              </div>
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-40 w-full rounded-lg object-cover shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(event.image || '')
                      setFormData({ ...formData, image: null })
                    }}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-colors hover:bg-red-600"
                    title="Remove image"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-[#e50914] focus:outline-none"
              placeholder="Enter event description"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-gradient-to-r from-[#e50914] to-[#b00020] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : event._id ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
