import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { supabase } from '../supabaseConfig';
import { requireAuth } from '../utils/auth';
import Header from '../components/Header';
import './BookDetailPage.css';

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [book, setBook] = useState(null);
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    const fetchBookAndReviews = async () => {
      try {
        // Fetch book details
        const { data: bookData, error: bookError } = await supabase
          .from('books')
          .select('*')
          .eq('id', id)
          .single();

        if (bookError) throw bookError;
        
        // Fetch reviews for this book
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('book_id', id)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData);

        // Calculate average rating from reviews
        let averageRating = 'No ratings yet';
        if (reviewsData && reviewsData.length > 0) {
          const totalRating = reviewsData.reduce((sum, review) => sum + (parseInt(review.rating) || 0), 0);
          averageRating = totalRating / reviewsData.length;
        }

        // Update book with average rating
        setBook({...bookData, averageRating});

        // Check if user has already reviewed
        if (user) {
          const userReview = reviewsData.find(review => review.user_id === user.id);
          setUserReview(userReview);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    getUser();
    fetchBookAndReviews();
  }, [id, user]);

  // Function to handle clicking on a review
  const handleReviewClick = (review) => {
    setSelectedReview(review);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setSelectedReview(null);
  };

  const handleAddReview = async () => {
    const user = await requireAuth(navigate, `/add-review/${id}`);
    if (!user) {
      // If not authenticated, the OAuth redirect will happen
      return;
    }
    if (userReview) {
      // If updating an existing review
      navigate(`/add-review/${id}`, {
        state: { isUpdate: true, reviewId: userReview.id }
      });
    } else {
      // If adding a new review
      navigate(`/add-review/${id}`);
    }
  };

  if (!book) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <Header user={user} />
      <div className="book-detail-container">
        {/* Add/Update Review Button */}
        <div className="add-review-button-container">
          <span 
            onClick={handleAddReview}
            className="add-review-button"
            style={{ cursor: 'pointer' }}
          >
            {userReview ? 'Update Review' : 'Add a Review'}
          </span>
        </div>

        <div className="book-main-content">
          {/* Left Column - Image */}
          <div className="book-image-section">
            <img src={book.image_url} alt={book.title} className="book-cover" />
          </div>

          {/* Right Column - Details */}
          <div className="book-info-section">
            <h1 className="book-title">{book.title.trim()}</h1>
            <div className="author-line">
              by <span className="author-name">{book.author}</span>
            </div>
            
            <div className="book-metadata">
              <div className="rating">
                Rating: <span>
                  {typeof book.averageRating === 'number' ? (
                    <span className="stars">
                      {'★'.repeat(Math.round(book.averageRating))}
                      {'☆'.repeat(5 - Math.round(book.averageRating))}
                    </span>
                  ) : (
                    book.averageRating
                  )}
                </span>
              </div>
              <div className="age-rating">
                Age Rating: <span>{book.age_rating}</span>
              </div>
              {/* Add other metadata here */}
            </div>

            <div className="book-description">
              <h3>About this book</h3>
              <p>{book.description}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2>Kids Reviews</h2>
          {reviews.length > 0 ? (
            <div className="reviews-carousel">
              {reviews.map((review) => (
                <Link 
                  key={review.id} 
                  to={`/review/${review.id}`}
                  className="review-thumbnail"
                >
                  {review.image_url && (
                    <div className="thumbnail-image">
                      <img src={review.image_url} alt="Review" />
                    </div>
                  )}
                  <div className="thumbnail-details">
                    <span className="reviewer-name">{review.user_name}</span>
                    <div className="rating">
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="no-reviews">No reviews yet.</p>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedReview && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            <div className="modal-review">
              <div className="modal-review-header">
                <span className="reviewer-name">{selectedReview.user_name}</span>
                <div className="rating">
                  {'★'.repeat(selectedReview.rating)}
                  {'☆'.repeat(5 - selectedReview.rating)}
                </div>
              </div>
              <div className="modal-review-image">
                <img src={selectedReview.image_url} alt="Full Review" />
              </div>
              <div className="modal-review-date">
                {new Date(selectedReview.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookDetailPage;