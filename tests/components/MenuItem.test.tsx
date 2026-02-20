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

    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'test-image.png');
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test Item');
  });
});
