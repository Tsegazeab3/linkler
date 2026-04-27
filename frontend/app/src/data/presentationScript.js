export const script = [
  {
    id: 'step-0',
    trigger: null,
    linkler: "Are you ready to explore?",
    nextUser: "I want to but I don't know where",
    action: { type: 'spotlight', target: 'main-feed', zoom: false }
  },
  {
    id: 'step-1',
    trigger: "I want to but I don't know where",
    linkler: "I got you. Just press the home button.",
    nextUser: "(Press the Home button)",
    action: { type: 'spotlight', target: 'walkthrough-home', zoom: true }
  },
  {
    id: 'step-2',
    trigger: "action:home-clicked",
    linkler: "Here is your feed. You can explore different places and see what others are up to.",
    nextUser: "(Like a post about a country)",
    action: { type: 'spotlight', target: null, zoom: false }
  },
  {
    id: 'step-3',
    trigger: "action:post-liked",
    linkler: "So you like to go here?",
    nextUser: "yes but I don't want to go there alone",
    action: { type: 'spotlight', target: null, zoom: false }
  },
  {
    id: 'step-4',
    trigger: "yes but I don't want to go there alone",
    linkler: "I got you. Just press the compass button on this post.",
    nextUser: "(Press the Compass button on the post)",
    action: { type: 'spotlight', target: 'post-search-trips', zoom: true }
  },
  {
    id: 'step-5',
    trigger: "action:trips-opened",
    linkler: "Plenty of travelers to go with! This shows how many people are required and how many seats are left. Click connect if you find what you like. You can also post your own trip by pressing this button.",
    nextUser: "But I don't know anything about dubai the rules and regulations, and how do I travel, how do I get a house there.",
    action: { type: 'spotlight', target: null, zoom: false }
  },
  {
    id: 'step-6',
    trigger: "But I don't know anything about dubai the rules and regulations, and how do I travel, how do I get a house there.",
    linkler: "Don't worry about it I got you, just press the essentials button.",
    nextUser: "(Press the Essentials button)",
    action: { type: 'spotlight', target: 'walkthrough-essentials', zoom: true }
  },
  {
    id: 'step-7',
    trigger: "action:essentials-opened",
    linkler: "These are services that make things happen for you. You can choose among the different essential things and get someone you can trust with the reviews.",
    nextUser: "but still even if I get this things done I don't know what I should be doing there do you got an answer for that",
    action: { type: 'spotlight', target: null, zoom: false }
  },
  {
    id: 'step-8',
    trigger: "but still even if I get this things done I don't know what I should be doing there do you got an answer for that",
    linkler: "Matter of fact I do, you can choose among the multiple of guides inside.",
    nextUser: "how do I know I am not getting ripped off",
    action: { type: 'spotlight', target: 'walkthrough-experiences', zoom: true }
  },
  {
    id: 'step-9',
    trigger: "how do I know I am not getting ripped off",
    linkler: "You don't need to worry about that just press the deals button.",
    nextUser: "(Press the Deals button)",
    action: { type: 'spotlight', target: 'walkthrough-deals', zoom: true }
  }
];
