import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseConfig';
import Header from '../components/Header';
import './ReviewDetailPage.css';

function ReviewDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*, books(*)')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) setReview(data);
      } catch (error) {
        console.error('Error fetching review:', error);
        navigate('/not-found');
      } finally {
        setLoading(false);
      }
    };

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchReview();
    getUser();
  }, [id, navigate]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!review) return <div className="not-found">Review not found</div>;

  return (
    <div>
      <Header user={user} />
      <div className="review-detail-container">
        <div className="review-navigation">
          {location.state?.fromMyReviews ? (
            <Link to="/my-reviews" className="back-link">
              ← Back to My Reviews
            </Link>
          ) : (
            <Link to={`/book/${review.book_id}`} className="back-link">
              ← Back to {review.books.title}
            </Link>
          )}
        </div>

        <div className="review-content">
          <div className="review-header">
            <h2>Review by {review.user_name}</h2>
            <div className="rating">
              {'★'.repeat(review.rating)}
              {'☆'.repeat(5 - review.rating)}
            </div>
            <div className="review-date">
              {new Date(review.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="review-image-container">
            <img src={review.image_url} alt="Full Review" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewDetailPage; 