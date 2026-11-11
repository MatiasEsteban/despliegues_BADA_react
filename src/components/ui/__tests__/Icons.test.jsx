import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icons } from '../Icons';
import { Toast } from '../Toast';

describe('Icons — T-10 (R-A11Y-03)', () => {
  it('marca los iconos como decorativos por defecto', () => {
    const { container } = render(<Icons.Check />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
  });

  it('aplica los valores por defecto a todos los iconos del catálogo', () => {
    for (const [name, Icon] of Object.entries(Icons)) {
      const { container, unmount } = render(<Icon />);
      const svg = container.querySelector('svg');

      expect(svg, `icono ${name}`).toHaveAttribute('aria-hidden', 'true');
      expect(svg, `icono ${name}`).toHaveAttribute('focusable', 'false');
      unmount();
    }
  });

  it('se anuncia cuando el consumidor pide role="img" + aria-label', () => {
    render(<Icons.Check role="img" aria-label="Aprobado" />);

    const svg = screen.getByRole('img', { name: 'Aprobado' });
    expect(svg).not.toHaveAttribute('aria-hidden');
  });

  it('conserva el fill de Icons.Info (deuda P5-01.1)', () => {
    const { container } = render(<Icons.Info />);

    expect(container.querySelector('path')).toHaveAttribute('fill', 'white');
  });

  it('el botón de cierre de Toast sin texto visible tiene nombre accesible', () => {
    render(<Toast message="Guardado" type="success" onClose={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Cerrar notificación' })).toBeInTheDocument();
  });
});
