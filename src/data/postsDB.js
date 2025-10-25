const postsDB = [
  {
    community: "reddit",
    username: "DevMaster",
    time: "3 hours ago",
    title: "React vs Vue in 2025",
    textPreview: "Which one do you prefer for new projects?",
    preview: "Full post content here...",
    avatar: "/images/avatar.png",
    initialVotes: 5,
    initialComments: [
      { username: "CodeNerd", text: "React still dominates for enterprise!" },
      { username: "JSWizard", text: "Vue is catching up fast though." },
    ],
  },
  {
    community: "harrypotter",
    username: "WizardFan",
    time: "1 day ago",
    title: "Bulletin board tips",
    textPreview:
      "I recently have been doing the bulletin boards as I never really did them and have been doing the truck to make a bunch of drinks...",
    avatar: "../images/avatar.png",
    initialVotes: 12,
    initialComments: [
      { username: "PotionMaster", text: "Nice tip, thanks for sharing!" },
      { username: "QuidditchPro", text: "I didn’t notice that either 😅" },
    ],
  },
  {
    community: "playstation",
    username: "GamerX",
    time: "5 hours ago",
    title: "My collection so far",
    preview: "/images/post_image1.png",
    avatar: "/images/avatar.png",
    initialVotes: 7,
    initialComments: [
      { username: "RetroFan", text: "That’s an awesome setup!" },
    ],
  },
  {
    community: "GoodCoffeeGreatCoffee",
    username: "CoffeeLover123",
    time: "2 hours ago",
    title: "Best brewing method for cold brew?",
    textPreview: "I've been experimenting with cold brew at home...",
    preview: "Full post content goes here...",
    avatar: "/images/avatar.png",
    initialVotes: 10,
    initialComments: [
      { username: "BaristaLife", text: "I like using the French press!" },
      { username: "CafeAddict", text: "Try using coarser grind next time ☕" },
    ],
  },
];

export default postsDB;