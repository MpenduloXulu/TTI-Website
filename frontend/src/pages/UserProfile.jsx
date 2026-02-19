import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import FirebaseService from '../utils/firebase-service';
import { clearUserData, getStoredToken, getStoredUser, isAuthenticated, storeUserData } from '../utils/auth';
import '../styles/pages.css';

const initialFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  organization: '',
  bio: '',
  role: ''
};

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [formState, setFormState] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const loadProfile = useCallback(async (currentUser) => {
    try {
      setLoading(true);
      const data = await FirebaseService.getUserProfile(currentUser.uid);
      const normalised = {
        ...initialFormState,
        ...data,
        email: data.email || currentUser.email,
        role: (data.role || currentUser.role || 'applicant').toLowerCase()
      };
      setProfile(normalised);
      setFormState(normalised);
      setError('');
    } catch (profileError) {
      console.error('Failed to load profile:', profileError);
      setError('Unable to load your profile information. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }

    const stored = getStoredUser();
    if (!stored) {
      navigate('/');
      return;
    }

    setUser(stored);
    loadProfile(stored);
  }, [navigate, loadProfile]);

  const hasChanges = useMemo(() => {
    if (!profile) return false;
    return ['firstName', 'lastName', 'phone', 'organization', 'bio'].some((field) => profile[field] !== formState[field]);
  }, [profile, formState]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value
    }));
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    if (!profile) {
      return;
    }
    setFormState(profile);
    setIsEditing(false);
    setSuccess('');
    setError('');
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    if (!user || !profile) return;

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      setError('');
      await FirebaseService.updateUserProfile(user.uid, {
        firstName: formState.firstName.trim(),
        lastName: formState.lastName.trim(),
        phone: formState.phone.trim(),
        organization: formState.organization.trim(),
        bio: formState.bio.trim()
      });

      const updatedProfile = {
        ...profile,
        firstName: formState.firstName.trim(),
        lastName: formState.lastName.trim(),
        phone: formState.phone.trim(),
        organization: formState.organization.trim(),
        bio: formState.bio.trim()
      };

      setProfile(updatedProfile);
      setFormState(updatedProfile);
      storeUserData({
        ...user,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        phone: updatedProfile.phone,
        organization: updatedProfile.organization
      }, getStoredToken());
      setUser((prev) => ({
        ...prev,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        phone: updatedProfile.phone,
        organization: updatedProfile.organization
      }));
      setSuccess('Profile updated successfully.');
      setIsEditing(false);
    } catch (saveError) {
      console.error('Profile update failed:', saveError);
      setError(saveError.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Deleting your account will remove all associated data. This action cannot be undone. Do you wish to continue?')) {
      return;
    }

    try {
      setDeleting(true);
      await FirebaseService.deleteUserAccount();
      clearUserData();
      navigate('/');
    } catch (deleteError) {
      console.error('Account deletion failed:', deleteError);
      setError(deleteError.message || 'Failed to delete your account. Please sign in again and retry.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await FirebaseService.logoutUser();
    } catch (logoutError) {
      console.error('Logout failed:', logoutError);
    }
    clearUserData();
    navigate('/');
  };

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  return (
    <div className="profile-page">
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <header className="profile-header">
        <div>
          <p className="page-eyebrow">Account &amp; Preferences</p>
          <h1>Personal Profile</h1>
          <p className="page-subtitle">
            Keep your contact information up to date so we can reach you with application updates and funding opportunities.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={() => navigate('/application-status')}>View Application Status</button>
          <button className="btn btn-secondary" onClick={handleSignOut}>Sign Out</button>
        </div>
      </header>

      <div className="profile-layout">
        <aside className="profile-summary">
          <div className="profile-avatar" aria-hidden="true">
            {formState.firstName?.[0]?.toUpperCase() || 'U'}
          </div>
          <h2>{`${formState.firstName || ''} ${formState.lastName || ''}`.trim() || user.email}</h2>
          <p className="profile-role">{(formState.role || 'applicant').replace('-', ' ')}</p>
          <dl>
            <div>
              <dt>Email address</dt>
              <dd className="profile-email">{formState.email}</dd>
            </div>
            {formState.phone && (
              <div>
                <dt>Phone</dt>
                <dd>{formState.phone}</dd>
              </div>
            )}
            {formState.organization && (
              <div>
                <dt>Organisation</dt>
                <dd>{formState.organization}</dd>
              </div>
            )}
          </dl>
          <button
            className="btn btn-danger-outline"
            onClick={handleDeleteAccount}
            disabled={deleting}
          >
            {deleting ? 'Deleting account...' : 'Delete account'}
          </button>
        </aside>

        <section className="profile-form-card">
          <form onSubmit={handleSaveProfile}>
            <div className="form-section">
              <h3>Contact details</h3>
              <p className="form-section-help">Update your personal information so fund administrators can reach you.</p>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formState.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formState.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" value={formState.email} disabled />
                  <p className="form-hint">Email updates are managed by the TTI support team.</p>
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formState.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Professional background</h3>
              <p className="form-section-help">Provide additional context about your organisation or innovation focus.</p>
              <div className="form-group">
                <label htmlFor="organization">Organisation</label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  value={formState.organization}
                  onChange={handleInputChange}
                  placeholder="University, company, or initiative"
                />
              </div>
              <div className="form-group">
                <label htmlFor="bio">Short bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  value={formState.bio}
                  onChange={handleInputChange}
                  placeholder="Summarise your focus areas and innovation goals"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCancelEdit}
                disabled={!isEditing || saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!hasChanges || saving}
              >
                {saving ? 'Saving changes...' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default UserProfile;
