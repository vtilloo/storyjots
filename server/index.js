const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let books = [
  { id: 1, title: 'Book Title', cover: 'book-cover.jpg', stars: 4 },
];

let reviews = [
  { id: 1, bookId: 1, authorId: 1, image: 'review-image.jpg', rating: 4, timestamp: new Date() },
];

app.get('/api/books', (req, res) => {
  res.json(books);
});

app.get('/api/books/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (book) {
    res.json(book);
  } else {
    res.status(404).send('Book not found');
  }
});

app.get('/api/reviews/:bookId', (req, res) => {
  const bookReviews = reviews.filter(r => r.bookId === parseInt(req.params.bookId));
  res.json(bookReviews);
});

app.post('/api/reviews', (req, res) => {
  const newReview = {
    id: reviews.length + 1,
    ...req.body,
  };
  reviews.push(newReview);
  res.status(201).json(newReview);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
