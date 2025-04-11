import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { supabase } from '../supabaseConfig';
import { requireAuth } from '../utils/auth';
import Header from '../components/Header';
import './AddBookPage.css';

function AddBookPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // Get the book ID from the URL parameters
  const [user, setUser] = useState(null);
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    description: '',
    imageUrl: '', // Changed from image to imageUrl
    ageRating: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await requireAuth(navigate, location.pathname);
      if (!user) {
        // If not authenticated, the OAuth redirect will happen
        return;
      }
      setUser(user);
    };

    checkAuth();
  }, [navigate, location]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      // No need to upload image, use the imageUrl directly
      const { error } = await supabase
        .from('books')
        .insert([{
          title: bookData.title,
          author: bookData.author,
          description: bookData.description,
          image_url: bookData.imageUrl, // Use the imageUrl from Google Books
          age_rating: bookData.ageRating,
          added_by: user.id,
          added_by_name: user.user_metadata?.full_name || user.email,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setSuccessMessage('Book added successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error adding book:', error);
      setSuccessMessage('Error adding book. Please try again.');
    }
  };

  // Debounce function to prevent too many API calls
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Function to fetch book details from Google Books API
  const searchBooks = async (query) => {
    if (!query) return;
    setIsSearching(true);
    console.log('Searching for:', query);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Raw API Response:', data);

      if (data.items && data.items.length > 0) {
        const books = data.items.map(item => {
          console.log('Processing book:', item.volumeInfo);
          return {
            title: item.volumeInfo.title || 'Unknown Title',
            author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown',
            description: item.volumeInfo.description || '',
            imageUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
            ageRating: item.volumeInfo.categories ? item.volumeInfo.categories[0] : ''
          };
        });
        console.log('Processed books:', books);
        setSearchResults(books);
      } else {
        console.log('No books found in response');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced version of searchBooks
  const debouncedSearch = React.useCallback(
    debounce((query) => {
      console.log('Debounced search triggered with:', query);
      searchBooks(query);
    }, 500),
    []
  );

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    console.log('Title changed to:', newTitle);
    setBookData(prev => ({ ...prev, title: newTitle }));
    if (newTitle.length > 2) {
      console.log('Triggering search for:', newTitle);
      debouncedSearch(newTitle);
    } else {
      setSearchResults([]);
    }
  };

  const selectBook = (book) => {
    console.log('Selected book:', book);
    setBookData({
      ...bookData,
      title: book.title,
      author: book.author,
      description: book.description,
      imageUrl: book.imageUrl,
      ageRating: book.ageRating
    });
    setSearchResults([]);
  };

  if (!user) {
    return null; // Don't render anything while checking auth
  }

  console.log('Current search state:', {
    isSearching,
    resultsCount: searchResults.length,
    searchResults
  });

  return (
    <div>
      <Header user={user} />
      <div className="add-book-container">
        <h2>Add a Book</h2>
        <p className="search-instruction">Enter a book title to search and auto-fill book details</p>
        <form onSubmit={handleBookSubmit} className="add-review-form">
          <div className="form-group search-group">
            <label>Search by Title:</label>
            <input
              type="text"
              value={bookData.title}
              onChange={handleTitleChange}
              placeholder="Start typing book title..."
              required
              className="search-input"
              autoComplete="off"
            />
            {isSearching && (
              <div className="searching">Searching for books...</div>
            )}
            {!isSearching && searchResults.length > 0 && (
              <div className="add-book-search-results">
                {searchResults.map((book, index) => (
                  <div 
                    key={index} 
                    className="add-book-search-item"
                    onClick={() => selectBook(book)}
                  >
                    <img 
                      src={book.imageUrl || 'https://via.placeholder.com/40x60?text=No+Cover'} 
                      alt={book.title}
                      className="add-book-thumbnail"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/40x60?text=No+Cover';
                      }}
                    />
                    <div className="add-book-search-info">
                      <div className="add-book-result-title">{book.title}</div>
                      <div className="add-book-result-author">{book.author}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {bookData.author && (
            <div className="auto-filled-details">
              <h3>Selected Book Details:</h3>
              <div className="form-group">
                <label>Author:</label>
                <div className="readonly-value">{bookData.author}</div>
              </div>

              <div className="form-group">
                <label>Description:</label>
                <div className="readonly-value description">{bookData.description}</div>
              </div>

              <div className="form-group">
                <label>Age Rating:</label>
                <div className="readonly-value">{bookData.ageRating}</div>
              </div>

              {bookData.imageUrl && (
                <div className="form-group">
                  <label>Book Cover:</label>
                  <div className="image-preview">
                    <img src={bookData.imageUrl} alt="Book cover preview" />
                  </div>
                </div>
              )}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={!bookData.title || !bookData.author}
          >
            Submit Book
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

export default AddBookPage;
