import React, { useState, useRef, useEffect } from 'react';

export default function Profile({ profile = {}, onSave, auth = { loggedIn: false }, onLogin, onLogout, openEdit = false, onOpenHandled }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name || 'Jane Doe');
  const [email, setEmail] = useState(profile.email || 'jane@example.com');
  const [phone, setPhone] = useState(profile.phone || '');
  const [location, setLocation] = useState(profile.location || '');
  const [occupation, setOccupation] = useState(profile.occupation || '');
  const [company, setCompany] = useState(profile.company || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatar, setAvatar] = useState(profile.avatar || null);
  const fileRef = useRef();

  useEffect(() => {
    if (openEdit) {
      setEditing(true);
      if (typeof onOpenHandled === 'function') onOpenHandled();
    }
  }, [openEdit, onOpenHandled]);

  const startEdit = () => setEditing(true);
  const cancelEdit = () => {
    setEditing(false);
    setName(profile.name || ''); setEmail(profile.email || ''); setPhone(profile.phone || ''); setLocation(profile.location || ''); setOccupation(profile.occupation || ''); setCompany(profile.company || ''); setWebsite(profile.website || ''); setBio(profile.bio || ''); setAvatar(profile.avatar || null);
  };

  const save = () => {
    const next = { ...profile, name, email, phone, location, occupation, company, website, bio, avatar };
    onSave && onSave(next);
    setEditing(false);
  };

  const handleAvatar = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(f);
  };

  const login = () => {
    const em = window.prompt('Enter email to sign in:', email || '');
    if (!em) return;
    if (onLogin) onLogin({ email: em });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-blue-400">Profile</h2>
        <div className="flex items-center space-x-2">
          {!auth.loggedIn ? (
            <button onClick={login} className="bg-green-600 px-3 py-1 rounded">Log in</button>
          ) : (
            <button onClick={() => onLogout && onLogout()} className="bg-red-600 px-3 py-1 rounded">Log out</button>
          )}
          {!editing ? <button onClick={startEdit} className="bg-blue-600 px-3 py-1 rounded">Edit</button> : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
            {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : <div className="text-gray-400">No Image</div>}
          </div>
          <div className="mt-3 text-sm text-gray-300">Upload a professional photo</div>
          {editing && (
            <div className="mt-3">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="text-sm text-gray-300" />
            </div>
          )}
        </div>

        <div className="col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-semibold">{name}</div>
              <div className="text-sm text-gray-400">{occupation || 'Occupation'} at {company || 'Company'}</div>
              <div className="text-sm text-gray-400 mt-1">{location}</div>
            </div>
            <div className="text-sm text-gray-400 text-right">
              <div>{email}</div>
              <div>{phone}</div>
              {auth && auth.loggedIn && auth.lastLogin && <div className="text-xs text-gray-500">Last login: {new Date(auth.lastLogin).toLocaleString()}</div>}
            </div>
          </div>

          {!editing ? (
            <div className="mt-4 text-sm text-gray-300">{bio || 'No biography provided. Click Edit to add a short professional summary.'}</div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300">Full name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300">Location</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300">Occupation</label>
                  <input value={occupation} onChange={(e) => setOccupation(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300">Company</label>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-300">Website</label>
                  <input value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-1 w-full bg-gray-700 rounded p-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300">Short bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="mt-1 w-full bg-gray-700 rounded p-2" />
              </div>

              <div className="flex items-center space-x-2">
                <button onClick={save} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Save</button>
                <button onClick={cancelEdit} className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="mt-6 text-sm text-gray-400">Your profile data is stored locally for demo purposes. In a production app you'd connect this to your user service with secure storage.</div>
    </div>
  );
}
