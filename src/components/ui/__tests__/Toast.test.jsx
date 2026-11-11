import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Toast } from '../Toast';
import { ToastProvider, useToast } from '../../../context/ToastContext';

function ToastTrigger({ type = 'success' }) {
  const { showToast } = useToast();
  return (
    <button type="button" onClick={() => showToast('Guardado correctamente', type)}>
      Mostrar toast
    </button>
  );
}

describe('Toast — T-04 (R-A11Y-07)', () => {
  it('anuncia los toasts nuevos en una región viva polite', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );

    const region = document.querySelector('.toast-container');
    expect(region).toHaveAttribute('role', 'status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'false');

    await user.click(screen.getByRole('button', { name: 'Mostrar toast' }));

    expect(await screen.findByText('Guardado correctamente')).toBeInTheDocument();
    expect(region).toHaveTextContent('Guardado correctamente');
  });

  it('los toasts informativos usan role="status"', () => {
    render(<Toast message="Datos sincronizados" type="success" onClose={vi.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent('Datos sincronizados');
  });

  it('los toasts de error usan role="alert" para anunciarse de inmediato', () => {
    render(<Toast message="No se pudo guardar" type="error" onClose={vi.fn()} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('No se pudo guardar');
    expect(alert).toHaveClass('toast-error');
  });

  it('el botón «Cerrar notificación» invoca onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Toast message="Guardado" type="success" onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Cerrar notificación' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('no tiene violaciones de accesibilidad con jest-axe', async () => {
    const { container } = render(
      <div className="toast-container" role="status" aria-live="polite" aria-atomic="false">
        <Toast message="Guardado correctamente" type="success" onClose={vi.fn()} />
      </div>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
