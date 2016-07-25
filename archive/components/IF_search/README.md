# search

## multi-output multi-label classification engines
We run multi-label classification engines for several different kinds of text
tags on each item.  So we end up with something like:
```
item: {
  demographic: ["womens", "adult"],
  category: ["outerwear"],
  specificItem: ["jacket", "coat", "bomber", "bomberjacket"],
  type: ["heavy"],
  style: ["vintage"],
  feelings: ["warm", "comfortable"],
  etc....
}
```

For a simple example, we found that we were able to predict whether an item was
a dress or a shirt with an accuracy of 92% by just looking at the description
text for the item with a naive Bayes gradient descent algorithm.  We can extend
this example to generate many tags from a single source text.




```
sourceText: "3.1 Phillip Lim
  Cropped Flight Jacket, Army

  3.1 Phillip Lim tech fabric flight jacket.
  Knit baseball collar.
  Zip front with ring pull.
  Long sleeves.
  Banded cuffs and hem.
  Cropped above hip.
  Vertical zip pockets.
  Nylon.
  Imported.",

classifierResults: [
  "bomber": 0.88,
  "jacket": .76,
  "crop": 0.41,
  "zipup": .32
]
```


Not only are items classified when they are first scraped, but they are also
re-classified later through the use of aggregate functions.  As we scrape more
data, we refine our model of what a "jacket" is, and so we will be able to tag
items that look like they are jackets but do not yet have the tag.


## classification algorithm
This is a supervised learning problem.  We use a naive Bayes descent gradient algorithm from node-native library.  The
learning set is transformed into a multi-row dataset.
example:

| Item | women | men | adult | kid |
|------|:-----:|:---:|:-----:|:---:|
| 1    | x     |     | x     |     |
| 2    |       | x   | x     |     |
| 3    |       |     |       | x   |


| Item | women | men | adult | kid |
|------|:-----:|:---:|:-----:|:---:|
| 1    | x     |     |       |     |
| 1    |       |     | x     |     |
| 2    |       | x   |       |     |
| 2    |       |     | x     |     |
| 3    |       |     |       | x   |




## Search term weight
Since we have items tagged according to many different categories, we can
specify which search terms get the most weight.  So when a user searcher for
"black jacket" we can give "jacket" higher priority.  That way, we can say that
though the top results are both "black" and "jacket", the next highest priority
will be "jacket", so we would show a blue jacket before we showed black jeans
when we ran out of black jackets.
