import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { supabase } from '../supabaseConfig';
import { requireAuth } from '../utils/auth';
import Header from '../components/Header';
import './MyReviews.css';

function MyReviews() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await requireAuth(navigate, location.pathname);
      if (!user) {
        // If not authenticated, the OAuth redirect will happen
        return;
      }
      setUser(user);

      if (user) {
        // Fetch all reviews by the user, including book details
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            books:book_id (
              id,
              title,
              author,
              image_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reviews:', error);
        } else {
          setReviews(data);
        }
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location]);

  if (!user) {
    return null; // Don't render anything while checking auth
  }

  return (
    <div>
      <Header user={user} />
      <div className="my-reviews-container">
        <h2>My Reviews</h2>
        
        {loading ? (
          <div className="loading">Loading your reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">
            <p>You haven't reviewed any books yet.</p>
            <Link to="/books" className="browse-books-link">Browse Books to Review</Link>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="book-info">
                  <img 
                    src={review.books.image_url} 
                    alt={review.books.title} 
                    className="book-cover"
                  />
                  <div className="book-details">
                    <h3>{review.books.title.trim()}</h3>
                    <p className="author">by {review.books.author}</p>
                  </div>
                </div>
                
                <div className="review-info">
                  <div className="rating">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                  <div className="review-date">
                    Reviewed on {new Date(review.created_at).toLocaleDateString()}
                  </div>
                  <Link 
                    to={`/review/${review.id}`} 
                    className="view-review-link"
                    state={{ fromMyReviews: true }}
                  >
                    View Full Review
                  </Link>
                  <Link 
                    to={`/add-review/${review.book_id}`}
                    state={{ isUpdate: true, reviewId: review.id }}
                    className="edit-review-link"
                  >
                    Edit Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyReviews; 