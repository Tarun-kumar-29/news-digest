import React, { useState, useEffect } from 'react';
import { Share2, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserId, fetchSavedArticles, deleteSavedArticle } from './api/api';
import type { SavedArticle } from '../types/news';

const SavedArticles: React.FC = () => {
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');
      
      const savedArticles = await fetchSavedArticles(userId);
      setArticles(savedArticles);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch saved articles');
      toast.error('Failed to load saved articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (articleId: string) => {
    try {
      setIsDeleting(articleId);
      const userId = await getUserId();
      if (!userId) throw new Error('User not authenticated');

      const success = await deleteSavedArticle(userId, articleId);
      if (success) {
        setArticles(articles.filter(article => article.id !== articleId));
        toast.success('Article removed from saved items');
      } else {
        throw new Error('Failed to delete article');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete article');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleShare = async (article: SavedArticle) => {
    try {
      await navigator.share({
        title: article.summary.split('.')[0], // Use first sentence as title
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
          <p className="text-xl text-gray-600 dark:text-gray-300">Loading your saved articles...</p>
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
            onClick={fetchArticles}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="text-center">
        <h1 className="text-3xl font-bold dark:text-white">Saved Articles</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Your personal collection of saved stories</p>
      </header>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">📚</div>
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400">No saved articles yet</h2>
          <p className="text-gray-500 dark:text-gray-500 mt-2">Articles you save will appear here</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <article 
              key={article.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-[1.02] transition-transform duration-300"
            >
              <img
                src={article.image_url}
                alt={article.summary.split('.')[0]}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 dark:text-white">
                  {article.summary.split('.')[0]}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{article.summary}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleShare(article)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                    >
                      <Share2 className="w-5 h-5 text-purple-500" />
                    </button>
                    <button 
                      onClick={() => handleDelete(article.id)}
                      disabled={isDeleting === article.id}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors duration-200"
                    >
                      <Trash2 className={`w-5 h-5 text-red-500 ${isDeleting === article.id ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{article.source}</span>
                    <span>•</span>
                    <span>{article.published_at}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedArticles;