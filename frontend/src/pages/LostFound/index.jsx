import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import GoBackButton from '../../components/GoBackButton'
import ItemCard from './components/ItemCard'
import PostItemForm from './components/PostItemForm'
import Loading from '../../components/Loading'
import { AuthContext } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api';

export default function LostFound() {
  const { User } = AuthContext()
  const [activeTab, setActiveTab] = useState('all')
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/lost-items/all`)
      if (response.data.success) {
        setItems(response.data.items)
        console.log(response.data.items)
      }
    } catch (error) {
      toast.error('Failed to load lost items')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const globalLostItems = items.filter(item => !item.isFound)
  const myItems = items.filter(item => item.ownerId === User?.users_id)
  const myActiveItems = myItems.filter(item => !item.isFound)
  const myFoundItems = myItems.filter(item => item.isFound)

  const handleNewItem = async (formData) => {
    const token = sessionStorage.getItem('authToken')
    
    if (!token) {
      toast.error('Please login to post items')
      throw new Error('No auth token')
    }

    console.log('Sending data to backend:', formData)

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/lost-items/create`,
        formData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      console.log('Backend response:', response.data)
      
      if (response.data.success) {
        fetchItems()
      }
    } catch (error) {
      console.error('Error posting item:', error.response?.data || error.message)
      const errorMsg = error.response?.data?.message || 'Error creating post. Please try again.'
      toast.error(errorMsg)
      throw error // Re-throw so the form knows it failed
    }
  }

  const handleMarkAsFound = async (itemId) => {
    const token = sessionStorage.getItem('authToken')
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/lost-found/found/${itemId}`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      if (response.data.success) {
        toast.success('Item marked as found!')
        fetchItems()
      }
    } catch (error) {
      toast.error('Failed to update item status')
    }
  }

  const handleDeleteItem = async (itemId) => {
    const token = sessionStorage.getItem('authToken')
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/lost-items/delete/${itemId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      if (response.data.success) {
        toast.success('Item deleted successfully!')
        fetchItems()
      }
    } catch (error) {
      toast.error('Failed to delete item')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header showMenuButton={false} />

      <main className="container mx-auto flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GoBackButton />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Lost & Found</h1>
                <p className="mt-1 text-sm text-gray-600">Report and recover lost items on campus</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-6 flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 rounded-xl px-6 py-3 font-semibold transition-all ${activeTab === 'all' ? 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white shadow-lg' : 'bg-white text-gray-700 shadow-md'}`}
                >
                  Lost Items ({globalLostItems.length})
                </button>
                <button
                  onClick={() => setActiveTab('my-items')}
                  className={`flex-1 rounded-xl px-6 py-3 font-semibold transition-all ${activeTab === 'my-items' ? 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white shadow-lg' : 'bg-white text-gray-700 shadow-md'}`}
                >
                  My Items ({myItems.length})
                </button>
              </div>

              {isLoading ? (
                <Loading text="Loading items" />
              ) : (
                <div className="space-y-6">
                  {activeTab === 'all' && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {globalLostItems.map((item, index) => (
                        <ItemCard key={item.item_id} item={item} index={index} onMarkAsFound={handleMarkAsFound} showMarkAsFound={false} isOwnItem={false} />
                      ))}
                    </div>
                  )}

                  {activeTab === 'my-items' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {myActiveItems.map((item, index) => (
                          <ItemCard key={item.item_id} item={item} index={index} onDelete={handleDeleteItem} showMarkAsFound={true} isOwnItem={true} />
                        ))}
                      </div>
                      {myFoundItems.length > 0 && (
                        <div className="pt-8 border-t border-gray-200">
                          <h3 className="text-xl font-bold text-gray-800 mb-4">Found History</h3>
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 opacity-75">
                            {myFoundItems.map((item, index) => (
                              <ItemCard key={item.item_id} item={item} index={index} showMarkAsFound={false} isHistory={true} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <PostItemForm onSubmit={handleNewItem} User={User} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}