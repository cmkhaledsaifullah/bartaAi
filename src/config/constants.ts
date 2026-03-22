/**
 * Application-wide constants
 */

// Initial chat message
export const INITIAL_SYSTEM_MESSAGE = {
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
export const CHAT_PLACEHOLDER = 'Ask about the news...'

// Example questions
export const EXAMPLE_QUESTIONS = [
  'মেট্রোরেল নিয়ে আপডেট কি?',
  'How is Bangladesh doing in Cricket?',
]

// App branding
export const APP_NAME = 'বার্তাAI'
export const APP_DISCLAIMER = 'বার্তাAI is an AI tool and can make mistakes'
export const COPYRIGHT_TEXT = '© The 880 Dispatch'

// Header UI labels
export const MODEL_BUTTON_LABEL = 'Model'
export const SIGN_IN_BUTTON_LABEL = 'Sign In'
export const MODEL_CONFIG_TITLE = 'Model Configuration'
export const API_KEY_LABEL = 'Gemini API Key (Optional)'
export const API_KEY_PLACEHOLDER = 'Enter your API key...'
export const API_KEY_HELP_TEXT = 'Without a key, the system will use mocked responses for demonstration purposes.'

// Tab configuration
export const TAB_CHAT_ID = 'chat'
export const TAB_CHAT_TITLE = 'বার্তা জিজ্ঞাসা'
export const TAB_KNOWLEDGE_ID = 'knowledge'
export const TAB_KNOWLEDGE_TITLE = 'বার্তা ভাণ্ডার'

// Mock articles
import type { Article } from '../types'

export const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    source: 'Prothom Alo',
    date: '2023-10-25',
    title: 'মেট্রোরেলের আগারগাঁও-মতিঝিল অংশের উদ্বোধন',
    content:
      'প্রধানমন্ত্রী শেখ হাসিনা মেট্রোরেলের আগারগাঁও থেকে মতিঝিল অংশের উদ্বোধন করেছেন। এর মাধ্যমে উত্তরা থেকে মতিঝিল পর্যন্ত পুরো রুটে ট্রেন চলাচল শুরু হলো। আজ শনিবার বিকেলে আগারগাঁও স্টেশনে এক অনাড্ম্বর অনুষ্ঠানে তিনি এ উদ্বোধন করেন। সাধারণ যাত্রীদের জন্য আগামীকাল থেকে এই রুটে ট্রেন চলবে। সকাল ৭টা ৩০ মিনিট থেকে বেলা ১১টা ৩০ মিনিট পর্যন্ত ট্রেন চলবে।',
    url: 'https://prothomalo.com/example1',
  },
  {
    id: 2,
    source: 'The Daily Star Bangla',
    date: '2023-10-26',
    title: 'বিশ্বকাপ ক্রিকেট: বাংলাদেশ বনাম নেদারল্যান্ডস',
    content:
      'আজ ইডেন গার্ডেন্সে বিশ্বকাপে নিজেদের ষষ্ঠ ম্যাচে নেদারল্যান্ডসের মুখোমুখি হবে বাংলাদেশ। সেমিফাইনালের আশা বাঁচিয়ে রাখতে হলে আজ জিততেই হবে সাকিব আল হাসানের দলকে। ইনজুরি কাটিয়ে দলে ফিরছেন তাসকিন আহমেদ। তবে টপ অর্ডারের ফর্ম নিয়ে চিন্তিত টিম ম্যানেজমেন্ট।',
    url: 'https://bangla.thedailystar.net/example2',
  },
  {
    id: 3,
    source: 'Dhaka Tribune',
    date: '2023-10-27',
    title: 'ডেঙ্গু পরিস্থিতি: হাসপাতালে ভর্তি রোগীর সংখ্যা কমেছে',
    content:
      'সারা দেশে ডেঙ্গু আক্রান্ত হয়ে হাসপাতালে ভর্তি রোগীর সংখ্যা কিছুটা কমেছে। স্বাস্থ্য অধিদপ্তরের তথ্য অনুযায়ী, গত ২৪ ঘণ্টায় নতুন করে ১ হাজার ২০০ জন ডেঙ্গু রোগী হাসপাতালে ভর্তি হয়েছেন। তবে মৃতের সংখ্যা এখনো উদ্বেগজনক। ঢাকার বাইরে রোগীর চাপ বেশি।',
    url: 'https://dhakatribune.com/example3',
  },
  {
    id: 4,
    source: 'Prothom Alo',
    date: '2023-10-25',
    title: 'মেট্রোরেলের আগারগাঁও-মতিঝিল অংশের উদ্বোধন',
    content:
      'প্রধানমন্ত্রী শেখ হাসিনা মেট্রোরেলের আগারগাঁও থেকে মতিঝিল অংশের উদ্বোধন করেছেন। এর মাধ্যমে উত্তরা থেকে মতিঝিল পর্যন্ত পুরো রুটে ট্রেন চলাচল শুরু হলো। আজ শনিবার বিকেলে আগারগাঁও স্টেশনে এক অনাড্ম্বর অনুষ্ঠানে তিনি এ উদ্বোধন করেন। সাধারণ যাত্রীদের জন্য আগামীকাল থেকে এই রুটে ট্রেন চলবে। সকাল ৭টা ৩০ মিনিট থেকে বেলা ১১টা ৩০ মিনিট পর্যন্ত ট্রেন চলবে।',
    url: 'https://prothomalo.com/example1',
  },
  {
    id: 5,
    source: 'The Daily Star Bangla',
    date: '2023-10-26',
    title: 'বিশ্বকাপ ক্রিকেট: বাংলাদেশ বনাম নেদারল্যান্ডস',
    content:
      'আজ ইডেন গার্ডেন্সে বিশ্বকাপে নিজেদের ষষ্ঠ ম্যাচে নেদারল্যান্ডসের মুখোমুখি হবে বাংলাদেশ। সেমিফাইনালের আশা বাঁচিয়ে রাখতে হলে আজ জিততেই হবে সাকিব আল হাসানের দলকে। ইনজুরি কাটিয়ে দলে ফিরছেন তাসকিন আহমেদ। তবে টপ অর্ডারের ফর্ম নিয়ে চিন্তিত টিম ম্যানেজমেন্ট।',
    url: 'https://bangla.thedailystar.net/example2',
  },
  {
    id: 6,
    source: 'Dhaka Tribune',
    date: '2023-10-27',
    title: 'ডেঙ্গু পরিস্থিতি: হাসপাতালে ভর্তি রোগীর সংখ্যা কমেছে',
    content:
      'সারা দেশে ডেঙ্গু আক্রান্ত হয়ে হাসপাতালে ভর্তি রোগীর সংখ্যা কিছুটা কমেছে। স্বাস্থ্য অধিদপ্তরের তথ্য অনুযায়ী, গত ২৪ ঘণ্টায় নতুন করে ১ হাজার ২০০ জন ডেঙ্গু রোগী হাসপাতালে ভর্তি হয়েছেন। তবে মৃতের সংখ্যা এখনো উদ্বেগজনক। ঢাকার বাইরে রোগীর চাপ বেশি।',
    url: 'https://dhakatribune.com/example3',
  },
]
