import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseConfig';
import Header from '../components/Header';
import './AddReviewSearch.css';

function AddReviewSearch() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Add click outside listener
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 2) {
      setShowResults(true);
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('books')
          .select('id, title, author, image_url')
          .or(`title.ilike.%${value}%, author.ilike.%${value}%`)
          .limit(10);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching books:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  const handleAddReview = (bookId) => {
    setShowResults(false);
    navigate(`/add-review/${bookId}`);
  };

  const handleAddNewBook = () => {
    navigate('/add-book', { state: { returnToReview: true } });
  };

  if (!user) {
    return (
      <div>
        <Header user={user} />
        <div className="intro">
          <h2>Please sign in to add a review</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header user={user} />
      <div className="add-review-search-container">
        <h2>Search for a Book to Review</h2>
        <div className="search-section" ref={searchContainerRef}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Enter book title or author..."
            className="search-input"
            onFocus={() => {
              if (searchTerm.length >= 2) {
                setShowResults(true);
              }
            }}
          />
          
          <div className={`search-results ${showResults && searchTerm.length >= 2 ? 'visible' : ''}`}>
            {isSearching ? (
              <div className="searching-message">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((book) => (
                <div 
                  key={book.id} 
                  className="book-result-item"
                  onClick={() => handleAddReview(book.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={book.image_url} 
                    alt={book.title}
                    className="book-thumbnail"
                  />
                  <div className="book-info">
                    <h3>{book.title}</h3>
                    <p>by {book.author}</p>
                  </div>
                  <button 
                    className="add-review-button"
                  >
                    Add Review
                  </button>
                </div>
              ))
            ) : searchTerm.length >= 2 ? (
              <div className="no-results">
                <p>No books found matching your search.</p>
              </div>
            ) : null}
          </div>

          <div className="add-book-section">
            <p>Can't find the book you're looking for?</p>
            <button 
              onClick={handleAddNewBook}
              className="add-book-button"
            >
              Add New Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddReviewSearch; 