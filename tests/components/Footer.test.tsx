import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '../../src/components/Footer';
import React from 'react';

describe('Footer Component', () => {
  it('renders the footer element', () => {
    render(<Footer />);
    // Check by data-node-id since role might be ambiguous if not explicitly set as contentinfo
    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('renders the logo', () => {
    render(<Footer />);
    const logo = screen.getByAltText('Gyros Heroes Logo');
    expect(logo).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Footer />);
    expect(screen.getByText('Hero')).toBeInTheDocument();
    expect(screen.getByText('O nama')).toBeInTheDocument();
    expect(screen.getByText('Meni')).toBeInTheDocument();
    expect(screen.getByText('Lokacije')).toBeInTheDocument();
    expect(screen.getByText('Posao')).toBeInTheDocument();
    expect(screen.getByText('Testimonijali')).toBeInTheDocument();
  });

  it('renders location entries', () => {
    render(<Footer />);
    expect(screen.getAllByText('Order & Pickup').length).toBeGreaterThan(0);
    expect(screen.getByText('Location NI 1')).toBeInTheDocument();
    expect(screen.getByText('Location NI 2')).toBeInTheDocument();
    expect(screen.getByText('Location NS')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer />);
    const facebookImg = screen.getByAltText('Facebook');
    const instagramImg = screen.getByAltText('Instagram');
    
    expect(facebookImg).toBeInTheDocument();
    expect(instagramImg).toBeInTheDocument();
    
    const facebookLink = facebookImg.closest('a');
    const instagramLink = instagramImg.closest('a');
    
    expect(facebookLink).toHaveAttribute('href', '#');
    expect(instagramLink).toHaveAttribute('href', '#');
  });

  it('renders bottom bar information', () => {
    render(<Footer />);
    expect(screen.getByText('All right reserved')).toBeInTheDocument();
    expect(screen.getByText('Gyros Heroes 2025')).toBeInTheDocument();
    expect(screen.getByText('Term & Conditions')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Cookie Settings')).toBeInTheDocument();
  });
});
