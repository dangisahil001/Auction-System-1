import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors },
  } = useForm();

  const newPassword = watch('newPassword');

  const onSubmitProfile = async (data) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      setIsChangingPassword(false);
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      {/* Profile Info */}
      <div className="card p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-primary-600 hover:underline text-sm"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input
                  type="text"
                  {...register('firstName', { required: 'Required' })}
                  className="input"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Required' })}
                  className="input"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium capitalize">{user?.role}</p>
            </div>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Password</h2>
          <button
            onClick={() => setIsChangingPassword(!isChangingPassword)}
            className="text-primary-600 hover:underline text-sm"
          >
            {isChangingPassword ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {isChangingPassword && (
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                {...registerPassword('currentPassword', { required: 'Required' })}
                className="input"
              />
              {passwordErrors.currentPassword && (
                <p className="text-red-500 text-sm">{passwordErrors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                {...registerPassword('newPassword', {
                  required: 'Required',
                  minLength: { value: 6, message: 'Min 6 characters' },
                })}
                className="input"
              />
              {passwordErrors.newPassword && (
                <p className="text-red-500 text-sm">{passwordErrors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                {...registerPassword('confirmPassword', {
                  required: 'Required',
                  validate: (value) => value === newPassword || 'Passwords do not match',
                })}
                className="input"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-500 text-sm">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>
            <button type="submit" className="btn btn-primary">
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
