const surrealistPromptPimper1 = prompt => `${prompt}. Surrealism. Klarwein, Dali, Magritte`;
const surrealistPromptPimper2 = prompt => `${prompt}. surrealistic. illustration. painting. Hand drawn. Black and white.`;
const risographPromptPimper3 = prompt => `${prompt}. Risograph. Minimalism.`;
<<<<<<< HEAD
const retroFuturisticPromptPimper4 = prompt => `Retro-futurist ${prompt}. vintage sci-fi.`;
const vintagePhotoPimper = prompt => `analog film photo ${prompt} . faded film, desaturated, 35mm photo, grainy, vignette, vintage, Kodachrome, Lomography, stained, highly detailed, found footage`;
const solarPunkPromptPimper = prompt => `A solarpunk ${prompt}, high resolution, neon lights, light and shadow`;
const graffitiPromptPimper = prompt => `${prompt}. graffiti art, inspired by, andrey gordeev`;
const paperQuilling = prompt => `paper quilling art of ${prompt} . intricate, delicate, curling, rolling, shaping, coiling, loops, 3D, dimensional, ornamental`;
const paperCut = prompt => `papercut collage of ${prompt} . mixed media,`;
const digitalPainting = prompt => `${prompt}. a digital painting, by Jason Benjamin, shutterstock, colorful vector illustration, mixed media style illustration, epic full color illustration, mascot illustration`;
=======
const retroFuturisticPromptPimper4 = prompt => `Retro-futurist ${prompt}. Poster. vintage sci-fi, 50s and 60s style, atomic age, vibrant,`;
const vintagePhotoPimper = prompt => `analog film photo ${prompt} . objects. minimalism. faded film, desaturated, 35mm photo, grainy, vignette, vintage, Kodachrome, Lomography, stained, highly detailed, found footage`;
const solarPunkPromptPimper = prompt => `A solarpunk ${prompt}, high resolution, neon lights, light and shadow`;
const graffitiPromptPimper = prompt => `${prompt}. graffiti art, inspired by, andrey gordeev`;
const paperQuilling = prompt => `paper quilling art of ${prompt} . intricate, delicate, curling, rolling, shaping, coiling, loops, 3D, dimensional, ornamental`;
const paperCut = prompt => `papercut collage of ${prompt} . mixed media, textured paper, overlapping, asymmetrical, abstract, vibrant, dimensional`;
const psychedelic1 = prompt => `psychedelic art. rough. glitchy. ${prompt}`;
const psychedelic2 = prompt => `psychedelic style ${prompt} . vibrant colors, swirling patterns, abstract forms, surreal, trippy`
const pointilism = prompt => `pointillism style ${prompt} . composed entirely of small, distinct dots of color, vibrant, highly detailed`;
const surrealism1 = prompt => `surrealist art ${prompt} . dreamlike, mysterious, provocative, symbolic, intricate, detailed`;
const kirigami = prompt => `kirigami representation of ${prompt} . fabric folding, fabric cutting, Japanese, intricate carpet details, symmetrical, delicate ornamental, colorful`;
const lomo = prompt => `lomography. ${prompt}. double exposure, analog film, grainy`;
// `paper quilling art of {prompt} . intricate, delicate, curling, rolling, shaping, coiling, loops, 3D, dimensional, ornamental`
>>>>>>> 7ee31577cea1c2b5f9154833921c149c5142d6ac

// const pimpDreamPrompts = (prompts) => prompts.split("\n").map(risographPromptPimper3).join("\n");
// execute one of the previously defined promptPimpers depending on the minute of the hour
export const timeBasedPromptPimper = prompt => {
  const minute = new Date().getMinutes();
<<<<<<< HEAD
  if (minute < 10) return digitalPainting(prompt);
  if (minute < 20) return paperCut(prompt);
  if (minute < 30) return surrealistPromptPimper2(prompt);
  if (minute < 40) return retroFuturisticPromptPimper4(prompt);
  if (minute < 50) return surrealistPromptPimper2(prompt);
  return vintagePhotoPimper(prompt);
=======
  if (minute < 10) return psychedelic1(prompt);
  if (minute < 20) return lomo(surrealistPromptPimper2);
  if (minute < 30) return pointilism(prompt);
  if (minute < 40) return vintagePhotoPimper(prompt);
  if (minute < 50) return surrealism1(prompt);
  return kirigami(prompt); 
>>>>>>> 7ee31577cea1c2b5f9154833921c149c5142d6ac
};
