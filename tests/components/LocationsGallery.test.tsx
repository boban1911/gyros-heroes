import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LocationsGallery from '../../src/components/LocationsGallery';
import React from 'react';

describe('LocationsGallery Component', () => {
  it('renders the main title', () => {
    render(<LocationsGallery />);
    expect(screen.getByText(/Pogledaj naše/i)).toBeInTheDocument();
    expect(screen.getByText(/Lokacije & galeriju/i)).toBeInTheDocument();
  });

  it('renders three location cards', () => {
    render(<LocationsGallery />);
    const cities = screen.getAllByRole('heading', { level: 3 });
    expect(cities).toHaveLength(3);
    expect(screen.getAllByText('Niš')).toHaveLength(2);
    expect(screen.getByText('Novi Sad')).toBeInTheDocument();
  });

  it('displays the correct updated Sunday hours', () => {
    render(<LocationsGallery />);
    const sundayHours = screen.getAllByText(/Ned: 10:00 - 00:00/i);
    expect(sundayHours).toHaveLength(3);
  });

  it('renders phone numbers correctly', () => {
    render(<LocationsGallery />);
    expect(screen.getByText('063 738 9890')).toBeInTheDocument();
    expect(screen.getByText('065 938 1784')).toBeInTheDocument();
    expect(screen.getByText('066 373 666')).toBeInTheDocument();
  });
});
