import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FiUsers, FiPackage, FiDollarSign, FiActivity } from 'react-icons/fi';
import api from '../lib/api';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const response = await api.get('/admin/dashboard');
        setStats(response.data.stats);
      } else if (activeTab === 'users') {
        const response = await api.get('/admin/users');
        setUsers(response.data.users);
      } else if (activeTab === 'auctions') {
        const response = await api.get('/admin/auctions');
        setAuctions(response.data.auctions);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (userId, isBanned) => {
    try {
      if (isBanned) {
        await api.post(`/admin/users/${userId}/unban`);
        toast.success('User unbanned');
      } else {
        await api.post(`/admin/users/${userId}/ban`);
        toast.success('User banned');
      }
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleRemoveAuction = async (auctionId) => {
    if (!confirm('Are you sure you want to remove this auction?')) return;

    try {
      await api.delete(`/admin/auctions/${auctionId}`, {
        data: { reason: 'Removed by admin' },
      });
      toast.success('Auction removed');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove auction');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('Role updated');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        {['dashboard', 'users', 'auctions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-1 capitalize ${
              activeTab === tab
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          {/* Dashboard */}
          {activeTab === 'dashboard' && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FiUsers className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold">{stats.users.total}</p>
                    <p className="text-xs text-gray-400">
                      {stats.users.sellers} sellers, {stats.users.bidders} bidders
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FiPackage className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Auctions</p>
                    <p className="text-2xl font-bold">{stats.auctions.total}</p>
                    <p className="text-xs text-gray-400">
                      {stats.auctions.live} live
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <FiActivity className="text-yellow-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Bids</p>
                    <p className="text-2xl font-bold">{stats.bids.total}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FiDollarSign className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      ${stats.revenue.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                          disabled={user.role === 'admin'}
                        >
                          <option value="bidder">Bidder</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {user.isBanned ? (
                          <span className="text-red-600">Banned</span>
                        ) : (
                          <span className="text-green-600">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleBanUser(user._id, user.isBanned)}
                            className={`btn text-sm ${
                              user.isBanned ? 'btn-success' : 'btn-danger'
                            }`}
                          >
                            {user.isBanned ? 'Unban' : 'Ban'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Auctions */}
          {activeTab === 'auctions' && (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Seller</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
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
                        {auction.seller?.firstName} {auction.seller?.lastName}
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
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleRemoveAuction(auction._id)}
                          className="btn btn-danger text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
