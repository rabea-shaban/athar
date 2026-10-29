export interface Episode {
  id: string;
  programId: string;
  programSlug?: string;
  title: string;
  description?: string;
  audioUrl: string;
  videoUrl?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  thumb?: string;
  duration: string;
  durationSeconds?: number;
  order: number;
  published: boolean;
  topics?: string[];
}

export interface Program {
  id: string;
  slug: string;
  orderNum?: number;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  presenter: string;
  presenterTitle?: string;
  hostAvatar?: string;
  durationPerEpisode?: string;
  playlistType?: string;
  youtubePlaylistId?: string;
  episodesCount: number;
  episodes: Episode[];
  suggestedProgramIds?: string[];
  relatedArticleIds?: string[];
  featured?: boolean;
  badge?: string;
  published: boolean;
  tags?: string[];
}

export interface ArticleSection {
  heading?: string;
  paragraphs: string[];
  quote?: {
    text: string;
    source?: string;
  };
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  sections: ArticleSection[];
  coverImage: string;
  author: string;
  authorRole?: string;
  publishedAt: string;
  readingTimeMinutes: number;
  category: string;
  tags: string[];
  relatedProgramIds?: string[];
  suggestedArticleIds?: string[];
  featured?: boolean;
  published: boolean;
}

export interface ContentCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName?: string;
}

export type ContentItemType = "program" | "episode" | "article" | "lecture";

export interface UnifiedSearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  type: ContentItemType;
  url: string;
  badge?: string;
}

export interface QuranReciter {
  id: string;
  apiId?: number;
  orderNum: number;
  name: string;
  letter?: string;
  style?: string;
  avatar?: string;
  styleBadge: string;
  recitationsCount: number;
  recitationsBadge?: string;
  bio: string;
  serverCode?: string;
  listenId?: number;
  youtubePlaylistId?: string;
  youtubeVideoId?: string;
  riwayah?: string;
  featured?: boolean;
}

