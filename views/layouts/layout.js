<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content="Ebooks for users, by users" />
    <meta
      name="keywords"
      content="Buy ebook,ebooks,Online books,pdfs,book,authors"
    />

    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>booknutz</title>

    <link
      rel="shortcut icon"
      href="/img/logo.jpg"
      type="image/x-icon"
    />

    <link rel="preload" href="/css/main.css" as="style" />
    <link rel="preload" href="/css/book.css" as="style" />
    <link rel="preload" href="/css/navbar.css" as="style" />
    <link rel="preload" href="/css/auth.css" as="style" />
    <link rel="stylesheet" href="/css/main.css" />
  </head>
  <body>
    <% 
    <!-- Adding the passed locals in the local ejs variables, else it will give the variable not defined error in ejs files-->
    user = locals.user ?? null;
    error_msg = locals.error_msg ?? '';
    success_msg = locals.success_msg ?? '';
    books = locals.books ?? '';
    mailJustSent = locals.mailJustSent ?? false;
    %>
    <%- include('../partials/_header.ejs') %> <%-
    include('../partials/_error_success_page.ejs') %> <%- body %>
  </body>
</html>