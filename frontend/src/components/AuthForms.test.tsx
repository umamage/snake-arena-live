import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { AuthForms } from './AuthForms';
import { AuthProvider } from '@/contexts/AuthContext';

// Wrapper with AuthProvider
const renderWithAuth = (component: React.ReactNode) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AuthForms', () => {
  it('renders login form by default', () => {
    const { container } = renderWithAuth(<AuthForms />);

    expect(container.textContent).toContain('LOGIN');
    expect(container.textContent).toContain('SIGN UP');
    expect(container.textContent).toContain('EMAIL');
    expect(container.textContent).toContain('PASSWORD');
  });

  it('shows demo credentials on login mode', () => {
    const { container } = renderWithAuth(<AuthForms />);

    expect(container.textContent).toContain('DEMO ACCOUNT:');
    expect(container.textContent).toContain('player1@test.com');
  });

  it('renders enter game button', () => {
    const { container } = renderWithAuth(<AuthForms />);

    const button = container.querySelector('button[type="submit"]');
    expect(button?.textContent).toContain('ENTER GAME');
  });

  it('renders email input with required attribute', () => {
    const { container } = renderWithAuth(<AuthForms />);

    const emailInput = container.querySelector('input[type="email"]');
    expect(emailInput).toHaveAttribute('required');
  });

  it('renders password input with required attribute', () => {
    const { container } = renderWithAuth(<AuthForms />);

    const passwordInput = container.querySelector('input[type="password"]');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('switches to signup when signup tab clicked', async () => {
    const { container } = renderWithAuth(<AuthForms />);

    // Find and click signup tab
    const tabs = container.querySelectorAll('button');
    const signupTab = Array.from(tabs).find((b: HTMLButtonElement) => b.textContent?.includes('SIGN UP')) as HTMLButtonElement | undefined;

    if (signupTab) {
      fireEvent.click(signupTab);
    }

    // After clicking signup, should show username field
    const usernameInput = await screen.findByLabelText('USERNAME');
    expect(usernameInput).toBeTruthy();
  });

  it('accepts onSuccess callback prop', () => {
    const onSuccess = vi.fn();
    const { container } = renderWithAuth(<AuthForms onSuccess={onSuccess} />);

    // Component should render without errors
    expect(container).toBeTruthy();
  });
});
