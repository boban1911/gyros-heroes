import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../../src/components/Footer';
import React from 'react';

describe('Footer Component', () => {
  it('renders the footer element', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('renders the background illustration', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    const bgContainer = document.querySelector('footer > div.absolute');
    expect(bgContainer).toBeInTheDocument();
    expect(bgContainer).toHaveClass('aspect-[1820/1228]');
    expect(bgContainer).toHaveClass('translate-y-[82%]');
  });

  it('renders city headers', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    expect(screen.getByText('Niš')).toBeInTheDocument();
    expect(screen.getByText('Novi Sad')).toBeInTheDocument();
  });

  it('renders social media links with correct handles', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    expect(screen.getByText('gyrosheroespremiumfood')).toBeInTheDocument();
    expect(screen.getByText('gyros.heroes.nis')).toBeInTheDocument();
    expect(screen.getByText('gyrosheroesnovisad')).toBeInTheDocument();
    expect(screen.getByText('gyros.heroes.ns')).toBeInTheDocument();
    
    const links = screen.getAllByRole('link');
    expect(links.some(l => l.getAttribute('href')?.includes('facebook.com/gyrosheroespremiumfood'))).toBe(true);
    expect(links.some(l => l.getAttribute('href')?.includes('instagram.com/gyros.heroes.nis'))).toBe(true);
  });

  it('renders legal and copyright information', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    expect(screen.getByText('Uslovi Korišćenja')).toBeInTheDocument();
    expect(screen.getByText('Politika Privatnosti')).toBeInTheDocument();
    expect(screen.getByText('Podešavanje Kolačića')).toBeInTheDocument();
    expect(screen.getByText('Sva prava zadržana')).toBeInTheDocument();
    expect(screen.getByText('Gyros Heroes 2025')).toBeInTheDocument();
  });

  it('renders icons', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    // Copyright icon
    expect(screen.getByAltText('Copyright icon')).toBeInTheDocument();
  });
});
