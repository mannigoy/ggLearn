/*
  Sample content for the public site. The experiment list is a draft for the team to confirm;
  every item uses only kitchen staples plus the basics every home has (water, cups, jars, tape, paper).
*/

/** Kitchen items a kid can tick. `on` = ticked when the page opens. */
export const KITCHEN = [
  { id: 'baking-soda', label: 'Baking soda', on: true },
  { id: 'vinegar', label: 'Vinegar', on: true },
  { id: 'dish-soap', label: 'Dish soap', on: true },
  { id: 'salt', label: 'Salt', on: true },
  { id: 'sugar', label: 'Sugar', on: true },
  { id: 'ice', label: 'Ice cubes', on: true },
  { id: 'pepper', label: 'Black pepper', on: true },
  { id: 'food-colouring', label: 'Food colouring', on: false },
  { id: 'yeast', label: 'Yeast', on: false },
  { id: 'balloon', label: 'A balloon', on: false },
  { id: 'raisins', label: 'Raisins', on: false },
  { id: 'soda', label: 'Clear soda', on: false },
  { id: 'celery', label: 'Celery', on: false },
  { id: 'beans', label: 'Dry beans', on: false },
  { id: 'paper-towels', label: 'Paper towels', on: false },
  { id: 'crayons', label: 'Old crayons', on: false }
];

export const KITCHEN_LABEL = Object.fromEntries(KITCHEN.map((k) => [k.id, k.label.toLowerCase()]));

export const SHELF = [
  {
    topic: 'Living things', icon: 'leaf', tone: 'mint',
    items: [
      { name: 'Why does bread rise?', time: '20 min', grade: 'Grade 3', needs: ['yeast', 'sugar', 'balloon'], about: 'Feed yeast some sugar and watch a balloon fill with the gas it breathes out.' },
      { name: 'Celery drinks colour', time: 'Overnight', grade: 'Grade 2', needs: ['celery', 'food-colouring'], about: 'Stand a stalk in coloured water, then find the colour in its leaves.' },
      { name: 'A bean in a bag', time: '1 week', grade: 'Kindergarten', needs: ['beans', 'paper-towels'], about: 'Watch a root, then a shoot, push out of one bean on the window.' },
      { name: 'Fingerprint detectives', time: '15 min', grade: 'Grade 1', needs: [], about: 'Lift your prints with tape and sort them into loops, whorls and arches.' },
      { name: 'Beaks and spoons', time: '20 min', grade: 'Grade 3', needs: ['beans'], about: 'Which kitchen tool is the best beak for picking up seeds?' }
    ]
  },
  {
    topic: 'Earth and sky', icon: 'globe', tone: 'sky',
    items: [
      { name: 'A cloud in a jar', time: '15 min', grade: 'Grade 2', needs: ['ice'], about: 'Warm water below, ice on top, and a little grey cloud forms between.' },
      { name: 'The shadow clock', time: 'All day', grade: 'Grade 1', needs: [], about: 'Mark a stick’s shadow every hour and watch it swing round.' },
      { name: 'Soil in layers', time: 'Overnight', grade: 'Grade 4', needs: [], about: 'Shake garden soil in a jar of water and read the layers in the morning.' },
      { name: 'The crayon rock cycle', time: '30 min', grade: 'Grade 4', needs: ['crayons'], about: 'Shave, press and melt crayons the way rocks change over time.' },
      { name: 'The ice melt race', time: '20 min', grade: 'Grade 2', needs: ['ice', 'salt', 'sugar'], about: 'Salt, sugar or nothing: which ice cube melts first?' }
    ]
  },
  {
    topic: 'Push, pull and fizz', icon: 'bolt', tone: 'coral',
    items: [
      { name: 'The fizzing volcano', time: '15 min', grade: 'Kindergarten', needs: ['baking-soda', 'vinegar', 'dish-soap'], about: 'Mix two kitchen powders and liquids and make a foaming eruption.' },
      { name: 'Dancing raisins', time: '10 min', grade: 'Grade 1', needs: ['raisins', 'soda'], about: 'Bubbles lift raisins to the top, then drop them back down.' },
      { name: 'Sink or float?', time: '15 min', grade: 'Kindergarten', needs: [], about: 'Guess first, then test ten things from the kitchen drawer.' },
      { name: 'Pepper runs away', time: '5 min', grade: 'Grade 2', needs: ['pepper', 'dish-soap'], about: 'One drop of soap sends floating pepper racing to the edge.' },
      { name: 'The walking rainbow', time: '1 hour', grade: 'Grade 2', needs: ['paper-towels', 'food-colouring'], about: 'Coloured water climbs paper towels and mixes in the middle cup.' },
      { name: 'The balloon that pulls', time: '10 min', grade: 'Kindergarten', needs: ['balloon'], about: 'Rub a balloon on your hair and lift paper bits without touching them.' },
      { name: 'A balloon with no breath', time: '15 min', grade: 'Grade 3', needs: ['baking-soda', 'vinegar', 'balloon'], about: 'Blow up a balloon with fizz instead of your lungs.' }
    ]
  }
];

export const SHELF_COUNT = SHELF.reduce((n, g) => n + g.items.length, 0);
