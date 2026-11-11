import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VersionCard from '../VersionCard';

vi.mock('../../../store/dataStore', () => ({
  useDataStore: () => ({ setVersionEnProduccion: vi.fn() }),
}));

vi.mock('../../modals/DeploymentReportModal', () => ({ default: () => null }));

const version = {
  id: 'v2',
  numero: '2',
  fechaCreacion: '2026-03-04',
  horaCreacion: '09:00',
  fechaDespliegue: '2026-03-05',
  horaDespliegue: '12:00',
  fuente: 'Manual',
  cdus: [{ estado: 'Certificado OK' }],
};

describe('VersionCard — T-08 (R-A11Y-02)', () => {
  it('abre el detalle con Enter desde el control del número de versión', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <VersionCard version={version} isProduccion={false} onClick={onClick} />,
    );

    const open = screen.getByRole('button', { name: 'Abrir detalle de la versión 2' });
    expect(open.tagName).toBe('BUTTON');
    expect(open).toHaveAttribute('type', 'button');

    open.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledWith('v2');

    // El contenedor mantiene el click de ratón, sin rol ni tab stop extra.
    const card = container.querySelector('.version-card');
    expect(card).not.toHaveAttribute('tabindex');
    expect(card).not.toHaveAttribute('role');

    await user.click(container.querySelector('.version-card-body'));
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('no anida botones y da nombre a las acciones de solo icono', () => {
    const { container } = render(
      <VersionCard version={version} isProduccion={false} onClick={vi.fn()} />,
    );

    expect(container.querySelectorAll('button button')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Ver reporte de la versión 2' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Marcar la versión 2 como en producción' }),
    ).toBeInTheDocument();
  });
});
