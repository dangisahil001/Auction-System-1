import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import AuctionCard from '../components/AuctionCard';

export default function HomePage() {
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const [liveRes, upcomingRes] = await Promise.all([
          api.get('/auctions', { params: { status: 'live', limit: 4 } }),
          api.get('/auctions', { params: { status: 'upcoming', limit: 4 } }),
        ]);
        setLiveAuctions(liveRes.data.auctions);
        setUpcomingAuctions(upcomingRes.data.auctions);
      } catch (error) {
        console.error('Failed to fetch auctions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Unique Items at Auction
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Bid on exclusive items from electronics to art, collectibles to vehicles
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/auctions" className="btn bg-white text-primary-600 hover:bg-gray-100">
                Browse Auctions
              </Link>
              <Link to="/register" className="btn border border-white hover:bg-primary-700">
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Auctions */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Live Auctions</h2>
            <Link to="/auctions?status=live" className="text-primary-600 hover:underline">
              View All
            </Link>
          </div>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : liveAuctions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {liveAuctions.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No live auctions at the moment
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Auctions */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Upcoming Auctions</h2>
            <Link to="/auctions?status=upcoming" className="text-primary-600 hover:underline">
              View All
            </Link>
          </div>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : upcomingAuctions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingAuctions.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No upcoming auctions at the moment
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Electronics', 'Art', 'Collectibles', 'Fashion', 'Home', 'Sports', 'Vehicles', 'Other'].map(
              (category) => (
                <Link
                  key={category}
                  to={`/auctions?category=${category.toLowerCase()}`}
                  className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <span className="text-lg font-medium text-gray-700">{category}</span>
                </Link>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
