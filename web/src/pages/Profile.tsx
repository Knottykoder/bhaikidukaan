import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Shield, CheckCircle2, Plus, Trash2, Key, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { useAuthModalStore } from '../stores/authModalStore.js';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useAddAddressMutation,
  useDeleteAddressMutation,
} from '../api/authApi.js';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { user: localUser, isAuthenticated } = useAuthStore();
  const { openLogin, openRegister } = useAuthModalStore();

  const { data: profileUser, isLoading: isLoadingProfile } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [updateProfileApi] = useUpdateProfileMutation();
  const [addAddressApi] = useAddAddressMutation();
  const [deleteAddressApi] = useDeleteAddressMutation();

  const user = profileUser || localUser;

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Prompt sign in if guest
  useEffect(() => {
    if (!isAuthenticated) {
      openLogin();
    }
  }, [isAuthenticated, openLogin]);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const addresses = user?.addresses || [];

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newLine1, setNewLine1] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfileApi({ name, phone }).unwrap();
      toast.success('Profile details updated in database! ✨');
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLine1 || !newCity || !newState || !newPincode) {
      toast.error('Please fill in all address fields');
      return;
    }

    setIsSaving(true);
    try {
      await addAddressApi({
        label: newLabel,
        line1: newLine1,
        city: newCity,
        state: newState,
        pincode: newPincode,
        isDefault: addresses.length === 0,
      }).unwrap();

      setIsAddingAddress(false);
      setNewLine1('');
      setNewCity('');
      setNewState('');
      setNewPincode('');
      toast.success('New address saved to database! 🏡');
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteAddressApi(id).unwrap();
      toast('Address removed from database', { icon: '🗑️' });
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to remove address');
    }
  };


  // Protected State if user is guest
  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', maxWidth: 640 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'rgba(22, 27, 38, 0.8)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 24,
            padding: '48px 32px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: '#818cf8',
            }}
          >
            <Lock size={34} />
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f8fafc', marginBottom: 12 }}>
            Sign In to View Profile
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 32 }}>
            Please log in or create an account to view and update your saved shipping addresses, contact details, and account security preferences.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <button
              onClick={() => openLogin()}
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '0.95rem' }}
            >
              Sign In to Account
            </button>
            <button
              onClick={() => openRegister()}
              className="btn-secondary"
              style={{ padding: '12px 24px', fontSize: '0.95rem' }}
            >
              Create New Account
            </button>
          </div>

          <Link
            to="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#64748b',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            Continue browsing products <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc' }}>
          My Account & Preferences
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Manage your personal details, default shipping addresses, and account security.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 36,
          alignItems: 'start',
        }}
      >
        {/* Left Col: Personal Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Profile Card */}
          <div
            style={{
              background: 'rgba(22, 27, 38, 0.7)',
              borderRadius: 20,
              padding: '28px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <img
                src={user?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=mayank'}
                alt=""
                style={{ width: 64, height: 64, borderRadius: '50%', background: '#1e293b', border: '2px solid #6366f1' }}
              />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                  {name}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#818cf8' }}>{email}</div>
                <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={13} /> Verified Customer Account
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 6, fontWeight: 600 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 6, fontWeight: 600 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 6, fontWeight: 600 }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: 8, padding: '12px 0' }}>
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Account Security Card */}
          <div
            style={{
              background: 'rgba(22, 27, 38, 0.5)',
              borderRadius: 20,
              padding: '24px 28px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Shield size={18} color="#34d399" />
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                Account Security & Protection
              </h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Your account is secured with 256-bit encryption. All checkout sessions and payment transactions are fully verified.
            </p>
          </div>
        </div>

        {/* Right Col: Addresses Management */}
        <div>
          <div
            style={{
              background: 'rgba(22, 27, 38, 0.7)',
              borderRadius: 20,
              padding: '28px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin size={20} color="#818cf8" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                  Saved Addresses ({addresses.length})
                </h3>
              </div>

              {!isAddingAddress && (
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: 8 }}
                >
                  <Plus size={14} /> Add Address
                </button>
              )}
            </div>

            {/* Add Address Form */}
            {isAddingAddress && (
              <form
                onSubmit={handleAddAddress}
                style={{
                  background: 'rgba(10, 14, 22, 0.8)',
                  padding: 18,
                  borderRadius: 14,
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  marginBottom: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>New Delivery Address</div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {['Home', 'Office', 'Other'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setNewLabel(lbl)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 6,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: newLabel === lbl ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Street / Building / Flat"
                  value={newLine1}
                  onChange={(e) => setNewLine1(e.target.value)}
                  className="input-field"
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input
                    type="text"
                    placeholder="City"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="input-field"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <input
                  type="text"
                  placeholder="PIN Code"
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value)}
                  className="input-field"
                  required
                />

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px 0', fontSize: '0.85rem' }}>
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="btn-secondary"
                    style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Address Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  style={{
                    padding: 16,
                    background: 'rgba(10, 14, 22, 0.6)',
                    borderRadius: 14,
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                          Default
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                      {addr.line1}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
