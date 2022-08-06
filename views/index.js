<div class="all-books-container">
  <h2 class="book-title">Recently Added</h2>
  <ul>
    <% books.forEach(book => { %>
    <li>
      <div class="image-wrapper">
        <img src="/books/<%= book.bookId %>/cover" alt="Loading..." class="img-fluid img-small" height="200" width="150"/>
      </div>
      <a type="button" class="normalBtn" href="/books/<%= book.bookId %>/view">
        View Book
      </a>
    </li>
    <% }) %>
  </ul>
</div>