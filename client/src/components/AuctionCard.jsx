import { Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';

export default function AuctionCard({ auction }) {
  const {
    _id,
    title,
    images,
    currentPrice,
    startingPrice,
    status,
    endTime,
    startTime,
    totalBids,
    category,
  } = auction;

  const getStatusBadge = () => {
    switch (status) {
      case 'live':
        return <span className="badge badge-live">Live</span>;
      case 'upcoming':
        return <span className="badge badge-upcoming">Upcoming</span>;
      case 'ended':
        return <span className="badge badge-ended">Ended</span>;
      default:
        return null;
    }
  };

  const getTimeInfo = () => {
    const now = new Date();
    if (status === 'live') {
      return `Ends ${formatDistanceToNow(new Date(endTime), { addSuffix: true })}`;
    }
    if (status === 'upcoming') {
      return `Starts ${formatDistanceToNow(new Date(startTime), { addSuffix: true })}`;
    }
    return `Ended ${formatDistanceToNow(new Date(endTime), { addSuffix: true })}`;
  };

  return (
    <Link to={`/auctions/${_id}`} className="card hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-200">
        {images && images.length > 0 ? (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        <div className="absolute top-2 right-2">{getStatusBadge()}</div>
      </div>
      <div className="p-4">
        <span className="text-xs text-gray-500 uppercase">{category}</span>
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mt-1">
          {title}
        </h3>
        <div className="mt-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Current Bid</p>
              <p className="text-xl font-bold text-primary-600">
                ${currentPrice.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{totalBids} bids</p>
              <p className="text-xs text-gray-400">{getTimeInfo()}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
