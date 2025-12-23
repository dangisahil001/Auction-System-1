import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import api from '../lib/api';
import { format } from 'date-fns';

const categories = [
  { id: 'electronics', name: 'Electronics' },
  { id: 'art', name: 'Art' },
  { id: 'collectibles', name: 'Collectibles' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'home', name: 'Home & Garden' },
  { id: 'sports', name: 'Sports' },
  { id: 'vehicles', name: 'Vehicles' },
  { id: 'other', name: 'Other' },
];

export default function MyAuctionsPage() {
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchMyAuctions();
  }, []);

  const fetchMyAuctions = async () => {
    try {
      const response = await api.get('/auctions/user/my-auctions');
      setAuctions(response.data.auctions);
    } catch (error) {
      toast.error('Failed to fetch auctions');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === 'images' && data.images?.length > 0) {
          Array.from(data.images).forEach((file) => {
            formData.append('images', file);
          });
        } else {
          formData.append(key, data[key]);
        }
      });

      await api.post('/auctions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Auction created successfully');
      setShowCreateForm(false);
      reset();
      fetchMyAuctions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create auction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this auction?')) return;

    try {
      await api.delete(`/auctions/${id}`);
      toast.success('Auction deleted');
      fetchMyAuctions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete auction');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Auctions</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus /> Create Auction
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Auction</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input
                type="text"
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 5, message: 'Min 5 characters' },
                })}
                className="input"
                placeholder="e.g., Vintage Rolex Watch"
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 20, message: 'Min 20 characters' },
                })}
                className="input h-32"
                placeholder="Describe your item in detail..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Category</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="input"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="label">Starting Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('startingPrice', {
                    required: 'Starting price is required',
                    min: { value: 0, message: 'Must be positive' },
                  })}
                  className="input"
                />
                {errors.startingPrice && (
                  <p className="text-red-500 text-sm">{errors.startingPrice.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Min Bid Increment ($)</label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue="1"
                  {...register('minBidIncrement', {
                    required: 'Required',
                    min: { value: 1, message: 'Min $1' },
                  })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Start Time</label>
                <input
                  type="datetime-local"
                  {...register('startTime', { required: 'Required' })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">End Time</label>
                <input
                  type="datetime-local"
                  {...register('endTime', { required: 'Required' })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">Images (up to 5)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                {...register('images')}
                className="input"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Creating...' : 'Create Auction'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  reset();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Auctions List */}
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : auctions.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Current Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Bids</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">End Time</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {auctions.map((auction) => (
                <tr key={auction._id}>
                  <td className="px-6 py-4">
                    <Link
                      to={`/auctions/${auction._id}`}
                      className="text-primary-600 hover:underline"
                    >
                      {auction.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                      auction.status === 'live' ? 'badge-live' :
                      auction.status === 'upcoming' ? 'badge-upcoming' : 'badge-ended'
                    }`}>
                      {auction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">${auction.currentPrice.toLocaleString()}</td>
                  <td className="px-6 py-4">{auction.totalBids}</td>
                  <td className="px-6 py-4 text-sm">
                    {format(new Date(auction.endTime), 'PPp')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/auctions/${auction._id}`}
                        className="text-gray-600 hover:text-primary-600"
                      >
                        <FiEdit />
                      </Link>
                      {auction.status !== 'ended' && auction.totalBids === 0 && (
                        <button
                          onClick={() => handleDelete(auction._id)}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          You haven't created any auctions yet.
        </div>
      )}
    </div>
  );
}
