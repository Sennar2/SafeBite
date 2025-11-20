import React from 'react'
import { useMultiTenancy } from '../context/MultiTenancyContext'
import { useAuth } from '../context/AuthContext'

/**
 * CompanySelector component for switching between companies
 * Only visible to super users and company admins
 */
export const CompanySelector: React.FC = () => {
  const { companies, selectedCompany, setSelectedCompany } = useMultiTenancy()
  const { profile } = useAuth()

  // Only show for super users and company admins
  if (!profile || (profile.role !== 'super_user' && profile.role !== 'company_admin')) {
    return null
  }

  // Only show if there are multiple companies
  if (companies.length <= 1) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="company-select" className="text-sm font-medium text-gray-700">
        Company:
      </label>
      <select
        id="company-select"
        value={selectedCompany?.id || ''}
        onChange={(e) => {
          const company = companies.find(c => c.id === e.target.value)
          if (company) {
            setSelectedCompany(company)
          }
        }}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
      >
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default CompanySelector
