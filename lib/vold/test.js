var util = require('util');
var n1ql = require('./n1ql');
var esprima = require('esprima');

var qs = [];

function _logFunctor(f) {
  var fStr = f.toString();
  var fParsed = esprima.parse(fStr);
  console.log(fStr);
  console.log(util.inspect(fParsed, {depth: null}));
  return this;
}
var n1ql6 = {
  from: function(name) {
    return this;
  },
  select: _logFunctor,
  where: _logFunctor,
  orderBy: _logFunctor,
};

function FakeExpr(str) {
  this.str = str;
}
FakeExpr.prototype.as = function(x) {
  return this.str + ' AS ' + x;
};
function DISTINCT(x) {
  return new FakeExpr('DISTINCT ' + x);
}
function DATE_PART_STR(x, y) {
  return new FakeExpr('DATE_PART_STR( ' + x + ', ' + y + ')');
}
function IS_NOT_MISSING(x) {
  return new FakeExpr(x + ' IS NOT MISSING');
}







/*
 SELECT name, author
 FROM books
 */
qs.push(n1ql
  .select('name', 'author')
  .from('books'));

n1ql6
  .from('books')
  .select((books) => { books.name, books.author });


/*
 SELECT name, author
 FROM books
 WHERE DATE_PART_STR(published, "year") >= 2014
 */
qs.push(n1ql
  .select('name', 'author')
  .from('books')
  .where(n1ql.f.DATE_PART_STR(n1ql.i('published'), 'year').gt(2014)));

n1ql6
  .from('books')
  .select((books) => { books.name, books.author })
  .where((books) => { DATE_PART_STR(books.published, 'YEAR') > 2014 });


/*
 SELECT name, DATE_PART_STR(published, "year") as published
 FROM  books
 WHERE author = "Alastair Reynolds"
 ORDER BY published
 */
qs.push(n1ql
  .select('name', n1ql.f.DATE_PART_STR(n1ql.i('published'), 'year').as('published'))
  .from('books')
  .where(n1ql.i('author').eq('Alastair Reynolds'))
  .orderBy(n1ql.i('published')));

n1ql6
  .from('books')
  .select((books) => { books.name, DATE_PART_STR(books.published, 'year').as('published') })
  .where((books) => { books.author == 'Alastair Reynolds' })
  .orderBy((published) => { published })


/*
 SELECT DISTINCT(series), author
 FROM books
 WHERE series IS NOT MISSING
 ORDER BY series
 */
qs.push(n1ql
  .select(n1ql.f.DISTINCT(n1ql.i('series')), n1ql.i('author'))
  .from(n1ql.i('books'))
  .where(n1ql.i('series').isNotMissing())
  .orderBy(n1ql.i('series')));

n1ql6
  .from('books')
  .select((books) => { DISTINCT(books.series), books.author })
  .where((books) => { IS_NOT_MISSING(books.series) })
  .orderBy((books) => { books.series });

n1ql6
  .from('books')
  .select((books) => [ DISTINCT(books.series), books.author ])
  .where((books) => IS_NOT_MISSING(books.series) )
  .orderBy((books) => books.series)


/*
 SELECT book, AVG(rating) AS average
 FROM reviews
 GROUP BY book
 HAVING COUNT(*) > 100000
 ORDER BY average DESC
 */



/*
 SELECT b.name, DATE_PART_STR(a.year, "year") as year, a.name as award
 FROM awards a INNER JOIN books b
 ON KEYS a.book_id
 ORDER BY b.name, year, award
 */
qs.push(n1ql
  .select(n1ql.i('b', 'name'), n1ql.f.DATE_PART_STR(n1ql.i('a', 'year'), 'year').as('year'), n1ql.i('a', 'name').as('award'))
  .from(n1ql.i('awards').as('a'))
  .innerJoin(n1ql.i('books').as('b'), n1ql.i('a', 'book_id'))
  .orderBy(n1ql.i('b', 'name'), n1ql.i('year'), n1ql.i('award')));

n1ql6
  .from('awards', 'a')
  .join('books', (a) => a.book_id, 'b')
  .select((b, awards) => [ b.name, DATE_PART_STR(awards.year, 'year').as('year'), awards.name.as('award') ])
  .orderBy((b, year, award) => [b.name, year, award]);

/*
 SELECT b.name, b.author
 FROM books b
 WHERE EXISTS (
 SELECT id
 FROM authors
 USE KEYS b.author_id
 WHERE country = "UK")
 */


/*
 SELECT name, "Book" as type
 FROM books
 WHERE favorite = TRUE
 UNION ALL (
 SELECT name, "Movie" as type
 FROM movies
 WHERE favorite = TRUE)
 ORDER BY name
 */



for (var i = 0; i < qs.length; ++i) {
  console.log(util.inspect(qs[i], {depth: null}));
  console.log(qs[i].toString());
}
