import type { Query as Query_uxwf3e } from '../pages/book';
import type { Query as Query_1dtd1kj } from '../pages/book/edit';
import type { Query as Query_zm4wiw } from '../pages/book/edit/topic/edit';
import type { Query as Query_1iif9lm } from '../pages/book/edit/topic/new';
import type { Query as Query_as145q } from '../pages/book/import';
import type { Query as Query_1dghkr3 } from '../pages/book/import/topic/edit';
import type { Query as Query_wgwco5 } from '../pages/book/linking';
import type { Query as Query_1auyuvz } from '../pages/book/new';
import type { Query as Query_1q5x398 } from '../pages/book/overwrite';
import type { Query as Query_1mel52s } from '../pages/book/release';
import type { Query as Query_1y3xtbv } from '../pages/book/topic/edit';
import type { Query as Query_17e5mra } from '../pages/book/topic/import';
import type { Query as Query_njn0w7 } from '../pages/book/topic/import/edit';
import type { Query as Query_rrf9td } from '../pages/books/import';
import type { Query as Query_1ca6a8 } from '../pages/books/topic/edit';
import type { Query as Query_igs0hc } from '../pages/topics/edit';
import type { Query as Query_22z9bt } from '../pages/topics/import';
import type { Query as Query_1c8t8r6 } from '../pages/topics/new';

export const pagesPath = {
  'book': {
    'edit': {
      'topic': {
        'edit': {
          $url: (url: { query: Query_zm4wiw, hash?: string | undefined }) => ({ pathname: '/book/edit/topic/edit' as const, query: url.query, hash: url.hash })
        },
        'new': {
          $url: (url: { query: Query_1iif9lm, hash?: string | undefined }) => ({ pathname: '/book/edit/topic/new' as const, query: url.query, hash: url.hash })
        },
        $url: (url?: { hash?: string | undefined } | undefined) => ({ pathname: '/book/edit/topic' as const, hash: url?.hash })
      },
      $url: (url: { query: Query_1dtd1kj, hash?: string | undefined }) => ({ pathname: '/book/edit' as const, query: url.query, hash: url.hash })
    },
    'import': {
      'topic': {
        'edit': {
          $url: (url: { query: Query_1dghkr3, hash?: string | undefined }) => ({ pathname: '/book/import/topic/edit' as const, query: url.query, hash: url.hash })
        },
        $url: (url?: { hash?: string | undefined } | undefined) => ({ pathname: '/book/import/topic' as const, hash: url?.hash })
      },
      $url: (url: { query: Query_as145q, hash?: string | undefined }) => ({ pathname: '/book/import' as const, query: url.query, hash: url.hash })
    },
    'linking': {
      $url: (url: { query: Query_wgwco5, hash?: string | undefined }) => ({ pathname: '/book/linking' as const, query: url.query, hash: url.hash })
    },
    'new': {
      $url: (url: { query: Query_1auyuvz, hash?: string | undefined }) => ({ pathname: '/book/new' as const, query: url.query, hash: url.hash })
    },
    'overwrite': {
      $url: (url: { query: Query_1q5x398, hash?: string | undefined }) => ({ pathname: '/book/overwrite' as const, query: url.query, hash: url.hash })
    },
    'release': {
      $url: (url: { query: Query_1mel52s, hash?: string | undefined }) => ({ pathname: '/book/release' as const, query: url.query, hash: url.hash })
    },
    'topic': {
      'edit': {
        $url: (url: { query: Query_1y3xtbv, hash?: string | undefined }) => ({ pathname: '/book/topic/edit' as const, query: url.query, hash: url.hash })
      },
      'import': {
        'edit': {
          $url: (url: { query: Query_njn0w7, hash?: string | undefined }) => ({ pathname: '/book/topic/import/edit' as const, query: url.query, hash: url.hash })
        },
        $url: (url: { query: Query_17e5mra, hash?: string | undefined }) => ({ pathname: '/book/topic/import' as const, query: url.query, hash: url.hash })
      },
      $url: (url?: { hash?: string | undefined } | undefined) => ({ pathname: '/book/topic' as const, hash: url?.hash })
    },
    $url: (url: { query: Query_uxwf3e, hash?: string | undefined }) => ({ pathname: '/book' as const, query: url.query, hash: url.hash })
  },
  'bookmarks': {
    $url: (url?: { hash?: string | undefined } | undefined) => ({ pathname: '/bookmarks' as const, hash: url?.hash })
  },
  'books': {
    'import': {
      $url: (url: { query: Query_rrf9td, hash?: string | undefined }) => ({ pathname: '/books/import' as const, query: url.query, hash: url.hash })
    },
    'topic': {
      'edit': {
        $url: (url: { query: Query_1ca6a8, hash?: string | undefined }) => ({ pathname: '/books/topic/edit' as const, query: url.query, hash: url.hash })
      },
      $url: (url?: { hash?: string | undefined } | undefined) => ({ pathname: '/books/topic' as const, hash: url?.hash })
    },
    $url: (url?: { hash?: string | undefined } | undefined) => ({ pathname: '/books' as const, hash: url?.hash })
  },
  'courses': {
    $url: (url?: { hash?: string | undefined } | undefined) => ({ pathname: '/courses' as const, hash: url?.hash })
  },
  'dashboard': {
    $url: (url?: { hash?: string | undefined } | undefined) => ({ pathname: '/dashboard' as const, hash: url?.hash })
  },
  'download': {
    $url: (url?: { hash?: string | undefined } | undefined) => ({ pathname: '/download' as const, hash: url?.hash })
  },
  'topics': {
    'edit': {
      $url: (url: { query: Query_igs0hc, hash?: string | undefined }) => ({ pathname: '/topics/edit' as const, query: url.query, hash: url.hash })
    },
    'import': {
      $url: (url: { query: Query_22z9bt, hash?: string | undefined }) => ({ pathname: '/topics/import' as const, query: url.query, hash: url.hash })
    },
    'new': {
      $url: (url: { query: Query_1c8t8r6, hash?: string | undefined }) => ({ pathname: '/topics/new' as const, query: url.query, hash: url.hash })
    },
    $url: (url?: { hash?: string | undefined } | undefined) => ({ pathname: '/topics' as const, hash: url?.hash })
  },
  'userSettings': {
    $url: (url?: { hash?: string | undefined } | undefined) => ({ pathname: '/userSettings' as const, hash: url?.hash })
  },
  $url: (url?: { hash?: string | undefined } | undefined) => ({ pathname: '/' as const, hash: url?.hash })
};

export type PagesPath = typeof pagesPath;
