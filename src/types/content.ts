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
  trending?: boolean;
  published: boolean;
}
