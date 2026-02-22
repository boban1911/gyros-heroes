import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VideoSection from '../../src/components/VideoSection';

describe('VideoSection', () => {
  it('renders the video section with play button', () => {
    render(<VideoSection />);
    
    // Check if the section exists
    const section = document.querySelector('#video-section');
    expect(section).toBeInTheDocument();
    
    // Check for play button image
    const playButton = screen.getByAltText('Play Video');
    expect(playButton).toBeInTheDocument();
    expect(playButton).toHaveAttribute('src', expect.stringContaining('icon-play.svg'));
  });

  it('has correct styling classes', () => {
    render(<VideoSection />);
    
    const container = screen.getByLabelText('Promotional Video Placeholder');
    expect(container).toHaveClass('bg-grey-black');
    expect(container).toHaveClass('rounded-[40px]');
    expect(container).toHaveClass('md:rounded-lg');
  });
});
