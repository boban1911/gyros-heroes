import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Locations from '../../src/pages/Locations';
import React from 'react';

describe('Locations Page', () => {
  it('renders the page title', () => {
    render(<MemoryRouter><Locations /></MemoryRouter>);
    const titles = screen.getAllByText(/Naše/i);
    expect(titles.length).toBeGreaterThan(0);
    // Use role to find the h1 specifically
    expect(screen.getByRole('heading', { level: 1, name: /Naše Lokacije/i })).toBeInTheDocument();
  });

  it('renders all 3 locations', () => {
    render(<MemoryRouter><Locations /></MemoryRouter>);
    // We have 2 Niš and 1 Novi Sad
    const nisElements = screen.getAllByText('Niš');
    expect(nisElements.length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Novi Sad').length).toBeGreaterThan(0);
  });

  it('renders addresses', () => {
    render(<MemoryRouter><Locations /></MemoryRouter>);
    // Addresses appear in card and in footer, so getAllByText
    expect(screen.getAllByText('Nikole Pašića 39').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Park Sv. Save').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bulevar Oslobođenja 89e').length).toBeGreaterThan(0);
  });

  it('renders Google Maps iframes', () => {
    render(<MemoryRouter><Locations /></MemoryRouter>);
    // eslint-disable-next-line testing-library/no-node-access
    const iframes = document.querySelectorAll('iframe');
    expect(iframes.length).toBe(3);
  });
});