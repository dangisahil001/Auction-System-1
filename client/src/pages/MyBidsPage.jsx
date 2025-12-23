import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../lib/api';

export default function MyBidsPage() {
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    try {
      const response = await api.get('/bids/my-bids');
      setBids(response.data.bids);
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Bids</h1>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : bids.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Auction</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">My Bid</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Current Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Bid Time</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bids.map((bid) => (
                <tr key={bid._id}>
                  <td className="px-6 py-4">
                    <Link
                      to={`/auctions/${bid.auction?._id}`}
                      className="text-primary-600 hover:underline"
                    >
                      {bid.auction?.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    ${bid.amount.toLocaleString()}
                    {bid.isWinning && (
                      <span className="ml-2 text-xs text-green-600 font-semibold">
                        Highest
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    ${bid.auction?.currentPrice?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                      bid.auction?.status === 'live' ? 'badge-live' :
                      bid.auction?.status === 'upcoming' ? 'badge-upcoming' : 'badge-ended'
                    }`}>
                      {bid.auction?.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(bid.createdAt), 'PPp')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          You haven't placed any bids yet.
        </div>
      )}
    </div>
  );
}
