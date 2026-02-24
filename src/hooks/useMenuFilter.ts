import { useState, useMemo } from 'react';
import { MENU_ITEMS, MenuItem } from '../data/menu';

export const CATEGORIES = [
  { id: 'all', label: 'Sve' },
  { id: 'gyros', label: 'Gyros' },
  { id: 'sides', label: 'Dodaci' },
  { id: 'meals', label: 'Special' },
  { id: 'tortillas', label: 'Tortilje' },
  { id: 'kids', label: 'Kids' },
];

export const useMenuFilter = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') {
      return MENU_ITEMS;
    }

    return MENU_ITEMS.filter((item) => {
      // Special handling for mobile category "move"
      const specialGyrosItems = ['vege-hero', 'hero-full-obrok'];

      if (activeCategory === 'gyros') {
        return item.category === 'gyros' || specialGyrosItems.includes(item.id);
      }

      if (activeCategory === 'meals') {
        return item.category === 'meals' && !specialGyrosItems.includes(item.id);
      }

      return item.category === activeCategory;
    });
  }, [activeCategory]);

  // Static grouped items for desktop layout
  const groupedItems = useMemo(() => ({
    gyros: MENU_ITEMS.filter((item) => item.category === 'gyros'),
    sides: MENU_ITEMS.filter((item) => item.category === 'sides'),
    meals: MENU_ITEMS.filter((item) => item.category === 'meals' || item.category === 'tortillas'),
    kids: MENU_ITEMS.filter((item) => item.category === 'kids'),
  }), []);

  return {
    activeCategory,
    setActiveCategory,
    filteredItems,
    groupedItems,
    categories: CATEGORIES,
  };
};
