import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportModal from '../ExportModal';

vi.mock('../../../services/excelExporter', () => ({
  ExcelExporter: { exportar: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('../../../services/textExporter', () => ({
  TextExporter: { exportar: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const versions = [{ id: 'v1', numero: '1' }];

describe('ExportModal — T-09 (R-A11Y-02)', () => {
  it('expone un radiogroup con roving tabindex y nombres accesibles', () => {
    render(
      <ExportModal isOpen onClose={vi.fn()} versions={versions} versionEnProduccionId={null} />,
    );

    expect(screen.getByRole('radiogroup', { name: 'Formato de exportación' })).toBeInTheDocument();

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);

    const excel = screen.getByRole('radio', { name: /Planilla Excel/ });
    const text = screen.getByRole('radio', { name: /Archivo de Texto/ });

    expect(excel).toHaveAttribute('aria-checked', 'true');
    expect(excel).toHaveAttribute('tabindex', '0');
    expect(text).toHaveAttribute('aria-checked', 'false');
    expect(text).toHaveAttribute('tabindex', '-1');
    expect(radios.filter((radio) => radio.getAttribute('tabindex') === '0')).toHaveLength(1);
  });

  it('mueve la selección con flechas, Home y End, y confirma con Enter/Espacio', async () => {
    const user = userEvent.setup();
    render(
      <ExportModal isOpen onClose={vi.fn()} versions={versions} versionEnProduccionId={null} />,
    );

    const excel = screen.getByRole('radio', { name: /Planilla Excel/ });
    const text = screen.getByRole('radio', { name: /Archivo de Texto/ });

    excel.focus();
    await user.keyboard('{ArrowDown}');
    expect(text).toHaveAttribute('aria-checked', 'true');
    expect(text).toHaveAttribute('tabindex', '0');
    expect(text).toHaveFocus();
    expect(excel).toHaveAttribute('tabindex', '-1');
    expect(
      screen.getByRole('button', { name: 'Descargar Texto (.txt)' }),
    ).toBeInTheDocument();

    await user.keyboard('{Home}');
    expect(excel).toHaveAttribute('aria-checked', 'true');
    expect(excel).toHaveFocus();

    await user.keyboard('{End}');
    expect(text).toHaveAttribute('aria-checked', 'true');
    expect(text).toHaveFocus();

    // Las flechas hacen wrap en los extremos.
    await user.keyboard('{ArrowDown}');
    expect(excel).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{ArrowUp}');
    expect(text).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{ArrowRight}');
    expect(excel).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{ArrowLeft}');
    expect(text).toHaveAttribute('aria-checked', 'true');

    await user.keyboard('{Enter}');
    expect(text).toHaveAttribute('aria-checked', 'true');
    await user.keyboard(' ');
    expect(text).toHaveAttribute('aria-checked', 'true');

    expect(
      screen.getAllByRole('radio').filter((radio) => radio.getAttribute('tabindex') === '0'),
    ).toHaveLength(1);
  });

  it('selecciona con click sin anidar controles interactivos', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ExportModal isOpen onClose={vi.fn()} versions={versions} versionEnProduccionId={null} />,
    );

    const text = screen.getByRole('radio', { name: /Archivo de Texto/ });
    await user.click(text);
    expect(text).toHaveAttribute('aria-checked', 'true');
    expect(container.querySelectorAll('button button')).toHaveLength(0);
  });
});
