const surrealistPromptPimper1 = prompt => `${prompt}. Surrealism. Klarwein, Dali, Magritte`;
const surrealistPromptPimper2 = prompt => `${prompt}. surrealistic. illustration. painting. Hand drawn. Black and white.`;
const risographPromptPimper3 = prompt => `${prompt}. Risograph. Minimalism.`;
const retroFuturisticPromptPimper4 = prompt => `Retro-futurist ${prompt}. vintage sci-fi.`;
const vintagePhotoPimper = prompt => `analog film photo ${prompt} . faded film, desaturated, 35mm photo, grainy, vignette, vintage, Kodachrome, Lomography, stained, highly detailed, found footage`;
const solarPunkPromptPimper = prompt => `A solarpunk ${prompt}, high resolution, neon lights, light and shadow`;
const graffitiPromptPimper = prompt => `${prompt}. graffiti art, inspired by, andrey gordeev`;
const paperQuilling = prompt => `paper quilling art of ${prompt} . intricate, delicate, curling, rolling, shaping, coiling, loops, 3D, dimensional, ornamental`;
const paperCut = prompt => `papercut collage of ${prompt} . mixed media,`;
const digitalPainting = prompt => `${prompt}. a digital painting, by Jason Benjamin, shutterstock, colorful vector illustration, mixed media style illustration, epic full color illustration, mascot illustration`;

// const pimpDreamPrompts = (prompts) => prompts.split("\n").map(risographPromptPimper3).join("\n");
// execute one of the previously defined promptPimpers depending on the minute of the hour
export const timeBasedPromptPimper = prompt => {
  const minute = new Date().getMinutes();
  if (minute < 10) return digitalPainting(prompt);
  if (minute < 20) return paperCut(prompt);
  if (minute < 30) return surrealistPromptPimper2(prompt);
  if (minute < 40) return retroFuturisticPromptPimper4(prompt);
  if (minute < 50) return surrealistPromptPimper2(prompt);
  return vintagePhotoPimper(prompt);
};
