import React, { useState, useEffect } from 'react';
import { Share2, Bookmark, CheckCircle, List, Grid, RefreshCw } from 'lucide-react';
import { getUserId, fetchNewsFromN8n, saveArticle } from './api/api';
import toast from 'react-hot-toast';
import type { Article } from './types/news';
import { v4 as uuidv4 } from 'uuid';

const Dashboard: React.FC = () => {
  const [isGridView, setIsGridView] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savingArticles, setSavingArticles] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const userId = await getUserId();
      if (!userId) throw new Error('User not found');
      
      const newsData = await fetchNewsFromN8n(userId);
      if (!newsData) {
        throw new Error('No news available. Please update your preferences.');
      }

      // Parse the JSON string if it's returned as a string
      const parsedData = typeof newsData === 'string' ? JSON.parse(newsData) : newsData;
      
      // Ensure we have an array to work with
      const newsArray = Array.isArray(parsedData) ? parsedData : [parsedData];

      const formattedArticles = newsArray.map((article: any) => ({
        id: article.id || uuidv4(), 
        uuid: uuidv4(),
        title: article.title || 'No title available',
        image_url: article.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=500',
        summary: article.summary || 'No summary available.',
        article_url: article.articleUrl || '#',
        sentiment: article.sentimentAnalysis?.toLowerCase() || 'neutral',
        source: article.source || 'Unknown Source',
        published_at: article.published_at || 'Recent',
      }));

      setArticles(formattedArticles);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching news:', err);
      setError(err.message || 'An error occurred while fetching news');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveArticle = async (article: Article) => {
    try {
      const userId = await getUserId();
      if (!userId) {
        toast.error('Please sign in to save articles');
        return;
      }

      setSavingArticles(prev => new Set([...prev, article.id]));
      const success = await saveArticle(userId, article);

      if (success) {
        toast.success('Article saved successfully!');
      } else {
        throw new Error('Failed to save article');
      }
    } catch (err) {
      toast.error('Failed to save article. Please try again.');
    } finally {
      setSavingArticles(prev => {
        const newSet = new Set(prev);
        newSet.delete(article.id);
        return newSet;
      });
    }
  };

  const handleShareArticle = async (article: Article) => {
    try {
      await navigator.share({
        title: article.title,
        text: article.summary,
        url: article.article_url
      });
      toast.success('Article shared successfully');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.error('Failed to share article');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-xl text-gray-600 dark:text-gray-300">Loading your personalized news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-xl text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <header className="text-center space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Your Daily Digest</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Personalized news updates just for you</p>
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
              isGridView 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setIsGridView(true)}
          >
            <Grid className="w-5 h-5" />
            Grid View
          </button>
          
          <button
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
              !isGridView 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setIsGridView(false)}
          >
            <List className="w-5 h-5" />
            List View
          </button>
          
          <button
            className={`px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 hover:bg-green-600 transition-all duration-200 ${
              isRefreshing ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            onClick={fetchData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh News'}
          </button>
        </div>
      </header>

      {/* News Section */}
      <div className={`
        ${isGridView 
          ? 'grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'space-y-6'
        }
      `}>
        {articles.map((article) => (
          <article 
            key={article.id} 
            className={`
              bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden 
              transition-transform duration-200 hover:transform hover:scale-[1.02]
              ${!isGridView ? 'flex' : ''}
            `}
          >
            {/* Article Image */}
            <div className={`
              relative overflow-hidden
              ${isGridView ? 'w-full h-48' : 'w-48 h-full flex-shrink-0'}
            `}>
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
              />
            </div>
            
            <div className="p-6 flex-grow">
              {/* Sentiment and Source */}
              <div className="flex items-center space-x-2 mb-4">
                <span className={`
                  px-3 py-1 text-xs font-medium rounded-full
                  ${article.sentiment === 'positive'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : article.sentiment === 'negative'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}
                `}>
                  {article.sentiment}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{article.source}</span>
              </div>

              {/* Title and Summary */}
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white line-clamp-2">
                {article.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {article.summary}
              </p>

              {/* Read More and Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={article.article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 
                           font-medium transition-colors duration-200"
                >
                  Read More
                </a>
                
                {/* Action Buttons */}
                <div className="flex space-x-1">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full 
                                   transition-colors duration-200">
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                  </button>
                  <button 
                    onClick={() => handleSaveArticle(article)}
                    disabled={savingArticles.has(article.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full 
                             transition-colors duration-200"
                  >
                    <Bookmark className={`w-5 h-5 text-blue-500 dark:text-blue-400 
                      ${savingArticles.has(article.id) ? 'animate-pulse' : ''}`} 
                    />
                  </button>
                  <button 
                    onClick={() => handleShareArticle(article)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full 
                             transition-colors duration-200"
                  >
                    <Share2 className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  </button>
                </div>

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {article.published_at}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;