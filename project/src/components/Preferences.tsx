import React, { useState, useEffect } from 'react';
import { Save, Newspaper, Globe, Tag } from 'lucide-react';
import { getUserId, savePreferences, getPreferences } from '/home/project/src/components/api/api.ts';

interface PreferencesProps {
  setCurrentPage: (page: string) => void;
}

const Preferences: React.FC<PreferencesProps> = ({ setCurrentPage }) => {
  const [categories, setCategories] = useState([
    { id: 'tech', name: 'Technology', icon: '💻', selected: false },
    { id: 'science', name: 'Science', icon: '🔬', selected: false },
    { id: 'health', name: 'Health', icon: '🏥', selected: false },
    { id: 'business', name: 'Business', icon: '💼', selected: false },
    { id: 'sports', name: 'Sports', icon: '⚽', selected: false },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', selected: false },
  ]);

  const [sources, setSources] = useState([
    { id: 'reuters', name: 'Reuters', selected: false },
    { id: 'bbc', name: 'BBC News', selected: false },
    { id: 'techcrunch', name: 'TechCrunch', selected: false },
    { id: 'wired', name: 'Wired', selected: false },
  ]);

  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      const userId = await getUserId();
      if (!userId) {
        console.error('User ID not found');
        return;
      }

      const preferences = await getPreferences(userId);
      if (preferences) {
        setCategories((prev) => prev.map((cat) => ({ ...cat, selected: preferences.topics.includes(cat.id) })));
        setSources((prev) => prev.map((src) => ({ ...src, selected: preferences.sources.includes(src.id) })));
        setKeywords(preferences.keywords || []);
      }
    };

    fetchPreferences();
  }, []);

  const handleCategoryToggle = (id: string) => {
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, selected: !cat.selected } : cat)));
  };

  const handleSourceToggle = (id: string) => {
    setSources((prev) => prev.map((src) => (src.id === id ? { ...src, selected: !src.selected } : src)));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords((prev) => [...prev, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  const handleSave = async () => {
    setIsSaving(true);

    let selectedCategories = categories.filter((cat) => cat.selected).map((cat) => cat.id);
    let selectedSources = sources.filter((src) => src.selected).map((src) => src.id);

    if (selectedCategories.length === 0) {
      selectedCategories = ['tech'];
    }

    if (selectedSources.length === 0) {
      selectedSources = ['reuters'];
    }

    if (keywords.length === 0) {
      setKeywords(['technology', 'science']);
    }

    try {
      const userId = await getUserId();
      if (!userId) {
        throw new Error('Failed to retrieve user ID');
      }

      const success = await savePreferences(userId, selectedCategories, selectedSources, keywords);
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setCurrentPage('home');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold dark:text-white">Customize Your News Feed</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Select your interests to get personalized news updates
          </p>
        </div>

        {/* Categories Section */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Newspaper className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold dark:text-white">News Categories</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryToggle(category.id)}
                className={`p-4 rounded-lg border-2 ${category.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="block font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Sources Section */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold dark:text-white">News Sources</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sources.map((source) => (
              <button
                key={source.id}
                onClick={() => handleSourceToggle(source.id)}
                className={`p-3 rounded-lg border ${source.selected ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
              >
                <span className="font-medium">{source.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Keywords Section */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold dark:text-white">Keywords</h2>
          </div>
          <div>
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Add keywords (e.g., AI, Climate Change)"
              className="p-2 border rounded-lg"
            />
            <button onClick={handleAddKeyword} className="ml-2 p-2 bg-purple-500 text-white rounded-lg">
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {keywords.map((keyword) => (
              <span key={keyword} className="px-3 py-1 bg-purple-100 rounded-full">
                {keyword} <button onClick={() => handleRemoveKeyword(keyword)}>×</button>
              </span>
            ))}
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-between">
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-3 bg-blue-500 text-white rounded-lg">
            {isSaving ? 'Saving...' : <><Save className="w-5 h-5" /> Save Preferences</>}
          </button>
          {showSuccess && <span className="text-green-500">Preferences saved successfully!</span>}
        </div>
      </div>
    </div>
  );
};

export default Preferences;
