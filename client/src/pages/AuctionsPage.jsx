import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { useAuctionStore } from '../store/auctionStore';
import AuctionCard from '../components/AuctionCard';

const categories = [
  { id: '', name: 'All Categories' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'art', name: 'Art' },
  { id: 'collectibles', name: 'Collectibles' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'home', name: 'Home & Garden' },
  { id: 'sports', name: 'Sports' },
  { id: 'vehicles', name: 'Vehicles' },
  { id: 'other', name: 'Other' },
];

const statuses = [
  { id: '', name: 'All Status' },
  { id: 'live', name: 'Live' },
  { id: 'upcoming', name: 'Upcoming' },
  { id: 'ended', name: 'Ended' },
];

export default function AuctionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { auctions, pagination, isLoading, fetchAuctions } = useAuctionStore();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAuctions({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      status: searchParams.get('status') || '',
      page: searchParams.get('page') || 1,
    });
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    setSearchParams(params);
  };

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Auctions</h1>

      {/* Search and Filters */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search auctions..."
              className="input pl-10"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary md:hidden"
          >
            <FiFilter />
          </button>
        </form>

        <div className={`md:flex gap-4 ${showFilters ? 'block' : 'hidden md:flex'}`}>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setTimeout(handleFilterChange, 0);
            }}
            className="input mb-2 md:mb-0 md:w-48"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setTimeout(handleFilterChange, 0);
            }}
            className="input md:w-48"
          >
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">Loading auctions...</div>
      ) : auctions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {auctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded ${
                    page === pagination.page
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No auctions found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}
