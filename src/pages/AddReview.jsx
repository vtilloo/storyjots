import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseConfig';
import Header from '../components/Header';
import './AddReview.css';

function AddReview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation(); // Get state from router
  const isUpdate = state?.isUpdate;
  const reviewId = state?.reviewId;
  const [user, setUser] = useState(null);
  const [reviewImage, setReviewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    // If this is an update, fetch the existing review
    if (isUpdate && reviewId) {
      const fetchExistingReview = async () => {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('id', reviewId)
          .single();

        if (error) {
          console.error('Error fetching review:', error);
          return;
        }

        if (data) {
          setRating(data.rating);
          // You might want to show the existing image as preview
          setImagePreview(data.image_url);
        }
      };

      fetchExistingReview();
    }
  }, [isUpdate, reviewId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReviewImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('reviews')
      .upload(filePath, file);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('reviews')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewImage && !isUpdate) {
      alert('Please select a review image to upload');
      return;
    }
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = isUpdate ? imagePreview : null;

      // Only upload new image if provided
      if (reviewImage) {
        imageUrl = await uploadImage(reviewImage);
      }

      if (isUpdate) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating: rating,
            image_url: imageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', reviewId);

        if (error) throw error;
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert([{
            book_id: id,
            user_id: user.id,
            user_name: user.user_metadata?.full_name || user.email,
            image_url: imageUrl,
            rating: rating,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      setSuccessMessage(isUpdate ? 'Review updated successfully!' : 'Review submitted successfully!');
      setTimeout(() => navigate(`/book/${id}`), 2000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setSuccessMessage(isUpdate ? 'Error updating review. Please try again.' : 'Error submitting review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="intro">
        <h2>Please sign in to add a review</h2>
      </div>
    );
  }

  return (
    <div>
      <Header user={user} />
      <div className="add-review-container">
        <h2>{isUpdate ? 'Update Your Review' : 'Add Your Review'}</h2>
        <form onSubmit={handleSubmit} className="add-review-form">
          <div className="form-group">
            <label>Rate this book:</label>
            <div className="star-rating">
              {[5, 4, 3, 2, 1].map((star) => (
                <span
                  key={star}
                  className={`star ${(hoverRating || rating) >= star ? 'filled' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Upload Your Review Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="file-input"
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Review preview" />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading || (!reviewImage && !isUpdate) || rating === 0}
          >
            {isLoading ? 'Uploading...' : isUpdate ? 'Update Review' : 'Submit Review'}
          </button>
        </form>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddReview; 