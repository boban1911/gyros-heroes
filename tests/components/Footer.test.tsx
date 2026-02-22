import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '../../src/components/Footer';

describe('Footer Component', () => {
  it('renders the footer element', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('renders the logo', () => {
    render(<Footer />);
    // Logo usually has an img role or we can check for alt text if we know it
    // In Logo.tsx, alt="Gyros Heroes Logo"
    expect(screen.getByAltText(/Gyros Heroes Logo/i)).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer />);
    const facebookLink = screen.getByLabelText(/Facebook/i);
    const instagramLink = screen.getByLabelText(/Instagram/i);
    expect(facebookLink).toBeInTheDocument();
    expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/gyrosheroes');
    expect(instagramLink).toBeInTheDocument();
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/gyrosheroes');
  });

  it('renders quick links', () => {
    render(<Footer />);
    expect(screen.getByText(/O Nama/i)).toBeInTheDocument();
    expect(screen.getByText(/Meni/i)).toBeInTheDocument();
    expect(screen.getByText(/Lokacije/i)).toBeInTheDocument();
    expect(screen.getByText(/Utisci/i)).toBeInTheDocument();
  });

  it('renders contact information', () => {
    render(<Footer />);
    expect(screen.getByText(/Trg Republike 5/i)).toBeInTheDocument();
    expect(screen.getByText(/\+381 11 123 4567/i)).toBeInTheDocument();
    expect(screen.getByText(/info@gyrosheroes.com/i)).toBeInTheDocument();
  });

  it('renders copyright information', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} Gyros Heroes`, 'i'))).toBeInTheDocument();
  });
});
