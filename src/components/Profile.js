import React, { useState, useRef, useEffect } from 'react';
import { X, ToggleLeft, ToggleRight, User, Mail, Phone, MapPin, Briefcase, Building, Globe, Edit3, Save, XCircle, Camera, Star, Award, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDemo } from '../demo/DemoContext';

export default function Profile({ profile = {}, onSave, auth = { loggedIn: false }, onLogout, openEdit = false, onOpenHandled, onClose }) {
  const { isDemoMode, enableDemoMode, disableDemoMode } = useDemo();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [occupation, setOccupation] = useState(profile?.occupation || '');
  const [company, setCompany] = useState(profile?.company || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatar, setAvatar] = useState(profile?.avatar || null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    const fields = [name, email, phone, location, occupation, company, website, bio, avatar];
    const filledFields = fields.filter(field => field && field.toString().trim()).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completion = calculateCompletion();
  const completionColor = completion < 33 ? 'bg-red-500' : completion < 66 ? 'bg-yellow-500' : 'bg-green-500';
  const completionTextColor = completion < 33 ? 'text-red-400' : completion < 66 ? 'text-yellow-400' : 'text-green-400';

  useEffect(() => {
    if (openEdit) {
      setEditing(true);
      if (typeof onOpenHandled === 'function') onOpenHandled();
    }
  }, [openEdit, onOpenHandled]);

  const startEdit = () => setEditing(true);
  const cancelEdit = () => {
    setEditing(false);
    setName(profile?.name || ''); 
    setEmail(profile?.email || ''); 
    setPhone(profile?.phone || ''); 
    setLocation(profile?.location || ''); 
    setOccupation(profile?.occupation || ''); 
    setCompany(profile?.company || ''); 
    setWebsite(profile?.website || ''); 
    setBio(profile?.bio || ''); 
    setAvatar(profile?.avatar || null);
  };

  const save = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!name.trim()) {
        toast.error('Name is required');
        return;
      }
      
      if (!email.trim()) {
        toast.error('Email is required');
        return;
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('first_name', name.split(' ')[0] || '');
      formData.append('last_name', name.split(' ').slice(1).join(' ') || '');
      // Don't send email - it's read-only on backend
      formData.append('phone', phone || '');
      formData.append('location', location || '');
      formData.append('occupation', occupation || '');
      formData.append('company', company || '');
      formData.append('website', website || '');
      formData.append('bio', bio || '');
      
      // Handle avatar upload if it's a new file (base64 or File object)
      if (avatar && avatar !== profile?.avatar) {
        if (avatar.startsWith('data:')) {
          // Convert base64 to blob
          const response = await fetch(avatar);
          const blob = await response.blob();
          formData.append('avatar', blob, 'avatar.jpg');
        } else if (avatar instanceof File) {
          formData.append('avatar', avatar);
        }
      }
      
      if (onSave) {
        await onSave(formData);
      }
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    
    // Validate file size (max 5MB)
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    // Validate file type
    if (!f.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(f);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Main Profile Card */}
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Close Button - Top Right Corner */}
          {onClose && (
            <button 
              onClick={onClose} 
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 bg-red-500/90 backdrop-blur-sm p-2 sm:p-2.5 rounded-full hover:bg-red-600/90 transition-all duration-300 transform hover:scale-110 shadow-xl border border-white/20"
              title="Close Profile"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          )}
          
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              {/* Mobile Layout */}
              <div className="block sm:hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white">Profile</h1>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-24 bg-white/20 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${completionColor} shadow-lg`}
                            style={{ width: `${completion}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-bold text-sm">{completion}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  {auth?.loggedIn && (
                    <button 
                      onClick={() => onLogout && onLogout()} 
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 backdrop-blur-sm px-4 py-3 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
                    >
                      Exit Account
                    </button>
                  )}
                  {!editing && (
                    <button 
                      onClick={() => setEditing(true)} 
                      className="flex-1 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl text-white font-semibold hover:bg-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex sm:items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Profile Dashboard</h1>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-40 bg-white/20 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${completionColor} shadow-lg`}
                            style={{ width: `${completion}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-bold text-lg">{completion}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-300" />
                        <span className="text-white text-sm">
                          {completion >= 80 ? 'Expert' : completion >= 60 ? 'Advanced' : completion >= 40 ? 'Intermediate' : 'Beginner'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {auth?.loggedIn && (
                    <button 
                      onClick={() => onLogout && onLogout()} 
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 backdrop-blur-sm px-5 py-2.5 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Log out
                    </button>
                  )}
                  {!editing && (
                    <button 
                      onClick={() => setEditing(true)} 
                      className="bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-xl text-white font-semibold hover:bg-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Demo Mode Toggle Section - Enhanced */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Trading Mode</h3>
                  <p className="text-sm sm:text-base text-gray-300">
                    {isDemoMode 
                      ? "🎭 Demo Mode: Practice with $10,000 virtual USDT" 
                      : "💰 Live Mode: Real trading with actual balance"
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (isDemoMode) {
                    disableDemoMode();
                    toast.success('🚀 Switched to Live Trading!');
                  } else {
                    enableDemoMode();
                    toast.success('🎭 Demo Mode Activated - $10,000 USDT added!');
                  }
                }}
                className={`flex items-center justify-center space-x-2 sm:space-x-3 px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base w-full sm:w-auto ${
                  isDemoMode
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                    : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
                }`}
              >
                {isDemoMode ? (
                  <>
                    <ToggleRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Go Live</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Try Demo</span>
                  </>
                )}
              </button>
            </div>
            {isDemoMode && (
              <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-400/30 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <p className="text-orange-100 font-medium text-sm sm:text-base">
                    <strong>Demo Mode Active:</strong> Perfect for learning! All trades are simulated. 
                    Switch to Live when you're ready for real profits.
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Main Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Avatar Section - Enhanced */}
              <div className="lg:col-span-1">
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 shadow-xl">
                  <div className="text-center">
                    <div className="relative inline-block mb-6">
                      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-1 shadow-2xl">
                        <div className="w-full h-full rounded-full bg-gray-800 overflow-hidden flex items-center justify-center">
                          {avatar ? (
                            <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-white text-4xl font-bold">
                              {name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      {editing && (
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="absolute bottom-2 right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 transform hover:scale-110 shadow-lg"
                        >
                          <Camera className="w-5 h-5 text-white" />
                        </button>
                      )}
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-2">{name || 'Your Name'}</h2>
                    <p className="text-gray-300 mb-4">{occupation || 'Your Profession'}</p>
                    
                    {/* Profile Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-blue-500/20 rounded-2xl p-4 border border-blue-400/30">
                        <div className="text-2xl font-bold text-blue-400">{completion}%</div>
                        <div className="text-sm text-gray-300">Complete</div>
                      </div>
                      <div className="bg-green-500/20 rounded-2xl p-4 border border-green-400/30">
                        <div className="text-2xl font-bold text-green-400">
                          {isDemoMode ? 'Demo' : 'Live'}
                        </div>
                        <div className="text-sm text-gray-300">Mode</div>
                      </div>
                    </div>

                    {editing && (
                      <div className="mt-6">
                        <input 
                          ref={fileRef} 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatar} 
                          className="hidden" 
                        />
                        <p className="text-sm text-gray-400">Click camera icon to upload photo</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Profile Information - Enhanced */}
              <div className="lg:col-span-2">
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 shadow-xl">
                  {!editing ? (
                    <div className="space-y-6">
                      {/* Contact Information */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                          <User className="w-5 h-5 text-blue-400" />
                          <span>Personal Information</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10">
                            <Mail className="w-5 h-5 text-blue-400" />
                            <div>
                              <div className="text-sm text-gray-400">Email</div>
                              <div className="text-white font-medium">{email || 'Not provided'}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10">
                            <Phone className="w-5 h-5 text-green-400" />
                            <div>
                              <div className="text-sm text-gray-400">Phone</div>
                              <div className="text-white font-medium">{phone || 'Not provided'}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10">
                            <MapPin className="w-5 h-5 text-red-400" />
                            <div>
                              <div className="text-sm text-gray-400">Location</div>
                              <div className="text-white font-medium">{location || 'Not provided'}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10">
                            <Briefcase className="w-5 h-5 text-purple-400" />
                            <div>
                              <div className="text-sm text-gray-400">Occupation</div>
                              <div className="text-white font-medium">{occupation || 'Not provided'}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Professional Information */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                          <Building className="w-5 h-5 text-green-400" />
                          <span>Professional Details</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10">
                            <Building className="w-5 h-5 text-yellow-400" />
                            <div>
                              <div className="text-sm text-gray-400">Company</div>
                              <div className="text-white font-medium">{company || 'Not provided'}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10">
                            <Globe className="w-5 h-5 text-cyan-400" />
                            <div>
                              <div className="text-sm text-gray-400">Website</div>
                              <div className="text-white font-medium">
                                {website ? (
                                  <a href={website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                    {website}
                                  </a>
                                ) : 'Not provided'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Biography */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-4">About Me</h3>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <p className="text-gray-300 leading-relaxed">
                            {bio || 'No biography provided. Click Edit to add a professional summary about yourself.'}
                          </p>
                        </div>
                      </div>

                      {/* Account Info */}
                      {auth && auth.loggedIn && auth.lastLogin && (
                        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-400/30">
                          <div className="text-sm text-gray-300">
                            <strong>Last login:</strong> {new Date(auth.lastLogin).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Completion Progress */}
                      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-2xl border border-blue-400/30">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
                          <Award className="w-5 h-5 text-yellow-400" />
                          <span>Profile Completion: {completion}%</span>
                        </h3>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          {[
                            { field: name, label: 'Name', icon: User },
                            { field: email, label: 'Email', icon: Mail },
                            { field: phone, label: 'Phone', icon: Phone },
                            { field: location, label: 'Location', icon: MapPin },
                            { field: occupation, label: 'Job', icon: Briefcase },
                            { field: company, label: 'Company', icon: Building },
                            { field: website, label: 'Website', icon: Globe },
                            { field: bio, label: 'Bio', icon: User },
                            { field: avatar, label: 'Photo', icon: Camera }
                          ].map(({ field, label, icon: Icon }, index) => (
                            <div key={index} className={`flex items-center space-x-2 p-2 rounded-lg ${field ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>
                              <Icon className="w-3 h-3" />
                              <span>{field ? '✓' : '○'} {label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Edit Form */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Full Name</span>
                          </label>
                          <input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>Email Address</span>
                          </label>
                          <input 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                            placeholder="your@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>Phone Number</span>
                          </label>
                          <input 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>Location</span>
                          </label>
                          <input 
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)} 
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                            placeholder="City, Country"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                            <Briefcase className="w-4 h-4" />
                            <span>Occupation</span>
                          </label>
                          <input 
                            value={occupation} 
                            onChange={(e) => setOccupation(e.target.value)} 
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                            placeholder="Your job title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                            <Building className="w-4 h-4" />
                            <span>Company</span>
                          </label>
                          <input 
                            value={company} 
                            onChange={(e) => setCompany(e.target.value)} 
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                            placeholder="Company name"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                            <Globe className="w-4 h-4" />
                            <span>Website</span>
                          </label>
                          <input 
                            value={website} 
                            onChange={(e) => setWebsite(e.target.value)} 
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Professional Bio</label>
                        <textarea 
                          value={bio} 
                          onChange={(e) => setBio(e.target.value)} 
                          rows={4} 
                          className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                          placeholder="Tell us about your professional background, skills, and interests..."
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-4 pt-4">
                        <button 
                          onClick={save}
                          disabled={saving}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 rounded-xl text-white font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                        >
                          <Save className="w-5 h-5" />
                          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                        <button 
                          onClick={cancelEdit}
                          disabled={saving}
                          className="flex-1 bg-gray-600/80 backdrop-blur-sm px-6 py-3 rounded-xl text-white font-bold hover:bg-gray-500/80 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                        >
                          <XCircle className="w-5 h-5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-t border-white/10">
            <div className="text-center">
              <p className="text-sm text-gray-300 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Your profile is securely encrypted and synced in real-time</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}