import type { NewsArticle } from '../types/news';

export const fallbackNews: NewsArticle[] = [
  {
    id: '1',
    title: 'The Future of Artificial Intelligence in Healthcare',
    summary: 'AI is revolutionizing healthcare with breakthrough applications in diagnosis, treatment planning, and drug discovery. Recent developments show promising results in early disease detection and personalized medicine.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=500',
    articleUrl: '#',
    source: 'Tech Health Today',
    published_at: new Date().toLocaleDateString(),
    sentimentAnalysis: 'positive'
  },
  {
    id: '2',
    title: 'Sustainable Energy Breakthrough: New Solar Technology',
    summary: 'Scientists have developed a new type of solar panel that achieves record-breaking efficiency levels. This breakthrough could make solar energy more accessible and affordable for widespread adoption.',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=500',
    articleUrl: '#',
    source: 'Green Energy Weekly',
    published_at: new Date().toLocaleDateString(),
    sentimentAnalysis: 'positive'
  },
  {
    id: '3',
    title: 'Global Markets Face Economic Challenges',
    summary: 'Markets worldwide are experiencing volatility amid economic uncertainties. Experts analyze the impact of recent policy changes and global events on financial markets.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=500',
    articleUrl: '#',
    source: 'Financial Times',
    published_at: new Date().toLocaleDateString(),
    sentimentAnalysis: 'negative'
  },
  {
    id: '4',
    title: 'Breakthrough in Quantum Computing Research',
    summary: 'Researchers achieve major milestone in quantum computing stability. This development brings us closer to practical quantum computers that could revolutionize various fields.',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=500',
    articleUrl: '#',
    source: 'Quantum Science News',
    published_at: new Date().toLocaleDateString(),
    sentimentAnalysis: 'positive'
  },
  {
    id: '5',
    title: 'Space Exploration: New Discoveries on Mars',
    summary: 'Latest Mars rover mission reveals intriguing evidence of ancient microbial life. Scientists are analyzing the data to understand the implications for future exploration.',
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=500',
    articleUrl: '#',
    source: 'Space Explorer',
    published_at: new Date().toLocaleDateString(),
    sentimentAnalysis: 'neutral'
  },
  {
    id: '6',
    title: 'Cybersecurity Threats on the Rise',
    summary: 'Experts warn of increasing sophisticated cyber attacks targeting various sectors. New security measures and protocols are being developed to combat these emerging threats.',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=500',
    articleUrl: '#',
    source: 'Cyber Security Today',
    published_at: new Date().toLocaleDateString(),
    sentimentAnalysis: 'negative'
  }
];