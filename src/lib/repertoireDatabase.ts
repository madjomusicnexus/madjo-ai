// Genre and syllabus specific song/piece suggestions

export const genreRepertoire: Record<string, Record<number, string[]>> = {
  rock: {
    1: ['Smoke on the Water - Deep Purple', 'Seven Nation Army - The White Stripes', 'Wild Thing - The Troggs'],
    2: ['Back in Black - AC/DC', 'Come As You Are - Nirvana', 'Wonderwall - Oasis'],
    3: ['Johnny B. Goode - Chuck Berry', 'Purple Haze - Jimi Hendrix', 'Sweet Child O\' Mine - Guns N\' Roses'],
    4: ['Stairway to Heaven - Led Zeppelin', 'Bohemian Rhapsody - Queen', 'Hotel California - The Eagles'],
    5: ['Eruption - Van Halen', 'Master of Puppets - Metallica', 'Sultans of Swing - Dire Straits']
  },
  jazz: {
    1: ['C Jam Blues', 'Blue Monk', 'Freddie Freeloader'],
    2: ['So What - Miles Davis', 'Take Five - Dave Brubeck', 'Autumn Leaves'],
    3: ['All Blues', 'Blue Bossa', 'Summertime'],
    4: ['Giant Steps - John Coltrane', 'Spain - Chick Corea', 'Birdland'],
    5: ['A Night in Tunisia', 'Round Midnight', 'Misty']
  },
  blues: {
    1: ['12 Bar Blues in E', 'Born Under a Bad Sign', 'Pride and Joy'],
    2: ['The Thrill is Gone - B.B. King', 'Red House - Jimi Hendrix', 'Stormy Monday'],
    3: ['Crossroads - Robert Johnson', 'Texas Flood - Stevie Ray Vaughan', 'Sweet Home Chicago'],
    4: ['Hide Away - Freddie King', 'The Sky is Crying', 'Mannish Boy'],
    5: ['Little Wing', 'Voodoo Child', 'Since I\'ve Been Loving You']
  },
  pop: {
    1: ['Let It Be - The Beatles', 'Lean On Me - Bill Withers', 'Hallelujah - Leonard Cohen'],
    2: ['Someone Like You - Adele', 'Thinking Out Loud - Ed Sheeran', 'Perfect - Ed Sheeran'],
    3: ['Shape of You - Ed Sheeran', 'Rolling in the Deep - Adele', 'Uptown Funk - Bruno Mars'],
    4: ['Blinding Lights - The Weeknd', 'Bad Guy - Billie Eilish', 'Shallow - Lady Gaga'],
    5: ['Drivers License - Olivia Rodrigo', 'As It Was - Harry Styles', 'Flowers - Miley Cyrus']
  }
};

export function getSuggestedRepertoire(genre: string, gradeLevel: number): string[] {
  const genreKey = genre.toLowerCase();
  const grade = Math.min(5, Math.max(1, gradeLevel));
  return genreRepertoire[genreKey]?.[grade] || genreRepertoire.rock[grade] || ['Choose a song the student loves'];
}