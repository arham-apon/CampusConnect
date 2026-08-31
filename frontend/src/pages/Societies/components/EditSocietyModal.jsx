import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../../config/api';

export default function EditSocietyModal({ society, userEmail, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    logo: null,
    coverPhoto: null,
    description: '',
    establishedYear: '',
    email: '',
    facebook: '',
    website: ''
  })
  const [logoPreview, setLogoPreview] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoRemoved, setLogoRemoved] = useState(false)
  const [coverRemoved, setCoverRemoved] = useState(false)

  useEffect(() => {
    if (society) {
      setFormData({
        name: society.name || '',
        logo: null,
        coverPhoto: null,
        description: society.description || '',
        establishedYear: society.establishedYear || '',
        email: society.email || '',
        facebook: society.facebook || '',
        website: society.website || ''
      })
      setLogoPreview(society.logo || '')
      setCoverPreview(society.coverPhoto || '')
      setLogoRemoved(false)
      setCoverRemoved(false)
    }
  }, [society])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo size should be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      setFormData({ ...formData, logo: file })
      setLogoRemoved(false)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Cover photo size should be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      setFormData({ ...formData, coverPhoto: file })
      setCoverRemoved(false)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.description.trim() || !formData.email.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare data to send
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        establishedYear: formData.establishedYear,
        email: formData.email,
        facebook: formData.facebook,
        website: formData.website,
        userEmail
      }

      // Handle logo: send base64 if new file, empty string if removed, or don't send if unchanged
      if (formData.logo instanceof File) {
        dataToSend.logo = logoPreview
      } else if (logoRemoved) {
        dataToSend.logo = ''
      }

      // Handle cover photo: send base64 if new file, empty string if removed, or don't send if unchanged
      if (formData.coverPhoto instanceof File) {
        dataToSend.coverPhoto = coverPreview
      } else if (coverRemoved) {
        dataToSend.coverPhoto = ''
      }

      const response = await fetch(`${API_BASE_URL}/api/societies/${society._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        onSuccess()
        onClose()
      } else {
        toast.error(data.message || 'Failed to update society')
      }
    } catch (error) {
      console.error('Error updating society:', error)
      toast.error('Failed to update society')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Society Information</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Logo Upload */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Society Logo</label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-[#e50914] focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">Maximum file size: 5MB</p>
                </div>
                {logoPreview && (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-32 w-32 rounded-lg object-cover shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview('')
                        setFormData({ ...formData, logo: null })
                        setLogoRemoved(true)
                      }}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg transition-colors hover:bg-red-600"
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

            {/* Cover Photo Upload */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Cover Photo</label>
              <div className="space-y-3">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-[#e50914] focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">Maximum file size: 5MB</p>
                </div>
                {coverPreview && (
                  <div className="relative">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="h-40 w-full rounded-lg object-cover shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverPreview('')
                        setFormData({ ...formData, coverPhoto: null })
                        setCoverRemoved(true)
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

            {/* Society Name */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Society Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-[#e50914] focus:outline-none"
                placeholder="Enter society name"
                required
              />
            </div>

            {/* Established Year */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Established Year *</label>
              <input
                type="number"
                name="establishedYear"
                value={formData.establishedYear}
                onChange={handleChange}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-[#e50914] focus:outline-none"
                placeholder="2020"
                min="1900"
                max="2100"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-[#e50914] focus:outline-none"
                placeholder="society@example.com"
                required
              />
            </div>

            {/* Facebook */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Facebook URL</label>
              <input
                type="url"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-[#e50914] focus:outline-none"
                placeholder="https://facebook.com/society"
              />
            </div>

            {/* Website */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Website URL</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-[#e50914] focus:outline-none"
                placeholder="https://society.org"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-[#e50914] focus:outline-none"
                placeholder="Enter society description"
                required
              />
            </div>
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
