// Built-in categories for Guess the Eggspression.
// Each category: { id, name, language: 'tagalog'|'english', puzzles }
// Each puzzle: { answer: string, difficulty: 'easy'|'medium'|'hard' }
// No icon/image field — the clue is a live facial-expression performance,
// never a picture (see spec.md Non-goals). Answers are plain A-Z + spaces
// only (no apostrophes/accents) to keep the letter-slot rendering simple.
//
// `language` is a category-level tag, not a per-puzzle one: a game session
// commits to one language track, filtered at setup (see js/main.js). The
// English set is NOT a translation of the Tagalog set — direct translation
// would flatten culturally specific phrases like "NAGTATAMPO" (sulking in a
// relationship-specific way with no single-word English equivalent) — it's
// an equivalent-sized, independently authored set instead.

export const CATEGORIES = [
  {
    id: 'damdamin',
    name: 'Damdamin (Emotions)',
    language: 'tagalog',
    puzzles: [
      // easy
      { answer: 'MASAYA', difficulty: 'easy' },
      { answer: 'MALUNGKOT', difficulty: 'easy' },
      { answer: 'GUTOM', difficulty: 'easy' },
      { answer: 'PAGOD', difficulty: 'easy' },
      { answer: 'GALIT', difficulty: 'easy' },
      { answer: 'TAKOT', difficulty: 'easy' },
      { answer: 'GIGIL', difficulty: 'easy' },
      // medium
      { answer: 'NAGTATAMPO', difficulty: 'medium' },
      { answer: 'NALILITO', difficulty: 'medium' },
      { answer: 'NAHIHILO', difficulty: 'medium' },
      { answer: 'KINIKILIG', difficulty: 'medium' },
      { answer: 'NAIINGGIT', difficulty: 'medium' },
      { answer: 'NAHIHIYA', difficulty: 'medium' },
      // hard
      { answer: 'NAGDADALAWANG ISIP', difficulty: 'hard' },
      { answer: 'HINDI MAPIGILANG TUMAWA', difficulty: 'hard' },
      { answer: 'NAIIYAK SA TUWA', difficulty: 'hard' },
      { answer: 'NAGSISISI SA GINAWA', difficulty: 'hard' },
      { answer: 'PINIPIGILAN ANG LUHA', difficulty: 'hard' },
    ],
  },
  {
    id: 'ginagawa',
    name: 'Ginagawa (Actions)',
    language: 'tagalog',
    puzzles: [
      // easy
      { answer: 'KUMAKAIN NG ICECREAM', difficulty: 'easy' },
      { answer: 'UMIINOM NG TUBIG', difficulty: 'easy' },
      { answer: 'NANONOOD NG TV', difficulty: 'easy' },
      { answer: 'NATUTULOG', difficulty: 'easy' },
      { answer: 'UMAAWIT', difficulty: 'easy' },
      { answer: 'SUMASAYAW', difficulty: 'easy' },
      // medium
      { answer: 'UMIINOM NG MAINIT NA KAPE', difficulty: 'medium' },
      { answer: 'NAKAKAAMOY NG MASANGSANG', difficulty: 'medium' },
      { answer: 'SUMISIGAW SA SAKIT', difficulty: 'medium' },
      { answer: 'NAGLALARO NG CELLPHONE', difficulty: 'medium' },
      { answer: 'KUMAKAIN NG MAASIM NA PAGKAIN', difficulty: 'medium' },
      { answer: 'NAHIHIRAPANG UMUBO', difficulty: 'medium' },
      // hard
      { answer: 'NAGSUSUKA DAHIL SA AMOY', difficulty: 'hard' },
      { answer: 'PINIPIGILAN ANG PAGSUKA', difficulty: 'hard' },
      { answer: 'KUMAKAIN NG SOBRANG ANGHANG', difficulty: 'hard' },
      { answer: 'SUMISIPON NA HINDI MAPIGILAN', difficulty: 'hard' },
      { answer: 'NAKAKARINIG NG MALAKAS NA INGAY', difficulty: 'hard' },
    ],
  },
  {
    id: 'emotions-en',
    name: 'Emotions',
    language: 'english',
    puzzles: [
      // easy
      { answer: 'HAPPY', difficulty: 'easy' },
      { answer: 'SAD', difficulty: 'easy' },
      { answer: 'ANGRY', difficulty: 'easy' },
      { answer: 'SCARED', difficulty: 'easy' },
      { answer: 'SLEEPY', difficulty: 'easy' },
      { answer: 'BORED', difficulty: 'easy' },
      { answer: 'SHY', difficulty: 'easy' },
      // medium
      { answer: 'SURPRISED', difficulty: 'medium' },
      { answer: 'CONFUSED', difficulty: 'medium' },
      { answer: 'EMBARRASSED', difficulty: 'medium' },
      { answer: 'JEALOUS', difficulty: 'medium' },
      { answer: 'NERVOUS', difficulty: 'medium' },
      { answer: 'DISGUSTED', difficulty: 'medium' },
      // hard
      { answer: 'TRYING NOT TO CRY', difficulty: 'hard' },
      { answer: 'PRETENDING TO BE FINE', difficulty: 'hard' },
      { answer: 'HOLDING BACK LAUGHTER', difficulty: 'hard' },
      { answer: 'SECRETLY PROUD', difficulty: 'hard' },
      { answer: 'OVERWHELMED WITH JOY', difficulty: 'hard' },
    ],
  },
  {
    id: 'reactions-en',
    name: 'Reactions',
    language: 'english',
    puzzles: [
      // easy
      { answer: 'SMELLING SOMETHING BAD', difficulty: 'easy' },
      { answer: 'TASTING SOMETHING SOUR', difficulty: 'easy' },
      { answer: 'WATCHING A SCARY MOVIE', difficulty: 'easy' },
      { answer: 'STUBBED YOUR TOE', difficulty: 'easy' },
      { answer: 'BITING SOMETHING SPICY', difficulty: 'easy' },
      { answer: 'SEEING A SPIDER', difficulty: 'easy' },
      // medium
      { answer: 'HOLDING IN A SNEEZE', difficulty: 'medium' },
      { answer: 'BRAIN FREEZE FROM ICE CREAM', difficulty: 'medium' },
      { answer: 'HEARING BAD NEWS', difficulty: 'medium' },
      { answer: 'TASTING SOMETHING SWEET', difficulty: 'medium' },
      { answer: 'GETTING A SURPRISE GIFT', difficulty: 'medium' },
      { answer: 'LOSING WIFI SIGNAL', difficulty: 'medium' },
      // hard
      { answer: 'TRYING TO STAY AWAKE IN CLASS', difficulty: 'hard' },
      { answer: 'PRETENDING TO LIKE A BAD GIFT', difficulty: 'hard' },
      { answer: 'REALIZING YOU FORGOT SOMETHING', difficulty: 'hard' },
      { answer: 'HOLDING BACK A BURP', difficulty: 'hard' },
      { answer: 'WATCHING YOUR TEAM LOSE', difficulty: 'hard' },
    ],
  },
];
