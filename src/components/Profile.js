import React, { useState, useRef, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Briefcase, Building, Globe, Edit3, Save, XCircle, Camera, Users, Gift, Copy, Check, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDemo } from '../demo/DemoContext';
import Referrals from './Referrals';
import TransactionHistory from './TransactionHistory';

export default function Profile({ profile = {}, onSave, auth = { loggedIn: false }, onLogout, onClose, transactions = [] }) {
  const { isDemoMode, enableDemoMode, disableDemoMode } = useDemo();
  const [activeTab, setActiveTab] = useState('profile');
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
      
      if (!name.trim()) {
        toast.error('Name is required');
        return;
      }
      
      if (!email.trim()) {
        toast.error('Email is required');
        return;
      }
      
      const formData = new FormData();
      formData.append('first_name', name.split(' ')[0] || '');
      formData.append('last_name', name.split(' ').slice(1).join(' ') || '');
      formData.append('phone', phone || '');
      formData.append('location', location || '');
      formData.append('occupation', occupation || '');
      formData.append('company', company || '');
      formData.append('website', website || '');
      formData.append('bio', bio || '');
      
      if (avatar && avatar !== profile?.avatar) {
        if (avatar.startsWith('data:')) {
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
      toast.success('Profile updated successfully');
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
    
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    if (!f.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(f);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 rounded-t-2xl">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-green-100 overflow-hidden flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-green-600" />
                    )}
                  </div>
                </div>
                {editing && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors shadow-lg"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{name || 'Your Name'}</h2>
                <p className="text-green-100">{email || 'your@email.com'}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex-1 bg-white/20 rounded-full h-2 max-w-xs">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-500"
                      style={{ width: `${completion}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-semibold text-sm">{completion}%</span>
                </div>
              </div>
              {!editing && (
                <button 
                  onClick={() => setEditing(true)} 
                  className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex space-x-1 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === 'profile'
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Profile
                {activeTab === 'profile' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === 'transactions'
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List className="w-4 h-4 inline mr-2" />
                Transactions
                {activeTab === 'transactions' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('referrals')}
                className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === 'referrals'
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Referrals
                {activeTab === 'referrals' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {!editing ? (
                  <>
                    {/* View Mode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="text-xs text-gray-500">Email</div>
                            <div className="font-medium text-gray-800">{email || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="text-xs text-gray-500">Phone</div>
                            <div className="font-medium text-gray-800">{phone || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="text-xs text-gray-500">Location</div>
                            <div className="font-medium text-gray-800">{location || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <Briefcase className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="text-xs text-gray-500">Occupation</div>
                            <div className="font-medium text-gray-800">{occupation || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <Building className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="text-xs text-gray-500">Company</div>
                            <div className="font-medium text-gray-800">{company || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="text-xs text-gray-500">Website</div>
                            <div className="font-medium text-gray-800 truncate">
                              {website ? (
                                <a href={website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                                  {website}
                                </a>
                              ) : 'Not provided'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-500 mb-2">About Me</div>
                      <p className="text-gray-800 leading-relaxed">
                        {bio || 'No biography provided. Click Edit to add information about yourself.'}
                      </p>
                    </div>

                    {/* Demo Mode Toggle */}
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Gift className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-semibold text-gray-800">Demo Mode</div>
                            <div className="text-sm text-gray-600">
                              {isDemoMode ? 'Practice with $10,000 virtual USDT' : 'Live trading with real balance'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (isDemoMode) {
                              disableDemoMode();
                              toast.success('Switched to Live Trading');
                            } else {
                              enableDemoMode();
                              toast.success('Demo Mode Activated');
                            }
                          }}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            isDemoMode
                              ? 'bg-orange-500 hover:bg-orange-600 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {isDemoMode ? 'Go Live' : 'Try Demo'}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Edit Mode */}
                    <input 
                      ref={fileRef} 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatar} 
                      className="hidden" 
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" 
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-500 cursor-not-allowed" 
                          placeholder="your@email.com"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" 
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input 
                          value={location} 
                          onChange={(e) => setLocation(e.target.value)} 
                          className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" 
                          placeholder="City, Country"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                        <input 
                          value={occupation} 
                          onChange={(e) => setOccupation(e.target.value)} 
                          className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" 
                          placeholder="Your job title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                        <input 
                          value={company} 
                          onChange={(e) => setCompany(e.target.value)} 
                          className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" 
                          placeholder="Company name"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <input 
                          value={website} 
                          onChange={(e) => setWebsite(e.target.value)} 
                          className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" 
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                        rows={4} 
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" 
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={save}
                        disabled={saving}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Save className="w-5 h-5" />
                        <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                      <button 
                        onClick={cancelEdit}
                        disabled={saving}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'transactions' && (
              <div>
                <TransactionHistory transactions={transactions} />
              </div>
            )}

            {activeTab === 'referrals' && (
              <div>
                <Referrals />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {auth?.loggedIn && auth?.lastLogin && (
                <span>Last login: {new Date(auth.lastLogin).toLocaleString()}</span>
              )}
            </div>
            <button 
              onClick={onLogout} 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
