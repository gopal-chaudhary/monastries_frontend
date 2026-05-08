import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { UserCircle, Briefcase, Languages, DollarSign, Phone, Mail, MapPin, Award, CheckCircle } from 'lucide-react'
import { Layout } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { api, getErrorMessage, guideAPI } from '../api'

export default function BecomeGuide() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [monasteries, setMonasteries] = useState([])
  const [step, setStep] = useState(1) // 1: Profile, 2: Monasteries, 3: Subscription
  
  const [formData, setFormData] = useState({
    guideName: '',
    bio: '',
    experience: '',
    languages: ['English'],
    specialization: [],
    contactInfo: {
      phone: '',
      email: user?.emailId || '',
      whatsapp: ''
    },
    profilePhoto: '',
    certificationImages: [],
    selectedMonasteries: [],
    pricing: {
      hourlyRate: '',
      halfDayRate: '',
      fullDayRate: '',
      currency: 'INR'
    },
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  })

  const [subscriptionData, setSubscriptionData] = useState({
    planType: 'monthly',
    autopayDate: new Date().getDate(),
    termsAccepted: false
  })

  const specializationOptions = [
    'Buddhist Culture',
    'History & Heritage',
    'Architecture',
    'Photography',
    'Trekking',
    'Wildlife',
    'Local Cuisine',
    'Meditation & Spirituality'
  ]

  useEffect(() => {
    if (!user) {
      toast.info('Please log in to become a guide')
      navigate('/login')
      return
    }

    // Fetch all monasteries
    api.get('/monasteries')
      .then(({ data }) => setMonasteries(data.data || []))
      .catch((err) => console.error('Failed to fetch monasteries:', err))
  }, [user, navigate])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }))
  }

  const handleLanguageAdd = (lang) => {
    if (lang && !formData.languages.includes(lang)) {
      setFormData(prev => ({ ...prev, languages: [...prev.languages, lang] }))
    }
  }

  const handleLanguageRemove = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== lang)
    }))
  }

  const handleSpecializationToggle = (spec) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec]
    }))
  }

  const handleMonasteryToggle = (monastery) => {
    const isSelected = formData.selectedMonasteries.some(m => m.monasteryId === monastery._id)
    
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        selectedMonasteries: prev.selectedMonasteries.filter(m => m.monasteryId !== monastery._id)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        selectedMonasteries: [
          ...prev.selectedMonasteries,
          { monasteryId: monastery._id, monasteryName: monastery.name }
        ]
      }))
    }
  }

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }))
  }

  const validateStep1 = () => {
    if (!formData.guideName || formData.guideName.length < 3) {
      toast.error('Guide name must be at least 3 characters')
      return false
    }
    if (!formData.bio || formData.bio.length < 50) {
      toast.error('Bio must be at least 50 characters')
      return false
    }
    if (!formData.experience || formData.experience < 0) {
      toast.error('Please enter your years of experience')
      return false
    }
    if (!formData.contactInfo.phone || !formData.contactInfo.email) {
      toast.error('Phone and email are required')
      return false
    }
    if (!formData.pricing.hourlyRate || !formData.pricing.halfDayRate || !formData.pricing.fullDayRate) {
      toast.error('Please fill all pricing fields')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (formData.selectedMonasteries.length === 0) {
      toast.error('Please select at least one monastery')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep(prev => prev + 1)
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!subscriptionData.termsAccepted) {
      toast.error('Please accept the terms and conditions')
      return
    }

    setLoading(true)
    try {
      // First create the guide profile
      const profileResponse = await guideAPI.createGuideProfile(formData)
      toast.success(profileResponse.data.message)

      // Then create the subscription
      const subResponse = await guideAPI.subscribeAsGuide(subscriptionData)
      toast.success(subResponse.data.message)

      // Navigate to guide dashboard
      navigate('/my-guide-profile')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-amber-50 mb-2">
            Become a Tourist Guide
          </h1>
          <p className="text-stone-400">
            Share your knowledge and help visitors explore Sikkim's monasteries
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                  step >= s
                    ? 'bg-amber-500 text-stone-900'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 transition ${
                    step > s ? 'bg-amber-500' : 'bg-stone-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Profile Information */}
        {step === 1 && (
          <div className="glass rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-amber-50 flex items-center gap-2">
              <UserCircle className="w-5 h-5" /> Profile Information
            </h2>

            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Guide Name *</label>
              <input
                type="text"
                value={formData.guideName}
                onChange={(e) => handleInputChange('guideName', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="Your professional name"
              />
            </div>

            <div>
              <label className="block text-sm text-amber-200/90 mb-1">Bio * (min 50 characters)</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="Tell visitors about yourself, your experience, and what makes you a great guide..."
              />
              <p className="text-xs text-stone-500 mt-1">{formData.bio.length} characters</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-amber-200/90 mb-1 flex items-center gap-1">
                  <Briefcase className="w-4 h-4" /> Experience (years) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-amber-200/90 mb-1 flex items-center gap-1">
                  <Phone className="w-4 h-4" /> Phone *
                </label>
                <input
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleNestedInputChange('contactInfo', 'phone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-amber-200/90 mb-1 flex items-center gap-1">
                  <Mail className="w-4 h-4" /> Email *
                </label>
                <input
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleNestedInputChange('contactInfo', 'email', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-amber-200/90 mb-1">WhatsApp (optional)</label>
                <input
                  type="tel"
                  value={formData.contactInfo.whatsapp}
                  onChange={(e) => handleNestedInputChange('contactInfo', 'whatsapp', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-amber-200/90 mb-2 flex items-center gap-1">
                <Languages className="w-4 h-4" /> Languages
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 rounded-lg bg-amber-900/50 text-amber-100 text-sm border border-amber-700/50 flex items-center gap-2"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => handleLanguageRemove(lang)}
                      className="text-amber-300 hover:text-amber-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <select
                onChange={(e) => {
                  handleLanguageAdd(e.target.value)
                  e.target.value = ''
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="">Add a language</option>
                {['Hindi', 'Nepali', 'Bengali', 'Chinese', 'French', 'German', 'Spanish'].map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-amber-200/90 mb-2 flex items-center gap-1">
                <Award className="w-4 h-4" /> Specialization
              </label>
              <div className="flex flex-wrap gap-2">
                {specializationOptions.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => handleSpecializationToggle(spec)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                      formData.specialization.includes(spec)
                        ? 'bg-amber-900/50 text-amber-100 border-amber-700/50'
                        : 'bg-stone-900/60 text-stone-400 border-stone-700/50 hover:border-amber-700/50'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-amber-200/90 mb-2 flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Pricing (in INR) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Hourly Rate</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricing.hourlyRate}
                    onChange={(e) => handleNestedInputChange('pricing', 'hourlyRate', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Half Day (4hrs)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricing.halfDayRate}
                    onChange={(e) => handleNestedInputChange('pricing', 'halfDayRate', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="1500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Full Day (8hrs)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricing.fullDayRate}
                    onChange={(e) => handleNestedInputChange('pricing', 'fullDayRate', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900/80 border border-amber-900/50 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="2500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-amber-200/90 mb-2">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                      formData.availableDays.includes(day)
                        ? 'bg-amber-900/50 text-amber-100 border-amber-700/50'
                        : 'bg-stone-900/60 text-stone-400 border-stone-700/50 hover:border-amber-700/50'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold hover:brightness-110 transition"
            >
              Next: Select Monasteries
            </button>
          </div>
        )}

        {/* Step 2: Select Monasteries */}
        {step === 2 && (
          <div className="glass rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-amber-50 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Select Monasteries
            </h2>
            <p className="text-stone-400 text-sm">
              Choose the monasteries where you want to be listed as a guide. Visitors will see your profile when viewing these monasteries.
            </p>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {monasteries.map((monastery) => {
                const isSelected = formData.selectedMonasteries.some(m => m.monasteryId === monastery._id)
                return (
                  <button
                    key={monastery._id}
                    type="button"
                    onClick={() => handleMonasteryToggle(monastery)}
                    className={`w-full p-4 rounded-xl border transition text-left ${
                      isSelected
                        ? 'bg-amber-900/30 border-amber-700/70'
                        : 'bg-stone-900/60 border-stone-700/50 hover:border-amber-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-amber-500 border-amber-500'
                            : 'border-stone-600'
                        }`}
                      >
                        {isSelected && <CheckCircle className="w-4 h-4 text-stone-900" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-amber-100">{monastery.name}</p>
                        <p className="text-xs text-stone-400">{monastery.region} • {monastery.location?.district || 'Sikkim'}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <p className="text-sm text-stone-400">
              Selected: {formData.selectedMonasteries.length} {formData.selectedMonasteries.length === 1 ? 'monastery' : 'monasteries'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-xl bg-stone-800 text-stone-300 font-semibold hover:bg-stone-700 transition"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold hover:brightness-110 transition"
              >
                Next: Subscription
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Subscription */}
        {step === 3 && (
          <div className="glass rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-amber-50 flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Subscription Plan
            </h2>

            <div className="space-y-3">
              {[
                { type: 'monthly', label: 'Monthly', price: '₹149/month' },
                { type: 'quarterly', label: 'Quarterly', price: '₹399/3 months (Save 11%)' },
                { type: 'annual', label: 'Annual', price: '₹1499/year (Save 16%)' }
              ].map((plan) => (
                <button
                  key={plan.type}
                  type="button"
                  onClick={() => setSubscriptionData(prev => ({ ...prev, planType: plan.type }))}
                  className={`w-full p-4 rounded-xl border transition text-left ${
                    subscriptionData.planType === plan.type
                      ? 'bg-amber-900/30 border-amber-700/70'
                      : 'bg-stone-900/60 border-stone-700/50 hover:border-amber-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-amber-100">{plan.label}</p>
                      <p className="text-sm text-stone-400">{plan.price}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        subscriptionData.planType === plan.type
                          ? 'bg-amber-500 border-amber-500'
                          : 'border-stone-600'
                      }`}
                    >
                      {subscriptionData.planType === plan.type && (
                        <div className="w-2.5 h-2.5 rounded-full bg-stone-900" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-stone-900/60 border border-amber-900/40 rounded-xl p-4">
              <h3 className="font-semibold text-amber-100 mb-2">What's Included:</h3>
              <ul className="space-y-1 text-sm text-stone-300">
                <li>• Profile listing on selected monastery pages</li>
                <li>• Customer reviews and ratings</li>
                <li>• Direct contact information display</li>
                <li>• Priority placement for top-rated guides</li>
                <li>• Monthly analytics dashboard</li>
              </ul>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={subscriptionData.termsAccepted}
                onChange={(e) => setSubscriptionData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                className="mt-1 w-4 h-4 rounded border-amber-900/50 bg-stone-900/80"
              />
              <label htmlFor="terms" className="text-sm text-stone-300">
                I accept the terms and conditions, and agree to pay the monthly subscription fee to maintain my guide profile listing
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-xl bg-stone-800 text-stone-300 font-semibold hover:bg-stone-700 transition"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !subscriptionData.termsAccepted}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold hover:brightness-110 transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Complete Registration'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
