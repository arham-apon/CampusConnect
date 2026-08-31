import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../../config/api';

export default function EditMemberModal({ member, societyId, userEmail, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    batch: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        position: member.position || '',
        department: member.department || '',
        batch: member.batch || ''
      })
    }
  }, [member])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.position.trim() || !formData.department.trim() || !formData.batch.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    try {
      const url = member._id
        ? `${API_BASE_URL}/api/societies/${societyId}/panel-members/${member._id}`
        : `${API_BASE_URL}/api/societies/${societyId}/panel-members`
      
      const method = member._id ? 'put' : 'post'
      
      const response = await fetch(url, {
        method: method.toUpperCase(),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userEmail })
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
      console.error('Error saving member:', error)
      toast.error('Failed to save member')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {member._id ? 'Edit Panel Member' : 'Add Panel Member'}
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
            <label className="mb-2 block text-sm font-semibold text-gray-700">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-[#e50914] focus:outline-none"
              placeholder="Enter member name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Position *</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-[#e50914] focus:outline-none"
              placeholder="e.g., President, Vice President"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Department *</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-[#e50914] focus:outline-none"
              placeholder="e.g., CSE, EEE"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Batch *</label>
            <input
              type="text"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-[#e50914] focus:outline-none"
              placeholder="e.g., 2021"
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
              {isSubmitting ? 'Saving...' : member._id ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
