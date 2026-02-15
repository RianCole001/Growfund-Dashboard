import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile({ profile = {}, onSave, auth = { loggedIn: false }, onLogout, openEdit = false, onOpenHandled, onClose }) {
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
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg text-white max-w-4xl mx-auto">
      {/* Header with Exit Button */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-blue-400">Profile</h2>
          <div className="mt-2 flex items-center space-x-2">
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${completionColor}`}
                style={{ width: `${completion}%` }}
              ></div>
            </div>
            <span className={`text-sm font-semibold ${completionTextColor}`}>{completion}%</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {auth?.loggedIn && (
            <button 
              onClick={() => onLogout && onLogout()} 
              className="bg-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Log out
            </button>
          )}
          {!editing && (
            <button onClick={() => setEditing(true)} className="bg-blue-600 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors">
              Edit
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose} 
              className="bg-gray-700 p-1.5 rounded-lg hover:bg-gray-600 transition-colors"
              title="Close Profile"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <div className="col-span-1 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden flex items-center justify-center shadow-xl ring-4 ring-gray-700">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-300 text-4xl font-bold">
                {name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            )}
          </div>
          <div className="mt-3 text-sm text-gray-400 text-center">Upload a professional photo</div>
          {editing && (
            <div className="mt-3 w-full">
              <input 
                ref={fileRef} 
                type="file" 
                accept="image/*" 
                onChange={handleAvatar} 
                className="text-sm text-gray-300 w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer" 
              />
            </div>
          )}
        </div>

        {/* Profile Info Section */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
            <div className="mb-3 sm:mb-0">
              <div className="text-2xl font-semibold">{name}</div>
              <div className="text-sm text-gray-400 mt-1">{occupation || 'Occupation'} at {company || 'Company'}</div>
              <div className="text-sm text-gray-400 mt-1">{location || 'Location not set'}</div>
            </div>
            <div className="text-sm text-gray-400 sm:text-right">
              <div className="flex items-center sm:justify-end">
                <span className="text-gray-500 mr-2">📧</span>
                {email}
              </div>
              {phone && (
                <div className="flex items-center sm:justify-end mt-1">
                  <span className="text-gray-500 mr-2">📱</span>
                  {phone}
                </div>
              )}
              {auth && auth.loggedIn && auth.lastLogin && (
                <div className="text-xs text-gray-500 mt-2">
                  Last login: {new Date(auth.lastLogin).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {!editing ? (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <div className="text-sm font-semibold text-gray-300 mb-2">About</div>
              <div className="text-sm text-gray-300">
                {bio || 'No biography provided. Click Edit to add a short professional summary.'}
              </div>
              {website && (
                <div className="mt-3 text-sm">
                  <span className="text-gray-400">Website: </span>
                  <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    {website}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {/* Completion Checklist */}
              <div className="bg-gray-700/50 p-3 rounded-lg mb-4">
                <div className="text-sm font-semibold text-gray-300 mb-2">Profile Completion: {completion}%</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center ${name ? 'text-green-400' : 'text-gray-400'}`}>
                    <span className="mr-1">{name ? '✓' : '○'}</span> Name
                  </div>
                  <div className={`flex items-center ${email ? 'text-green-400' : 'text-gray-400'}`}>
                    <span className="mr-1">{email ? '✓' : '○'}</span> Email
                  </div>
                  <div className={`flex items-center ${phone ? 'text-green-400' : 'text-gray-400'}`}>
                    <span className="mr-1">{phone ? '✓' : '○'}</span> Phone
                  </div>
                  <div className={`flex items-center ${location ? 'text-green-400' : 'text-gray-400'}`}>
                    <span className="mr-1">{location ? '✓' : '○'}</span> Location
                  </div>
                  <div className={`flex items-center ${occupation ? 'text-green-400' : 'text-gray-400'}`}>
                    <span className="mr-1">{occupation ? '✓' : '○'}</span> Occupation
                  </div>
                  <div className={`flex items-center ${company ? 'text-green-400' : 'text-gray-400'}`}>
                    <span className="mr-1">{company ? '✓' : '○'}</span> Company
                  </div>
                  <div className={`flex items-center ${website ? 'text-green-400' : 'text-gray-400'}`}>
                    <span className="mr-1">{website ? '✓' : '○'}</span> Website
                  </div>
                  <div className={`flex items-center ${bio ? 'text-green-400' : 'text-gray-400'}`}>
                    <span className="mr-1">{bio ? '✓' : '○'}</span> Bio
                  </div>
                  <div className={`flex items-center ${avatar ? 'text-green-400' : 'text-gray-400'}`}>
                    <span className="mr-1">{avatar ? '✓' : '○'}</span> Avatar
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Full name</label>
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full bg-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email</label>
                  <input 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full bg-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Phone</label>
                  <input 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="w-full bg-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Location</label>
                  <input 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    className="w-full bg-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Occupation</label>
                  <input 
                    value={occupation} 
                    onChange={(e) => setOccupation(e.target.value)} 
                    className="w-full bg-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Company</label>
                  <input 
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)} 
                    className="w-full bg-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-300 mb-1">Website</label>
                  <input 
                    value={website} 
                    onChange={(e) => setWebsite(e.target.value)} 
                    className="w-full bg-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Short bio</label>
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  rows={4} 
                  className="w-full bg-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button 
                  onClick={save}
                  disabled={saving}
                  className="flex-1 sm:flex-none bg-blue-600 px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  onClick={cancelEdit}
                  disabled={saving}
                  className="flex-1 sm:flex-none bg-gray-600 px-6 py-2.5 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-3 bg-blue-900/30 rounded-lg text-xs text-blue-300 text-center border border-blue-500/30">
        ✓ Your profile data is securely stored in the database and synced in real-time.
      </div>
    </div>
  );
}
