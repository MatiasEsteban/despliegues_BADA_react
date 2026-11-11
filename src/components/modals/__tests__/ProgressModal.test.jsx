import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgressModal from '../ProgressModal';

const version = {
  numero: '5',
  cdus: [
    {
      nombreCDU: 'CDU de prueba',
      estado: 'En Desarrollo',
      pasos: [{ completado: true, dificultad: 'Baja', version: 'V1' }],
    },
  ],
};

describe('ProgressModal — P4-04.5 (R-A11Y-02)', () => {
  it('expone los toggles de gráficos como botones con aria-expanded/aria-controls', async () => {
    const user = userEvent.setup();
    const { container } = render(<ProgressModal isOpen onClose={vi.fn()} version={version} />);

    const statusToggle = screen.getByRole('button', { name: /^Estados CDUs/ });
    const badaToggle = screen.getByRole('button', { name: /^Versión Bada/ });

    expect(statusToggle).toHaveAttribute('aria-expanded', 'false');
    expect(badaToggle).toHaveAttribute('aria-expanded', 'false');

    const statusRegion = document.getElementById(statusToggle.getAttribute('aria-controls'));
    const badaRegion = document.getElementById(badaToggle.getAttribute('aria-controls'));
    expect(statusRegion).toHaveClass('chart-content-wrapper');
    expect(badaRegion).toHaveClass('chart-content-wrapper');

    statusToggle.focus();
    await user.keyboard('{Enter}');
    expect(statusToggle).toHaveAttribute('aria-expanded', 'true');
    expect(statusRegion).toHaveClass('expanded');

    await user.keyboard(' ');
    expect(statusToggle).toHaveAttribute('aria-expanded', 'false');

    badaToggle.focus();
    await user.keyboard('{Enter}');
    expect(badaToggle).toHaveAttribute('aria-expanded', 'true');
    expect(badaRegion).toHaveClass('expanded');

    expect(container.querySelectorAll('button button')).toHaveLength(0);
  });
});
