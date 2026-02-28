/**
 * Application-wide constants
 */

// Initial chat message
export const INITIAL_CHAT_MESSAGE = {
  id: 'initial-msg',
  role: 'system' as const,
  content:
    'স্বাগতম! আমি আপনার বার্তাAI—বাংলাদেশের সর্বশেষ খবরের ভিত্তিতে আপনার প্রশ্নের উত্তর দিতে প্রস্তুত।',
  type: 'text' as const,
}

// RAG simulation delays
export const RAG_STEP_DELAY = 800
export const MOCK_RESPONSE_DELAY = 1500

// Search configuration
export const MAX_RETRIEVED_CHUNKS = 3

// UI messages
export const NO_CONTEXT_MESSAGE = 'দুঃখিত, আমার জানা তথ্যের (Context) মধ্যে এই বিষয়ে কোনো খবর নেই।'

// Mock responses by article ID
export const MOCK_RESPONSES: Record<number, string> = {
  1: 'উত্তরা থেকে মতিঝিল পর্যন্ত পুরো রুটে মেট্রোরেল চলাচল শুরু হয়েছে। প্রধানমন্ত্রী শেখ হাসিনা আগারগাঁও স্টেশনে এটি উদ্বোধন করেন। যাত্রীরা সকাল ৭:৩০ থেকে ১১:৩০ পর্যন্ত চলাচল করতে পারবেন।',
  2: 'আজ বাংলাদেশ নেদারল্যান্ডসের বিপক্ষে খেলবে। সেমিফাইনালে যেতে হলে বাংলাদেশকে জিততেই হবে। তাসকিন আহমেদ ইনজুরি থেকে ফিরছেন।',
  3: 'গত ২৪ ঘণ্টায় ১,২০০ জন ডেঙ্গু রোগী হাসপাতালে ভর্তি হয়েছেন। যদিও ভর্তির হার কিছুটা কমেছে, কিন্তু মৃত্যুর সংখ্যা এখনো চিন্তার বিষয়।',
}

export const GENERIC_MOCK_RESPONSE = 'সংগৃহীত তথ্যের ভিত্তিতে দেখা যাচ্ছে যে বিষয়টি খবরে উল্লেখ করা হয়েছে।'

// Placeholder text
export const PROMPT_PLACEHOLDER = 'Ask about the news (e.g., মেট্রোরেল বা ক্রিকেট সম্পর্কে কিছু বলুন)...'

// Example questions
export const EXAMPLE_QUESTIONS = [
  'মেট্রোরেল নিয়ে আপডেট কি?',
  'How is Bangladesh doing in Cricket?',
]
