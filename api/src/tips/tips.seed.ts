export interface SeedTip {
  text: string;
  category: 'Places' | 'Food' | 'Jobs' | 'Sports';
}

export const SEED_TIPS: readonly SeedTip[] = [
  // Places
  { text: 'Eiffel Tower', category: 'Places' },
  { text: 'Airport', category: 'Places' },
  { text: 'Beach', category: 'Places' },
  { text: 'Hospital', category: 'Places' },
  { text: 'Museum', category: 'Places' },
  { text: 'Library', category: 'Places' },
  { text: 'Supermarket', category: 'Places' },
  { text: 'Amusement Park', category: 'Places' },

  // Food
  { text: 'Pizza', category: 'Food' },
  { text: 'Sushi', category: 'Food' },
  { text: 'Burger', category: 'Food' },
  { text: 'Pancakes', category: 'Food' },
  { text: 'Ice Cream', category: 'Food' },
  { text: 'Spaghetti', category: 'Food' },
  { text: 'Popcorn', category: 'Food' },
  { text: 'Watermelon', category: 'Food' },

  // Jobs
  { text: 'Teacher', category: 'Jobs' },
  { text: 'Doctor', category: 'Jobs' },
  { text: 'Pilot', category: 'Jobs' },
  { text: 'Chef', category: 'Jobs' },
  { text: 'Photographer', category: 'Jobs' },
  { text: 'Firefighter', category: 'Jobs' },
  { text: 'Architect', category: 'Jobs' },
  { text: 'Journalist', category: 'Jobs' },

  // Sports
  { text: 'Football', category: 'Sports' },
  { text: 'Basketball', category: 'Sports' },
  { text: 'Tennis', category: 'Sports' },
  { text: 'Swimming', category: 'Sports' },
  { text: 'Boxing', category: 'Sports' },
  { text: 'Cycling', category: 'Sports' },
  { text: 'Volleyball', category: 'Sports' },
  { text: 'Skiing', category: 'Sports' },
];
