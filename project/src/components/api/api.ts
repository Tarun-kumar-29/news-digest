import nhost from '/home/project/nhostConfig.js';
import type { Article, SavedArticle } from '../types/news';

// Get the current user ID
export const getUserId = async (): Promise<string | null> => {
  try {
    const session = await nhost.auth.getSession();
    if (!session?.user) {
      console.error('User is not authenticated');
      return null;
    }
    return session.user.id;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};
export const getPreferences = async (userId: string): Promise<any | null> => {
  try {
    const session = await nhost.auth.getSession();
    if (!session?.user) throw new Error('User is not authenticated');

    const token = session.accessToken;
    const response = await fetch(
      'https://ebxpsrrwyepwujbtggch.hasura.ap-southeast-1.nhost.run/v1/graphql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query GetPreferences($userId: uuid!) {
              preferences(where: {user_id: {_eq: $userId}}) {
                topics
                sources
                keywords
              }
            }
          `,
          variables: { userId },
        }),
      }
    );

    const result = await response.json();
    if (result.errors) {
      console.error('Error fetching preferences:', result.errors);
      return null;
    }
    console.log(result.data.preferences[0]);
    return result.data.preferences[0];
    
  } catch (error) {
    console.error('Failed to fetch preferences:', error);
    return null;
  }
};
// Fetch news from N8N
export const fetchNewsFromN8n = async (userId) => {
  try {
    const preferences = await getPreferences(userId);
    const defaultTopics = ['Technology', 'Sports'];
    const finalPreferences = {
      ...preferences,
      topics: preferences?.topics?.length ? preferences.topics : defaultTopics,
    };

    const session = await nhost.auth.getSession();
    if (!session?.user) throw new Error('User is not authenticated');
    const token = session.accessToken;

    const HASURA_GRAPHQL_ENDPOINT = 'https://ebxpsrrwyepwujbtggch.hasura.ap-southeast-1.nhost.run/v1/graphql';

    const graphqlQuery = {
      query: `
        mutation FetchNews($userId: String!, $preferences: PreferencesInput!) {
          fetchNewsFromN8n(userId: $userId, preferences: $preferences)
        }
      `,
      variables: { userId, preferences: finalPreferences },
    };

    const response = await fetch(HASURA_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      throw new Error(`GraphQL Error: ${response.statusText}`);
    }

    const responseData = await response.json();

    if (responseData.errors) {
      throw new Error(`GraphQL Error: ${responseData.errors[0].message}`);
    }

    console.log('GraphQL Response:', responseData);
    return responseData?.data?.fetchNewsFromN8n || null;
  } catch (error) {
    console.error('Failed to fetch news from Hasura Action:', error.message);
    return null;
  }
};


// Save article
export const saveArticle = async (userId: string, article: Article): Promise<boolean> => {
  try {
    const session = await nhost.auth.getSession();
    if (!session?.user) throw new Error('User is not authenticated');

    const token = session.accessToken;

    // Step 1: Insert article into articles table
    const articleResponse = await fetch(
      'https://ebxpsrrwyepwujbtggch.hasura.ap-southeast-1.nhost.run/v1/graphql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation InsertArticle($article: articles_insert_input!) {
              insert_articles_one(object: $article) {
                id
              }
            }
          `,
          variables: {
            article: {
              id: article.uuid ,
              image_url: article.image_url,
              summary: article.summary,
              article_url: article.article_url,
              sentiment: article.sentiment,
              source: article.source,
              published_at: article.published_at
            },
          },
        }),
      }
    );

    const articleResult = await articleResponse.json();
    if (articleResult.errors) {
      throw new Error(articleResult.errors[0].message);
    }

    const articleId = articleResult.data.insert_articles_one.id;

    // Step 2: Insert data into saved_articles table
    const saveResponse = await fetch(
      'https://ebxpsrrwyepwujbtggch.hasura.ap-southeast-1.nhost.run/v1/graphql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation SaveArticle($userId: uuid!, $articleId: uuid!) {
              insert_saved_articles_one(object: {
                user_id: $userId,
                article_id: $articleId
              }) {
                user_id
                article_id
              }
            }
          `,
          variables: {
            userId,
            articleId,
          },
        }),
      }
    );

    const saveResult = await saveResponse.json();
    if (saveResult.errors) {
      throw new Error(saveResult.errors[0].message);
    }

    console.log('Article saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save article:', error);
    return false;
  }
};


// Fetch saved articles
export const fetchSavedArticles = async (userId: string): Promise<SavedArticle[]> => {
  try {
    const session = await nhost.auth.getSession();
    if (!session?.user) throw new Error('User is not authenticated');
    const token = session.accessToken;
    const response = await fetch(
      'https://ebxpsrrwyepwujbtggch.hasura.ap-southeast-1.nhost.run/v1/graphql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query GetSavedArticles($userId: uuid!) {
              saved_articles(where: {user_id: {_eq: $userId}}) {
                user_id
                saved_at
                article {
                  id
                  image_url
                  summary
                  article_url
                  sentiment
                  source
                  published_at
                }
              }
            }
          `,
          variables: { userId },
        }),
      }
    );

    const result = await response.json();
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data.saved_articles.map((item: any) => ({
      ...item.article,
      user_id: item.user_id,
      saved_at: item.saved_at
    }));
  } catch (error) {
    console.error('Failed to fetch saved articles:', error);
    return [];
  }
};

