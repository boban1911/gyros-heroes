import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MenuItem from '../../src/components/MenuItem';
import { MenuItem as MenuItemType } from '../../src/data/menu';

describe('MenuItem Component', () => {
  const mockItem: MenuItemType = {
    id: 'test-item',
    title: 'Test Item',
    description: 'Test Description',
    image: 'test-image.png',
    category: 'meals',
    price: '1000 RSD',
  };

  it('renders title, description and image', () => {
    render(<MenuItem item={mockItem} />);

    // Multiple elements because of mobile/desktop versions
    const titles = screen.getAllByText('Test Item');
    expect(titles.length).toBeGreaterThanOrEqual(1);
    expect(titles[0]).toBeInTheDocument();

    const descriptions = screen.getAllByText('Test Description');
    expect(descriptions.length).toBeGreaterThanOrEqual(1);
    expect(descriptions[0]).toBeInTheDocument();

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(1);
    expect(images[0]).toHaveAttribute('src', 'test-image.png');
    expect(images[0]).toHaveAttribute('alt', 'Test Item');
  });
});
