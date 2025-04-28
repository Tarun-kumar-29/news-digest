export interface Article {
  id: string;
  uuid: string;
  image_url: string;
  summary: string;
  article_url: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  source: string;
  published_at: string;
}

export interface SavedArticle extends Article {
  user_id: string;
  saved_at: string;
}

export interface ApiResponse {
  success: boolean;
  data: Article[];
  error?: string;
}