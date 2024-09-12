export type AssetVideo = {
  id: string;
  title: string;
  description: string;
  usedIn: number;
  tags: string[];
  source: string;
};

// Sample data (you can move this to a separate file later)
export const sampleVideos: AssetVideo[] = [
  {
    id: "1",
    title: "Top 5 Goal Celebrations of 2023",
    description: "Compilation of the most creative goal celebrations from last year",
    usedIn: 3,
    tags: ["Football", "Highlights", "2023"],
    source: 'From Video',
  },
  {
    id: "2",
    title: "Behind the Scenes: Studio Recording",
    description: "Exclusive footage of artists recording their latest album",
    usedIn: 2,
    tags: ["Music", "Documentary", "Studio"],
    source: 'From Video',
  },
  {
    id: "3",
    title: "Drone Footage: New York Skyline",
    description: "Breathtaking aerial views of NYC at sunset",
    usedIn: 5,
    tags: ["Travel", "Aerial", "New York"],
    source: 'From Video',
  },
  {
    id: "4",
    title: "Quick Recipe: 15-Minute Pasta",
    description: "Easy and delicious pasta recipe for busy weeknights",
    usedIn: 1,
    tags: ["Cooking", "Quick Meals", "Italian"],
    source: 'From Video',
  },
  {
    id: "5",
    title: "Tech Review: Latest Smartphone",
    description: "In-depth review of the newest flagship smartphone",
    usedIn: 4,
    tags: ["Technology", "Review", "Smartphone"],
    source: 'From Video',
  },
  {
    id: "6",
    title: "Workout Routine: Full Body HIIT",
    description: "30-minute high-intensity interval training for full body workout",
    usedIn: 2,
    tags: ["Fitness", "HIIT", "Workout"],
    source: 'From Video',
  },
  {
    id: "7",
    title: "Wildlife Documentary: Amazon Rainforest",
    description: "Exploring the diverse ecosystem of the Amazon",
    usedIn: 3,
    tags: ["Nature", "Documentary", "Amazon"],
    source: 'From Video',
  },
  {
    id: "8",
    title: "Gaming Highlights: Tournament Finals",
    description: "Best moments from the recent esports championship",
    usedIn: 6,
    tags: ["Gaming", "Esports", "Highlights"],
    source: 'From Video',
  },
  {
    id: "9",
    title: "DIY Home Decor: Upcycling Projects",
    description: "Creative ideas to transform old furniture into stylish pieces",
    usedIn: 2,
    tags: ["DIY", "Home Decor", "Upcycling"],
    source: 'From Video',
  },
  {
    id: "10",
    title: "Language Learning: Spanish for Beginners",
    description: "Introduction to basic Spanish phrases and vocabulary",
    usedIn: 1,
    tags: ["Education", "Language", "Spanish"],
    source: 'From Video',
  }
];
