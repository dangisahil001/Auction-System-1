import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function BidForm({ auction, onBidPlaced }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const minBid = auction.currentPrice + auction.minBidIncrement;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: minBid,
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post(`/bids/auction/${auction._id}`, {
        amount: parseFloat(data.amount),
      });
      toast.success('Bid placed successfully!');
      reset({ amount: parseFloat(data.amount) + auction.minBidIncrement });
      onBidPlaced?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Your Bid Amount ($)</label>
        <input
          type="number"
          step="0.01"
          min={minBid}
          {...register('amount', {
            required: 'Bid amount is required',
            min: {
              value: minBid,
              message: `Minimum bid is $${minBid.toLocaleString()}`,
            },
          })}
          className="input"
        />
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Minimum bid: ${minBid.toLocaleString()} (increment: ${auction.minBidIncrement})
        </p>
      </div>
      <button
        type="submit"
        disabled={isSubmitting || auction.status !== 'live'}
        className="btn btn-primary w-full"
      >
        {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
      </button>
    </form>
  );
}
