/**
 * CampusMilan AI/ML Engine
 * 1. TF-IDF + Cosine Similarity recommendation algorithm for college events.
 * 2. Lexicon-based sentiment analysis for student feedback.
 */

import { CollegeEvent, SentimentType } from './types.ts';

// Standard English stopwords to filter out common noise words
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'won\'t', 'would', 'you', 'your', 'yours'
]);

/**
 * Tokenizes text into normalized lowercase alphanumeric stems/tokens
 */
export function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s\-/+]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 1 && !STOPWORDS.has(w));
}

/**
 * Calculates Term Frequency (TF) for a token array
 */
function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  if (tokens.length === 0) return tf;

  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  // Normalize by total tokens in the document
  for (const [token, count] of tf.entries()) {
    tf.set(token, count / tokens.length);
  }

  return tf;
}

/**
 * Computes cosine similarity between two sparse vector maps
 */
function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const val of vecA.values()) {
    normA += val * val;
  }
  for (const val of vecB.values()) {
    normB += val * val;
  }

  if (normA === 0 || normB === 0) return 0;

  // Intersect dot product
  for (const [key, valA] of vecA.entries()) {
    if (vecB.has(key)) {
      dotProduct += valA * (vecB.get(key) || 0);
    }
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface RecommendationResult {
  event: CollegeEvent;
  score: number; // 0 to 1.0 (or percentage 0-100)
  matchPercentage: number;
  matchedKeywords: string[];
  relevanceReason: string;
}

/**
 * AI Personalized Event Recommendation using TF-IDF and Cosine Similarity
 */
export function recommendEvents(
  events: CollegeEvent[],
  studentInterests: string[],
  studentDepartment: string,
  studentYear?: number
): RecommendationResult[] {
  if (!events || events.length === 0) return [];

  // Build document corpus from events
  // Each event document = title (x2 weight) + category (x2) + department (x1.5) + description
  const eventDocs = events.map(evt => {
    const textCorpus = [
      evt.title,
      evt.title, // repetition for weight
      evt.category,
      evt.category,
      evt.department,
      evt.description
    ].join(' ');

    const tokens = tokenize(textCorpus);
    return {
      event: evt,
      tokens,
      tf: computeTF(tokens)
    };
  });

  // Calculate Document Frequency (DF) across all events
  const df = new Map<string, number>();
  const totalDocs = eventDocs.length;

  for (const doc of eventDocs) {
    const seenInDoc = new Set(doc.tokens);
    for (const token of seenInDoc) {
      df.set(token, (df.get(token) || 0) + 1);
    }
  }

  // Calculate IDF
  const idf = new Map<string, number>();
  for (const [token, count] of df.entries()) {
    idf.set(token, Math.log((totalDocs + 1) / (count + 1)) + 1);
  }

  // Construct Student Profile query document
  // Student interests have high weight, department has boost
  const queryWords: string[] = [];
  studentInterests.forEach(interest => {
    // Repeat to give strong weight to chosen student interests
    const toks = tokenize(interest);
    queryWords.push(...toks, ...toks, ...toks);
  });
  if (studentDepartment) {
    const deptToks = tokenize(studentDepartment);
    queryWords.push(...deptToks, ...deptToks);
  }

  const queryTF = computeTF(queryWords);

  // Convert query to TF-IDF vector
  const queryVector = new Map<string, number>();
  for (const [token, tfVal] of queryTF.entries()) {
    const idfVal = idf.get(token) || (Math.log(totalDocs + 1) + 1);
    queryVector.set(token, tfVal * idfVal);
  }

  // Vectorize and compare each event document
  const results: RecommendationResult[] = eventDocs.map(doc => {
    const docVector = new Map<string, number>();
    for (const [token, tfVal] of doc.tf.entries()) {
      const idfVal = idf.get(token) || 1.0;
      docVector.set(token, tfVal * idfVal);
    }

    let sim = cosineSimilarity(queryVector, docVector);

    // Boost score if the event is directly organized by or targets student's own department
    const isSameDept = doc.event.department.toLowerCase().includes(studentDepartment.toLowerCase()) ||
                       studentDepartment.toLowerCase().includes(doc.event.department.toLowerCase());
    if (isSameDept) {
      sim = Math.min(1.0, sim + 0.12);
    }

    // Direct category interest match boost
    const matchesCategory = studentInterests.some(i => 
      doc.event.category.toLowerCase().includes(i.toLowerCase()) ||
      i.toLowerCase().includes(doc.event.category.toLowerCase())
    );
    if (matchesCategory) {
      sim = Math.min(1.0, sim + 0.15);
    }

    // Identify matched keywords
    const matchedTokens: string[] = [];
    const queryTokensSet = new Set(queryWords);
    for (const token of doc.tokens) {
      if (queryTokensSet.has(token) && !matchedTokens.includes(token)) {
        matchedTokens.push(token);
      }
    }

    // Generate readable explanation
    let relevanceReason = 'General campus highlight';
    if (matchedTokens.length > 0) {
      relevanceReason = `Matched with your profile: ${matchedTokens.slice(0, 3).join(', ')}`;
    } else if (isSameDept) {
      relevanceReason = `From your home department (${studentDepartment})`;
    }

    const matchPercentage = Math.round(Math.min(99, Math.max(25, (sim * 80) + 20)));

    return {
      event: doc.event,
      score: sim,
      matchPercentage,
      matchedKeywords: matchedTokens.slice(0, 5),
      relevanceReason
    };
  });

  // Rank by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Simple, robust lexicon-based sentiment analysis (VADER-style polarity scoring)
 */
const POSITIVE_WORDS = new Set([
  'great', 'good', 'excellent', 'amazing', 'awesome', 'fantastic', 'wonderful', 'informative',
  'helpful', 'engaging', 'superb', 'best', 'valuable', 'loved', 'enjoyed', 'insightful',
  'brilliant', 'well-organized', 'inspiring', 'useful', 'fun', 'interactive', 'smooth',
  'perfect', 'top-notch', 'quality', 'learnt', 'learned', 'excited', 'impressive'
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'poor', 'terrible', 'horrible', 'boring', 'disappointing', 'worst', 'useless',
  'waste', 'unorganized', 'confusing', 'late', 'delayed', 'audio', 'crowded', 'disorganized',
  'rushed', 'unprepared', 'clueless', 'noisy', 'mediocre', 'dissatisfied', 'frustrating',
  'waste of time', 'regret'
]);

const NEGATORS = new Set([
  'not', 'never', 'hardly', 'barely', 'scarcely', 'no', 'didn\'t', 'wasn\'t', 'doesn\'t', 'don\'t'
]);

const BOOSTERS = new Set([
  'very', 'extremely', 'really', 'super', 'absolutely', 'highly', 'tremendously'
]);

export function analyzeSentiment(text: string): { sentiment: SentimentType; score: number } {
  if (!text || text.trim().length === 0) {
    return { sentiment: 'neutral', score: 0 };
  }

  const words = text.toLowerCase().replace(/[^\w\s']/g, ' ').split(/\s+/).filter(Boolean);
  let totalScore = 0;
  let wordCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let multiplier = 1.0;

    // Check if preceded by booster or negator
    if (i > 0 && BOOSTERS.has(words[i - 1])) {
      multiplier = 1.5;
    }
    if (i > 0 && NEGATORS.has(words[i - 1])) {
      multiplier = -1.0;
    }

    if (POSITIVE_WORDS.has(word)) {
      totalScore += 1.0 * multiplier;
      wordCount++;
    } else if (NEGATIVE_WORDS.has(word)) {
      totalScore -= 1.0 * multiplier;
      wordCount++;
    }
  }

  // Determine sentiment category based on score
  if (totalScore >= 0.5) {
    return { sentiment: 'positive', score: totalScore };
  } else if (totalScore <= -0.5) {
    return { sentiment: 'negative', score: totalScore };
  } else {
    return { sentiment: 'neutral', score: totalScore };
  }
}
