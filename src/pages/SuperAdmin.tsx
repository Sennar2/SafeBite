import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheck } from 'react-icons/fa'

interface Company {
  id: string
  name: string
  description?: string
  address?: string
  email?: string
  phone?: string
  is_active: boolean
  created_at: string
}

interface Location {
  id: string
  company_id: string
  name: string
  address?: string
  phone?: string
  created_at: string
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  company_id?: string
  role: string
  created_at: string
}

export default function SuperAdmin() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'companies' | 'locations' | 'users'>('companies')
  
  // Companies state
  const [companies, setCompanies] = useState<Company[]>([])
  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [companyForm, setCompanyForm] = useState({ name: '', description: '', address: '', email: '', phone: '' })

  // Locations state
  const [locations, setLocations] = useState<Location[]>([])
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [locationForm, setLocationForm] = useState({ name: '', address: '', phone: '', company_id: '' })

  // Users state
  const [users, setUsers] = useState<UserProfile[]>([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [userForm, setUserForm] = useState({ email: '', full_name: '', company_id: '', role: 'manager' })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Check if user is super user
  if (profile?.role !== 'super_user') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-700">Only Super Users can access the Admin Panel.</p>
        </div>
      </div>
    )
  }

  // Load data on tab change
  useEffect(() => {
    if (activeTab === 'companies') fetchCompanies()
    else if (activeTab === 'locations') fetchLocations()
    else if (activeTab === 'users') fetchUsers()
  }, [activeTab])

  // ============================================================================
  // COMPANIES FUNCTIONS
  // ============================================================================

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setCompanies(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCompany = async () => {
    try {
      setLoading(true)
      if (!companyForm.name.trim()) {
        setError('Company name is required')
        return
      }

      if (editingCompany) {
        const { error: updateError } = await supabase
          .from('companies')
          .update(companyForm)
          .eq('id', editingCompany.id)

        if (updateError) throw updateError
        setSuccess('Company updated successfully')
      } else {
        const { error: insertError } = await supabase
          .from('companies')
          .insert([companyForm])

        if (insertError) throw insertError
        setSuccess('Company created successfully')
      }

      setCompanyForm({ name: '', description: '', address: '', email: '', phone: '' })
      setEditingCompany(null)
      setShowCompanyForm(false)
      fetchCompanies()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCompany = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this company? All associated data will be deleted.')) return

    try {
      setLoading(true)
      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setSuccess('Company deleted successfully')
      fetchCompanies()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // LOCATIONS FUNCTIONS
  // ============================================================================

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setLocations(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveLocation = async () => {
    try {
      setLoading(true)
      if (!locationForm.name.trim()) {
        setError('Location name is required')
        return
      }
      if (!locationForm.company_id) {
        setError('Company is required')
        return
      }

      if (editingLocation) {
        const { error: updateError } = await supabase
          .from('locations')
          .update(locationForm)
          .eq('id', editingLocation.id)

        if (updateError) throw updateError
        setSuccess('Location updated successfully')
      } else {
        const { error: insertError } = await supabase
          .from('locations')
          .insert([locationForm])

        if (insertError) throw insertError
        setSuccess('Location created successfully')
      }

      setLocationForm({ name: '', address: '', phone: '', company_id: '' })
      setEditingLocation(null)
      setShowLocationForm(false)
      fetchLocations()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLocation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return

    try {
      setLoading(true)
      const { error: deleteError } = await supabase
        .from('locations')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setSuccess('Location deleted successfully')
      fetchLocations()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // USERS FUNCTIONS
  // ============================================================================

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setUsers(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveUser = async () => {
    try {
      setLoading(true)
      if (!userForm.email.trim()) {
        setError('Email is required')
        return
      }
      if (!userForm.full_name.trim()) {
        setError('Full name is required')
        return
      }

      const updateData: any = {
        email: userForm.email,
        full_name: userForm.full_name,
        role: userForm.role,
      }

      if (userForm.company_id) {
        updateData.company_id = userForm.company_id
      }

      if (editingUser) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', editingUser.id)

        if (updateError) throw updateError
        setSuccess('User updated successfully')
      } else {
        // For new users, we need to create them via Supabase Auth first
        // This is a simplified version - in production, you'd use Supabase Admin API
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ ...updateData, id: crypto.randomUUID() }])

        if (insertError) throw insertError
        setSuccess('User created successfully (Note: User must sign up via the app to activate their account)')
      }

      setUserForm({ email: '', full_name: '', company_id: '', role: 'manager' })
      setEditingUser(null)
      setShowUserForm(false)
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      setLoading(true)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setSuccess('User deleted successfully')
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">👑 Super Admin Panel</h1>
        <p className="text-sm text-gray-600 mt-1">Manage companies, locations, and users</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <FaTimes />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-green-700">{success}</p>
          <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'companies'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          🏢 Companies
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'locations'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          📍 Locations
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          👥 Users
        </button>
      </div>

      {/* Companies Tab */}
      {activeTab === 'companies' && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setShowCompanyForm(true)
              setEditingCompany(null)
              setCompanyForm({ name: '', description: '', address: '', email: '', phone: '' })
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <FaPlus /> Add Company
          </button>

          {showCompanyForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">{editingCompany ? 'Edit Company' : 'Create New Company'}</h3>
              
              <input
                type="text"
                placeholder="Company Name *"
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <textarea
                placeholder="Description"
                value={companyForm.description}
                onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
              />

              <input
                type="text"
                placeholder="Address"
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <input
                type="email"
                placeholder="Email"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <input
                type="tel"
                placeholder="Phone"
                value={companyForm.phone}
                onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleSaveCompany}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <FaCheck /> Save
                </button>
                <button
                  onClick={() => {
                    setShowCompanyForm(false)
                    setEditingCompany(null)
                  }}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <div key={company.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-lg">{company.name}</h4>
                  {company.description && <p className="text-sm text-gray-600">{company.description}</p>}
                  {company.address && <p className="text-xs text-gray-500">📍 {company.address}</p>}
                  {company.email && <p className="text-xs text-gray-500">📧 {company.email}</p>}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setEditingCompany(company)
                        setCompanyForm({
                          name: company.name,
                          description: company.description || '',
                          address: company.address || '',
                          email: company.email || '',
                          phone: company.phone || '',
                        })
                        setShowCompanyForm(true)
                      }}
                      className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 flex items-center justify-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="flex-1 bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 flex items-center justify-center gap-1"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setShowLocationForm(true)
              setEditingLocation(null)
              setLocationForm({ name: '', address: '', phone: '', company_id: '' })
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <FaPlus /> Add Location
          </button>

          {showLocationForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">{editingLocation ? 'Edit Location' : 'Create New Location'}</h3>

              <select
                value={locationForm.company_id}
                onChange={(e) => setLocationForm({ ...locationForm, company_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Company *</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Location Name *"
                value={locationForm.name}
                onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <input
                type="text"
                placeholder="Address"
                value={locationForm.address}
                onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <input
                type="tel"
                placeholder="Phone"
                value={locationForm.phone}
                onChange={(e) => setLocationForm({ ...locationForm, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleSaveLocation}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <FaCheck /> Save
                </button>
                <button
                  onClick={() => {
                    setShowLocationForm(false)
                    setEditingLocation(null)
                  }}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Location</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Company</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Address</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((location) => {
                    const company = companies.find((c) => c.id === location.company_id)
                    return (
                      <tr key={location.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{location.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{company?.name || 'Unknown'}</td>
                        <td className="border border-gray-300 px-4 py-2">{location.address || '-'}</td>
                        <td className="border border-gray-300 px-4 py-2 space-x-2">
                          <button
                            onClick={() => {
                              setEditingLocation(location)
                              setLocationForm({
                                name: location.name,
                                address: location.address || '',
                                phone: location.phone || '',
                                company_id: location.company_id,
                              })
                              setShowLocationForm(true)
                            }}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(location.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setShowUserForm(true)
              setEditingUser(null)
              setUserForm({ email: '', full_name: '', company_id: '', role: 'manager' })
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <FaPlus /> Add User
          </button>

          {showUserForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">{editingUser ? 'Edit User' : 'Create New User'}</h3>

              <input
                type="email"
                placeholder="Email *"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                disabled={!!editingUser}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              />

              <input
                type="text"
                placeholder="Full Name *"
                value={userForm.full_name}
                onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="super_user">Super User</option>
                <option value="company_admin">Company Admin</option>
                <option value="ops">Operations Manager</option>
                <option value="manager">Manager</option>
              </select>

              <select
                value={userForm.company_id}
                onChange={(e) => setUserForm({ ...userForm, company_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Company (Leave empty for Super User)</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveUser}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <FaCheck /> Save
                </button>
                <button
                  onClick={() => {
                    setShowUserForm(false)
                    setEditingUser(null)
                  }}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Company</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const company = companies.find((c) => c.id === user.company_id)
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{user.full_name}</td>
                        <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === 'super_user' ? 'bg-red-100 text-red-800' :
                            user.role === 'company_admin' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'ops' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{company?.name || '-'}</td>
                        <td className="border border-gray-300 px-4 py-2 space-x-2">
                          <button
                            onClick={() => {
                              setEditingUser(user)
                              setUserForm({
                                email: user.email,
                                full_name: user.full_name,
                                company_id: user.company_id || '',
                                role: user.role,
                              })
                              setShowUserForm(true)
                            }}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
