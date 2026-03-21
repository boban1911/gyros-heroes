import classicHeroImg from '../assets/menu/classic-hero.webp';
import pomfritImg from '../assets/menu/pomfrit.webp';
import heroPomfritImg from '../assets/menu/hero-pomfrit.webp';
import pomfritCheddarImg from '../assets/menu/pomfrit-cheddar.webp';
import pomfritCheddarSlaninaImg from '../assets/menu/pomfrit-cheddar-slanina.webp';
import superHeroImg from '../assets/menu/super-hero.webp';
import heroTortillaImg from '../assets/menu/hero-tortilla.webp';
import chickenHeroNuggetsImg from '../assets/menu/chicken-hero-nuggets.webp';
import pohovaniHeroImg from '../assets/menu/pohovani-hero.webp';
import chickenHeroNuggetsBoxImg from '../assets/menu/chicken-hero-nuggets-box.webp';
import chickenHeroWrapImg from '../assets/menu/chicken-hero-wrap.webp';
import kidsHeroObrokImg from '../assets/menu/kids-hero-obrok.webp';
import platterBaseImg from '../assets/menu/platter-base.webp';
import heroFullObrokMeatImg from '../assets/menu/hero-full-obrok-meat.webp';
import vegeHeroToppingImg from '../assets/menu/vege-hero-topping.webp';

export interface MenuItemLayer {
  src: string;
  className: string;
}

export type MenuCategory = 'gyros' | 'sides' | 'tortillas' | 'meals' | 'kids';

export interface BaseMenuItem {
  id: string;
  title: string;
  description?: string;
  category: MenuCategory;
  price?: string;
  tags?: string[];
  scale?: string;
}

export interface SimpleMenuItem extends BaseMenuItem {
  type: 'simple';
  image: string;
}

export interface LayeredMenuItem extends BaseMenuItem {
  type: 'layered';
  image: string; // Base image is still useful for some contexts
  layers: MenuItemLayer[];
  topping?: string;
}

export type MenuItem = SimpleMenuItem | LayeredMenuItem;

export const MENU_ITEMS: MenuItem[] = [
  // Gyros Types (Top Section)
  {
    type: 'simple',
    id: 'classic-hero',
    title: 'CLASSIC HERO',
    description: 'Svinjski/Pileći/Mix: Gyros meso, gyros pita, pomfrit + 4 priloga po izboru',
    image: classicHeroImg,
    category: 'gyros',
  },
  {
    type: 'simple',
    id: 'veliki-hero',
    title: 'VELIKI HERO',
    description: 'Svinjski/Pileći/Mix: Gyros meso, gyros pita, pomfrit + 4 priloga po izboru',
    image: classicHeroImg,
    category: 'gyros',
  },
  {
    type: 'simple',
    id: 'bas-veliki-hero',
    title: 'BAŠ VELIKI HERO',
    description: 'Svinjski/Pileći/Mix: Gyros meso, gyros pita, pomfrit + 4 priloga po izboru',
    image: classicHeroImg,
    category: 'gyros',
  },
  {
    type: 'simple',
    id: 'kids-hero-gyro',
    title: 'KIDS HERO',
    description: 'Svinjski/Pileći/Mix: Gyros meso, gyros pita, pomfrit + 4 priloga po izboru',
    image: classicHeroImg,
    category: 'gyros',
  },

  // Meals / Tortillas / Etc (Grid)
  {
    type: 'simple',
    id: 'super-hero',
    title: 'SUPER HERO',
    description: 'Pilece gyros meso, kackavalj, zelena salata, paradajz, tzatziki, pomfrit + 1 sos po izboru',
    image: superHeroImg,
    category: 'meals',
  },
  {
    type: 'simple',
    id: 'hero-tortilla',
    title: 'HERO TORTILLA',
    description: 'Pilece gyros meso u tortilji + 2 sosa + 3 salate po izboru',
    image: heroTortillaImg,
    category: 'tortillas',
  },
  {
    type: 'layered',
    id: 'hero-full-obrok',
    title: 'HERO FULL OBROK',
    description: 'Svinjski/Pileći/Mix: Gyros meso, gyros pita, pomfrit + 1 sos + 2 salate po izboru',
    image: platterBaseImg,
    layers: [
      { src: platterBaseImg, className: 'absolute left-[-15.63%] max-w-none size-[191.34%] top-[-42.18%]' },
      { src: heroFullObrokMeatImg, className: 'absolute h-[130.67%] left-[-54.06%] max-w-none top-[-11.47%] w-[195.98%]' }
    ],
    category: 'meals',
  },
  {
    type: 'simple',
    id: 'chicken-hero-nuggets',
    title: 'CHICKEN HERO NUGGETS',
    description: 'Pet pilecih nuggetsa, pomfrit, grika pita + 4 namaza po izboru',
    image: chickenHeroNuggetsImg,
    category: 'meals',
  },
  {
    type: 'simple',
    id: 'pohovani-hero',
    title: 'POHOVANI HERO',
    description: 'Pohovani kackavalj, gyros pita, pomfrit + 4 priloga po izboru',
    image: pohovaniHeroImg,
    category: 'meals',
  },
  {
    type: 'simple',
    id: 'chicken-hero-nuggets-box',
    title: 'CHICKEN HERO NUGGETS BOX',
    description: 'Pileci nuggetsi + 2 sosa po izboru',
    image: chickenHeroNuggetsBoxImg,
    category: 'meals',
  },
  {
    type: 'simple',
    id: 'chicken-hero-wrap',
    title: 'CHICKEN HERO WRAP',
    description: 'Priena piletina u tortilji, pomfrit, kiporou salata, paradajz, kupus',
    image: chickenHeroWrapImg,
    category: 'tortillas',
  },
  {
    type: 'layered',
    id: 'vege-hero',
    title: 'VEGE HERO',
    description: 'Svinjski/Pileći/Mix: Gyros pita, pomfrit + 4 priloga po izboru',
    image: platterBaseImg,
    layers: [
      { src: platterBaseImg, className: 'absolute left-[-15.63%] max-w-none size-[191.34%] top-[-42.18%]' },
      { src: vegeHeroToppingImg, className: 'absolute h-[214.09%] left-[-106.14%] max-w-none top-[-67.05%] w-[321.18%]' }
    ],
    category: 'meals',
  },

  // Kids
  {
    type: 'simple',
    id: 'kids-hero-obrok',
    title: 'KIDS HERO OBROK',
    description: 'Nuggets Obrok: 6 Nuggetsa, pomfrit, sok od jabuke + poklon\nGyros Obrok: Kids Hero Gyros, pomfrit, sok od jabuke + poklon',
    image: kidsHeroObrokImg,
    category: 'kids',
  },

  // Sides (Dodaci)
  {
    type: 'simple',
    id: 'pomfrit',
    title: 'POMFRIT',
    image: pomfritImg,
    category: 'sides',
    scale: '1.7',
  },
  {
    type: 'simple',
    id: 'hero-pomfrit',
    title: 'HERO POMFRIT',
    image: heroPomfritImg,
    category: 'sides',
    scale: '1.7',
  },
  {
    type: 'simple',
    id: 'pomfrit-cheddar',
    title: 'POMFRIT CHEDDAR SIR',
    image: pomfritCheddarImg,
    category: 'sides',
    scale: '1.7',
  },
  {
    type: 'simple',
    id: 'pomfrit-cheddar-slanina',
    title: 'POMFRIT CHEDDAR - SLANINA',
    image: pomfritCheddarSlaninaImg,
    category: 'sides',
    scale: '1.7',
  },
];
