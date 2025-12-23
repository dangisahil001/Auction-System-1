import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { format } from 'date-fns';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'outbid':
        return '⚠️';
      case 'auction_won':
        return '🎉';
      case 'auction_lost':
        return '😢';
      case 'auction_ending':
        return '⏰';
      default:
        return '📢';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-primary-600 hover:underline text-sm"
          >
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading notifications...</div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`card p-4 ${!notification.isRead ? 'bg-blue-50 border-l-4 border-primary-500' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    {notification.auction && (
                      <Link
                        to={`/auctions/${notification.auction._id || notification.auction}`}
                        className="text-primary-600 hover:underline text-sm mt-2 inline-block"
                      >
                        View Auction
                      </Link>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {format(new Date(notification.createdAt), 'PPpp')}
                    </p>
                  </div>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="text-gray-400 hover:text-primary-600"
                    title="Mark as read"
                  >
                    <FiCheck size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiBell size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      )}
    </div>
  );
}