// Delete saved article
export const deleteSavedArticle = async (userId: string, articleId: string): Promise<boolean> => {
  try {
    const session = await nhost.auth.getSession();
    if (!session?.user) throw new Error('User is not authenticated');

    const token = session.accessToken;
    const response = await fetch(
      'https://ebxpsrrwyepwujbtggch.hasura.ap-southeast-1.nhost.run/v1/graphql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation DeleteSavedArticle($userId: uuid!, $articleId: uuid!) {
              delete_saved_articles(where: {
                user_id: {_eq: $userId},
                article_id: {_eq: $articleId}
              }) {
                affected_rows
              }
            }
          `,
          variables: { userId, articleId },
        }),
      }
    );

    const result = await response.json();
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data.delete_saved_articles.affected_rows > 0;
  } catch (error) {
    console.error('Failed to delete saved article:', error);
    return false;
  }
};

// Mark article as read (local storage implementation)
export const markArticleAsRead = (articleId: string): void => {
  try {
    const readArticles = JSON.parse(localStorage.getItem('readArticles') || '[]');
    if (!readArticles.includes(articleId)) {
      readArticles.push(articleId);
      localStorage.setItem('readArticles', JSON.stringify(readArticles));
    }
  } catch (error) {
    console.error('Failed to mark article as read:', error);
  }
};
export const savePreferences = async (userId: string, categories: string[], sources: string[], keywords: string[]): Promise<boolean> => {
  try {
    const session = await nhost.auth.getSession();
    if (!session?.user) throw new Error('User is not authenticated');

    const token = session.accessToken;

    const response = await fetch(
      'https://ebxpsrrwyepwujbtggch.hasura.ap-southeast-1.nhost.run/v1/graphql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation SavePreferences($userId: uuid!, $categories: [String!]!, $sources: [String!]!, $keywords: [String!]!) {
              insert_preferences_one(
                object: {
                  user_id: $userId,
                  topics: $categories,
                  sources: $sources,
                  keywords: $keywords
                },
                on_conflict: {
                  constraint: preferences_pkey,
                  update_columns: [topics, sources, keywords]
                }
              ) {
                user_id
              }
            }
          `,
          variables: { userId, categories, sources, keywords },
        }),
      }
    );

    const result = await response.json();
    if (result.errors) {
      console.error('Error saving preferences:', result.errors);
      return false;
    }

    console.log('Preferences saved successfully:', result);
    return true;
  } catch (error) {
    console.error('Failed to save preferences:', error);
    return false;
  }
};

// Check if article is read
export const isArticleRead = (articleId: string): boolean => {
  try {
    const readArticles = JSON.parse(localStorage.getItem('readArticles') || '[]');
    return readArticles.includes(articleId);
  } catch (error) {
    console.error('Failed to check article read status:', error);
    return false;
  }
};