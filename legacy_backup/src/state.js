const safeParseArray = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
};

export const state = {
  products:    [],
  collections: [],
  cart:        safeParseArray('elisee:cart'),
  wishlist:    safeParseArray('elisee:wish'),
  screen:      'home',
  prevScreen:  null,
  activeProduct: null,
  activeVariant:  null,
  activeOptions:  {},
  searchQuery:    '',
  sortOption:     '',
  wishFilter:     false,
  selectedCol:    'all',
  quizStep:       0,
  quizAnswers:    {},
  pageInfo:       { hasNextPage: false, endCursor: null },
  isLoadingMore:  false,
};
