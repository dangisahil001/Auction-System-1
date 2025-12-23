import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FiClock, FiUser, FiTag, FiEye } from 'react-icons/fi';
import { useAuctionStore } from '../store/auctionStore';
import { useAuthStore } from '../store/authStore';
import { getSocket, joinAuction, leaveAuction } from '../lib/socket';
import CountdownTimer from '../components/CountdownTimer';
import BidForm from '../components/BidForm';
import api from '../lib/api';

export default function AuctionDetailPage() {
  const { id } = useParams();
  const { currentAuction, fetchAuctionById, updateCurrentPrice, isLoading } = useAuctionStore();
  const { isAuthenticated, user } = useAuthStore();
  const [bids, setBids] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchAuctionById(id);
    fetchBids();

    // Join auction room for real-time updates
    joinAuction(id);

    const socket = getSocket();
    
    socket.on('bid-update', (data) => {
      if (data.auctionId === id) {
        updateCurrentPrice(data.currentPrice, data.totalBids, data.highestBidder);
        fetchBids();
        toast.success(`New bid: $${data.currentPrice.toLocaleString()}`);
      }
    });

    socket.on('auction-ended', (data) => {
      if (data.auctionId === id) {
        fetchAuctionById(id);
        toast.info('Auction has ended!');
      }
    });

    return () => {
      leaveAuction(id);
      socket.off('bid-update');
      socket.off('auction-ended');
    };
  }, [id]);

  const fetchBids = async () => {
    try {
      const response = await api.get(`/auctions/${id}/bids`);
      setBids(response.data.bids);
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    }
  };

  if (isLoading || !currentAuction) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        Loading auction details...
      </div>
    );
  }

  const auction = currentAuction;
  const canBid = isAuthenticated && 
    user?.role !== 'admin' && 
    auction.seller?._id !== user?._id && 
    auction.status === 'live';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="bg-gray-200 rounded-xl overflow-hidden h-96">
            {auction.images && auction.images.length > 0 ? (
              <img
                src={auction.images[selectedImage]}
                alt={auction.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
          </div>
          {auction.images && auction.images.length > 1 && (
            <div className="flex gap-2 mt-4">
              {auction.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === idx ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-4">
            <span className={`badge ${
              auction.status === 'live' ? 'badge-live' :
              auction.status === 'upcoming' ? 'badge-upcoming' : 'badge-ended'
            }`}>
              {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">{auction.title}</h1>
          
          <div className="flex items-center gap-4 text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <FiTag /> {auction.category}
            </span>
            <span className="flex items-center gap-1">
              <FiEye /> {auction.views} views
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600 mb-6">
            <FiUser />
            <span>Seller: {auction.seller?.firstName} {auction.seller?.lastName}</span>
          </div>

          {/* Price */}
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500">Current Bid</p>
                <p className="text-3xl font-bold text-primary-600">
                  ${auction.currentPrice?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Starting price: ${auction.startingPrice?.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{auction.totalBids} bids</p>
                <p className="text-sm text-gray-500">
                  Min increment: ${auction.minBidIncrement}
                </p>
              </div>
            </div>

            {/* Timer */}
            {auction.status === 'live' && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Time Remaining</p>
                <CountdownTimer 
                  endTime={auction.endTime} 
                  onEnd={() => fetchAuctionById(id)}
                />
              </div>
            )}

            {auction.status === 'upcoming' && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">
                  Starts: {format(new Date(auction.startTime), 'PPpp')}
                </p>
              </div>
            )}

            {auction.status === 'ended' && auction.winner && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">Winner</p>
                <p className="font-semibold">
                  {auction.winner.firstName} {auction.winner.lastName}
                </p>
              </div>
            )}
          </div>

          {/* Bid Form */}
          {canBid && (
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Place Your Bid</h3>
              <BidForm auction={auction} onBidPlaced={fetchBids} />
            </div>
          )}

          {!isAuthenticated && auction.status === 'live' && (
            <div className="card p-6 mb-6 text-center">
              <p className="text-gray-600 mb-4">Sign in to place a bid</p>
              <Link to="/login" className="btn btn-primary">
                Sign In
              </Link>
            </div>
          )}

          {/* Description */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{auction.description}</p>
          </div>
        </div>
      </div>

      {/* Bid History */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Bid History</h2>
        <div className="card overflow-hidden">
          {bids.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Bidder</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bids.map((bid, index) => (
                  <tr key={bid._id} className={index === 0 ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4">
                      {bid.bidder?.firstName} {bid.bidder?.lastName}
                      {index === 0 && (
                        <span className="ml-2 text-xs text-green-600 font-semibold">
                          Highest
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      ${bid.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {format(new Date(bid.createdAt), 'PPpp')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No bids yet. Be the first to bid!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
