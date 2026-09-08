import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FlashSaleBanner } from '../FlashSaleBanner.js';

describe('FlashSaleBanner Component', () => {
  it('renders headline and flash sale badges', () => {
    render(
      <MemoryRouter>
        <FlashSaleBanner />
      </MemoryRouter>,
    );

    expect(screen.getByText(/LIMITED FLASH SALE • UP TO 60% OFF/i)).toBeInTheDocument();
    expect(screen.getByText(/Grab Flagship Tech At/i)).toBeInTheDocument();
    expect(screen.getByText(/Unbeatable Festive Prices/i)).toBeInTheDocument();
  });

  it('renders all countdown units', () => {
    render(
      <MemoryRouter>
        <FlashSaleBanner />
      </MemoryRouter>,
    );

    expect(screen.getByText('Days')).toBeInTheDocument();
    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Minutes')).toBeInTheDocument();
    expect(screen.getByText('Seconds')).toBeInTheDocument();
  });

  it('renders promo code button and handles click', () => {
    render(
      <MemoryRouter>
        <FlashSaleBanner />
      </MemoryRouter>,
    );

    const couponBtn = screen.getByRole('button', { name: /USE CODE: BHAI20/i });
    expect(couponBtn).toBeInTheDocument();

    fireEvent.click(couponBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('BHAI20');
  });

  it('renders shop flash deals link pointing to /products', () => {
    render(
      <MemoryRouter>
        <FlashSaleBanner />
      </MemoryRouter>,
    );

    const dealsLink = screen.getByRole('link', { name: /Shop Flash Deals/i });
    expect(dealsLink).toBeInTheDocument();
    expect(dealsLink).toHaveAttribute('href', '/products');
  });

  it('handles mouse enter and leave on copy code button', () => {
    render(
      <MemoryRouter>
        <FlashSaleBanner />
      </MemoryRouter>,
    );

    const couponBtn = screen.getByRole('button', { name: /USE CODE: BHAI20/i });
    fireEvent.mouseEnter(couponBtn);
    expect(couponBtn.style.borderColor).toBe('rgb(96, 165, 250)');

    fireEvent.mouseLeave(couponBtn);
    expect(couponBtn.style.borderColor).toBe('rgba(255, 255, 255, 0.25)');
  });

  it('updates ticking countdown with interval', () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter>
        <FlashSaleBanner />
      </MemoryRouter>,
    );
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    vi.useRealTimers();
  });
});
