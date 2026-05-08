import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { User, Star, Eye, Calendar, MapPin, DollarSign, Award, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { Layout } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage, guideAPI } from '../api'

export default function MyGuideProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      toast.info('Please log in to view your guide profile')
      navigate('/login')
      return
    }
    fetchProfile()
  }, [user, navigate])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const [profileRes, subRes] = await Promise.all([
        guideAPI.getMyProfile().catch(() => null),
        guideAPI.getMySubscription().catch(() => null)
      ])
      
      if (profileRes?.data?.data) {
        setProfile(profileRes.data.data)
      } else {
        // No profile exists, redirect to create one
        navigate('/become-guide')
        return
      }
      
      if (subRes?.data?.data) {
        setSubscription(subRes.data.data)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRenewSubscription = async () => {
    if (!confirm('Renew your guide subscription?')) return
    
    setActionLoading(true)
    try {
      const { data } = await guideAPI.renewSubscription()
      toast.success(data.message)
      fetchProfile()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? Your profile will no longer be visible to visitors.')) return
    
    setActionLoading(true)
    try {
      const { data } = await guideAPI.cancelSubscription()
      toast.success(data.message)
      fetchProfile()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteProfile = async () => {
    if (!confirm('Are you sure you want to delete your guide profile? This action cannot be undone.')) return
    
    setActionLoading(true)
    try {
      const { data } = await guideAPI.deleteProfile()
      toast.success(data.message)
      navigate('/')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <p className="text-stone-400">Loading your guide profile...</p>
        </div>
      </Layout>
    )
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-stone-400 mb-4">You don't have a guide profile yet.</p>
            <Link
              to="/become-guide"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold hover:brightness-110 transition"
            >
              Become a Guide
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const isActive = profile.subscriptionStatus === 'active'

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-amber-50">
            My Guide Profile
          </h1>
          <Link
            to="/guide/edit"
            className="px-4 py-2 rounded-xl bg-amber-900/50 text-amber-100 border border-amber-700/50 hover:bg-amber-900/70 transition"
          >
            Edit Profile
          </Link>
        </div>

        {/* Status Banner */}
        <div className={`rounded-2xl p-4 mb-6 border ${
          isActive
            ? 'bg-green-900/20 border-green-700/50'
            : 'bg-red-900/20 border-red-700/50'
        }`}>
          <div className="flex items-center gap-2">
            {isActive ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-100 font-semibold">Active - Your profile is visible to visitors</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-100 font-semibold">Inactive - Your profile is not visible. Renew subscription to activate.</span>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs">Rating</span>
            </div>
            <p className="text-2xl font-bold text-amber-50">
              {profile.rating?.average?.toFixed(1) || '0.0'}
            </p>
            <p className="text-xs text-stone-400">{profile.rating?.count || 0} reviews</p>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-xs">Views</span>
            </div>
            <p className="text-2xl font-bold text-amber-50">{profile.totalViews || 0}</p>
            <p className="text-xs text-stone-400">Total views</p>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Bookings</span>
            </div>
            <p className="text-2xl font-bold text-amber-50">{profile.totalBookings || 0}</p>
            <p className="text-xs text-stone-400">Total bookings</p>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs">Monasteries</span>
            </div>
            <p className="text-2xl font-bold text-amber-50">{profile.selectedMonasteries?.length || 0}</p>
            <p className="text-xs text-stone-400">Listed at</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" /> Profile Details
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-stone-400">Guide Name</p>
              <p className="text-amber-100 font-medium">{profile.guideName}</p>
            </div>

            <div>
              <p className="text-sm text-stone-400">Bio</p>
              <p className="text-stone-300 text-sm leading-relaxed">{profile.bio}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-stone-400">Experience</p>
                <p className="text-amber-100 font-medium">{profile.experience} years</p>
              </div>
              <div>
                <p className="text-sm text-stone-400">Availability</p>
                <p className="text-amber-100 font-medium capitalize">{profile.availability}</p>
              </div>
              <div>
                <p className="text-sm text-stone-400">Verified</p>
                <p className="text-amber-100 font-medium">{profile.isVerified ? 'Yes' : 'Pending'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-stone-400 mb-2">Languages</p>
              <div className="flex flex-wrap gap-2">
                {profile.languages?.map((lang, i) => (
                  <span key={i} className="px-2 py-1 rounded-lg bg-amber-900/50 text-amber-100 text-xs border border-amber-700/50">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {profile.specialization && profile.specialization.length > 0 && (
              <div>
                <p className="text-sm text-stone-400 mb-2">Specialization</p>
                <div className="flex flex-wrap gap-2">
                  {profile.specialization.map((spec, i) => (
                    <span key={i} className="px-2 py-1 rounded-lg bg-stone-900/60 text-stone-300 text-xs border border-stone-700/50">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-stone-400 mb-2 flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Pricing
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-700/50">
                  <p className="text-xs text-stone-400">Hourly</p>
                  <p className="text-amber-100 font-semibold">₹{profile.pricing?.hourlyRate}</p>
                </div>
                <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-700/50">
                  <p className="text-xs text-stone-400">Half Day</p>
                  <p className="text-amber-100 font-semibold">₹{profile.pricing?.halfDayRate}</p>
                </div>
                <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-700/50">
                  <p className="text-xs text-stone-400">Full Day</p>
                  <p className="text-amber-100 font-semibold">₹{profile.pricing?.fullDayRate}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-stone-400">Contact Information</p>
              <div className="mt-2 space-y-1 text-sm text-stone-300">
                <p>📞 {profile.contactInfo?.phone}</p>
                <p>📧 {profile.contactInfo?.email}</p>
                {profile.contactInfo?.whatsapp && <p>💬 WhatsApp: {profile.contactInfo.whatsapp}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Monasteries */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Listed at Monasteries
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.selectedMonasteries?.map((item) => (
              <Link
                key={item.monasteryId?._id || item.monasteryId}
                to={`/monastery/${item.monasteryId?._id || item.monasteryId}`}
                className="p-3 rounded-xl bg-stone-900/60 border border-stone-700/50 hover:border-amber-700/50 transition"
              >
                <p className="font-medium text-amber-100">{item.monasteryName}</p>
                {item.monasteryId?.region && (
                  <p className="text-xs text-stone-400 mt-1">{item.monasteryId.region}</p>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Subscription Details */}
        {subscription && (
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-amber-50 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" /> Subscription Details
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-stone-400">Plan Type</p>
                  <p className="text-amber-100 font-medium capitalize">{subscription.planType}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-400">Monthly Amount</p>
                  <p className="text-amber-100 font-medium">₹{subscription.monthlyAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-400">Status</p>
                  <p className={`font-medium ${subscription.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {subscription.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-400">Next Renewal</p>
                  <p className="text-amber-100 font-medium">
                    {new Date(subscription.nextRenewalDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {subscription.lastPaymentDate && (
                <div>
                  <p className="text-sm text-stone-400">Last Payment</p>
                  <p className="text-stone-300 text-sm">
                    {new Date(subscription.lastPaymentDate).toLocaleDateString()} - {subscription.lastPaymentStatus}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold text-amber-50 mb-4">Actions</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {!isActive && (
              <button
                onClick={handleRenewSubscription}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:brightness-110 transition disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Renew Subscription
              </button>
            )}
            
            {isActive && (
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-900/50 text-amber-100 border border-amber-700/50 hover:bg-amber-900/70 transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Cancel Subscription
              </button>
            )}
            
            <button
              onClick={handleDeleteProfile}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-900/50 text-red-100 border border-red-700/50 hover:bg-red-900/70 transition disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Delete Profile
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
