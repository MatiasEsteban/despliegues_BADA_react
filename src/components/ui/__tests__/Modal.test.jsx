import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Modal } from '../Modal';

function renderModal(props = {}) {
  const onClose = vi.fn();
  const utils = render(
    <Modal onClose={onClose} title="Diálogo de prueba" {...props}>
      <p>Contenido</p>
    </Modal>,
  );
  return { onClose, ...utils };
}

function FocusHarness() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Abrir</button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Foco atrapado">
        <button type="button">Primero</button>
        <button type="button">Segundo</button>
      </Modal>
    </div>
  );
}

describe('Modal', () => {
  it('abre y cierra dos veces sin romper el orden de hooks (T-01 / R-CODE-01)', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onClose = vi.fn();

    const { rerender } = render(
      <Modal isOpen={false} onClose={onClose} title="Regresión">
        <p>Contenido</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    for (let cycle = 0; cycle < 2; cycle += 1) {
      rerender(
        <Modal isOpen onClose={onClose} title="Regresión">
          <p>Contenido</p>
        </Modal>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      rerender(
        <Modal isOpen={false} onClose={onClose} title="Regresión">
          <p>Contenido</p>
        </Modal>,
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }

    const errorMessages = errorSpy.mock.calls.map((args) => args.map(String).join(' '));
    const hookWarnings = errorMessages
      .filter((message) => /change in the order of Hooks|Rendered more hooks|Rendered fewer hooks/i.test(message));

    expect(hookWarnings).toEqual([]);
    // React 18.3 no emite siempre el aviso de hooks con un ciclo 0→1, pero sí
    // registra un error interno cuando cambia el orden. Cualquier console.error
    // en el ciclo indica que los hooks no son estables.
    expect(errorMessages).toEqual([]);
    errorSpy.mockRestore();
  });

  it('expone role="dialog", aria-modal y un título asociado (T-03)', () => {
    renderModal({ isOpen: true, title: 'Título accesible' });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy)).toHaveClass('modal-title');
    expect(document.getElementById(labelledBy)).toHaveTextContent('Título accesible');
    expect(dialog).toHaveAccessibleName('Título accesible');

    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('usa aria-label cuando no hay título', () => {
    renderModal({ isOpen: true, title: undefined });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Diálogo');
    expect(dialog).not.toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAccessibleName('Diálogo');
  });

  it('atrapa el foco, cierra con Escape y lo restaura al disparador (T-02)', async () => {
    const user = userEvent.setup();
    render(<FocusHarness />);

    const trigger = screen.getByRole('button', { name: 'Abrir' });
    await user.click(trigger);

    const close = screen.getByRole('button', { name: 'Cerrar' });
    const first = screen.getByRole('button', { name: 'Primero' });
    const second = screen.getByRole('button', { name: 'Segundo' });

    // Foco inicial en el primer enfocable del diálogo.
    expect(close).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');

    // Tab avanza y, desde el último, vuelve al primero.
    await user.tab();
    expect(first).toHaveFocus();
    await user.tab();
    expect(second).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();

    // Shift+Tab desde el primero salta al último.
    await user.tab({ shift: true });
    expect(second).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('Escape invoca onClose una sola vez', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal({ isOpen: true, title: 'Escape' });

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('bloquea el scroll del body y lo restaura al cerrar', () => {
    document.body.style.overflow = 'auto';
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal isOpen onClose={onClose} title="Scroll">
        <p>Contenido</p>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={onClose} title="Scroll">
        <p>Contenido</p>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('auto');
    document.body.style.overflow = '';
  });

  it('isOpen=false no deja diálogo ni bloqueo de scroll', () => {
    document.body.style.overflow = '';
    renderModal({ isOpen: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });

  it('no tiene violaciones de accesibilidad con jest-axe', async () => {
    const { container } = renderModal({ isOpen: true, title: 'Modal accesible', showIcon: true });

    expect(await axe(container)).toHaveNoViolations();
  });
});
