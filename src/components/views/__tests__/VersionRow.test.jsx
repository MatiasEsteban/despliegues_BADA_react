import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VersionRow from '../VersionRow';

vi.mock('../../../store/dataStore', () => ({
  useDataStore: () => ({
    setVersionEnProduccion: vi.fn(),
    duplicateVersion: vi.fn(),
    deleteVersion: vi.fn(),
  }),
}));

vi.mock('../../../context/ModalContext', () => ({
  useModal: () => ({ confirm: vi.fn().mockResolvedValue(false) }),
}));

vi.mock('../../modals/DeploymentReportModal', () => ({ default: () => null }));

const version = {
  id: 'v3',
  numero: '3',
  fechaCreacion: '2026-04-01',
  horaCreacion: '08:00',
  fechaDespliegue: '2026-04-02',
  horaDespliegue: '16:00',
  fuente: 'Excel',
  cdus: [{ estado: 'En Produccion' }],
};

function renderRow(onClick) {
  return render(
    <table>
      <tbody>
        <VersionRow version={version} isProduccion={false} onClick={onClick} />
      </tbody>
    </table>,
  );
}

describe('VersionRow — T-08 (R-A11Y-02)', () => {
  it('abre el detalle con Enter desde el botón de la primera celda', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = renderRow(onClick);

    const open = screen.getByRole('button', { name: 'Abrir detalle de la versión 3' });
    open.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledWith('v3');

    // La fila conserva el click de ratón pero no roles/tab stops inventados.
    const row = container.querySelector('tr');
    expect(row).not.toHaveAttribute('role');
    expect(row).not.toHaveAttribute('tabindex');

    await user.click(container.querySelector('.version-list-cell-fuente'));
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('no anida botones y da nombre a las cuatro acciones', () => {
    const { container } = renderRow(vi.fn());

    expect(container.querySelectorAll('button button')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Ver reporte de la versión 3' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Marcar la versión 3 como en producción' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Duplicar la versión 3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Eliminar la versión 3' })).toBeInTheDocument();
  });
});
