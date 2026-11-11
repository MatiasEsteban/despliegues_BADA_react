import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChangelogCard from '../ChangelogCard';

// `vi.mock` se eleva al inicio del módulo: cada consumidor recibe dobles
// estables de los stores/contextos sin tocar Zustand, Firebase ni los modales
// de negocio reales.
vi.mock('../../../store/dataStore', () => {
  const normalizeComments = (comentarios) => ({
    mejoras: comentarios?.mejoras ?? [],
    salidas: comentarios?.salidas ?? [],
    cambiosCaliente: comentarios?.cambiosCaliente ?? [],
    observaciones: comentarios?.observaciones ?? [],
    cambiosCDU: comentarios?.cambiosCDU ?? [],
  });

  return {
    normalizeComments,
    useDataStore: () => ({
      setVersionEnProduccion: vi.fn(),
      selectVersion: vi.fn(),
      duplicateVersion: vi.fn(),
      deleteVersion: vi.fn(),
      updateCurrentVersion: vi.fn(),
    }),
  };
});

vi.mock('../../../store/workspaceStore', () => ({
  useWorkspaceStore: () => ({ getActiveWorkspace: () => ({ type: 'full' }) }),
}));

vi.mock('../../../context/ModalContext', () => ({
  useModal: () => ({ confirm: vi.fn().mockResolvedValue(false) }),
}));

vi.mock('../../modals/DeploymentInfoModal', () => ({ default: () => null }));
vi.mock('../../modals/ChangelogEntriesModal', () => ({ default: () => null }));

const version = {
  id: 'v1',
  numero: '1',
  titulo: 'Primera versión',
  fechaCreacion: '2026-01-02',
  horaCreacion: '10:30',
  fechaDespliegue: '2026-02-03',
  horaDespliegue: '18:00',
  fuente: 'Excel',
  comentarios: { mejoras: [{ id: 'c1', texto: 'Corrección' }] },
  cdus: [{ estado: 'En Desarrollo' }],
};

describe('ChangelogCard — T-07 (R-A11Y-02)', () => {
  it('expande y colapsa con Enter y Espacio mediante el control de cabecera', async () => {
    const user = userEvent.setup();
    const { container } = render(<ChangelogCard version={version} isProduccion={false} />);

    const toggle = container.querySelector('.changelog-card-toggle');
    const body = container.querySelector('.changelog-card-body');

    expect(toggle).toBeTruthy();
    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle).toHaveAttribute('type', 'button');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(body.id).not.toBe('');
    expect(toggle).toHaveAttribute('aria-controls', body.id);

    // El div exterior conserva el click de ratón sin convertirse en un segundo
    // tab stop (el teclado va por el botón).
    const header = container.querySelector('.changelog-card-header');
    expect(header).not.toHaveAttribute('tabindex');
    expect(header).not.toHaveAttribute('role');

    toggle.focus();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('mantiene el click de ratón en el header sin doble toggle', async () => {
    const user = userEvent.setup();
    const { container } = render(<ChangelogCard version={version} isProduccion={false} />);

    const toggle = container.querySelector('.changelog-card-toggle');
    const chevron = container.querySelector('.changelog-chevron');

    await user.click(chevron);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(chevron);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('deja las acciones como hermanas del botón, sin controles anidados', async () => {
    const user = userEvent.setup();
    const { container } = render(<ChangelogCard version={version} isProduccion={false} />);

    const toggle = container.querySelector('.changelog-card-toggle');
    const edit = screen.getByRole('button', { name: 'Editar changelog de la versión 1' });

    expect(edit).toBeInTheDocument();
    expect(toggle.contains(edit)).toBe(false);
    expect(container.querySelectorAll('button button')).toHaveLength(0);

    // Las acciones no disparan el toggle al pulsarlas.
    const expandedBefore = toggle.getAttribute('aria-expanded');
    await user.click(edit);
    expect(toggle).toHaveAttribute('aria-expanded', expandedBefore);
  });
});
