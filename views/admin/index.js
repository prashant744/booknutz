<div class="admin-container">
  <h2 class="admin-page-title">Ebook Cover Upload Page</h2>

  <form action="/books/upload" method="POST" enctype="multipart/form-data">
    <ul>
      <li>
        <div class="section-container">
          <label for="file" class="section-title">Choose File</label>
          <input type="file" required name="file" class="section-input" />
        </div>
      </li>

      <li>
        <div class="section-container">
          <label class="section-title">Title</label>
          <input name="title" required minlength="5" class="section-input" />
        </div>
      </li>

      <li>
        <div class="section-container">
          <label class="section-title">Description</label>
          <textarea
            class="section-input"
            name="description"
            required
            minlength="10"
          ></textarea>
        </div>
      </li>
    </ul>

    <button type="submit">Upload</button>
  </form>

  <div class="books-grid">
    <% if(books == null || books.length == 0) { %>
    <h3>No books present in the database</h3>
    <% } else { %>
    <ul>
      <% books.forEach(book => { %>
      <li>
        <div>
          <h2><%= book.title %></h2>
          <h3><%= book.description %></h3>
          <img
            src="/books/<%= book.bookId %>/cover"
            alt="Loading..."
            class="img-fluid img-small"
            height="200"
            width="150"
          />
          <form action="/books/<%= book.bookId %>?_method=DELETE" method="POST">
            <button type="submit">Delete Book</button>
          </form>
        </div>
      </li>
      <% }) %>
    </ul>
    <% } %>
  </div>
</div>