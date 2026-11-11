import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Input } from '../Input';

describe('Input — T-06 (R-A11Y-04)', () => {
  it('asocia el label con el input mediante htmlFor/id', () => {
    render(<Input label="Correo Electrónico" id="correo" />);

    const input = screen.getByLabelText('Correo Electrónico');
    expect(input).toHaveAttribute('id', 'correo');
    expect(input.tagName).toBe('INPUT');
  });

  it('genera un id único cuando el consumidor no lo pasa', () => {
    render(<Input label="Nombre" />);

    const input = screen.getByLabelText('Nombre');
    expect(input.id).toBeTruthy();
  });

  it('respeta el id explícito del consumidor', () => {
    render(<Input label="Versión" id="version-miro" />);

    expect(screen.getByLabelText('Versión')).toHaveAttribute('id', 'version-miro');
  });

  it('propaga required al DOM y lo expone como campo obligatorio', () => {
    render(<Input label="Contraseña" id="clave" type="password" required />);

    const input = screen.getByLabelText('Contraseña');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('required');
    expect(input.required).toBe(true);
  });

  it('asocia el error con aria-invalid y aria-describedby', () => {
    render(<Input label="Contraseña" id="clave" error="La contraseña es obligatoria" />);

    const input = screen.getByLabelText('Contraseña');
    const error = screen.getByText('La contraseña es obligatoria');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
    expect(input).toHaveAccessibleDescription('La contraseña es obligatoria');
  });

  it('sin error no marca aria-invalid ni añade descripción', () => {
    render(<Input label="Correo" id="correo" />);

    const input = screen.getByLabelText('Correo');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('no tiene violaciones de accesibilidad con jest-axe', async () => {
    const { container } = render(
      <form>
        <Input label="Correo" id="correo" type="email" required />
        <Input label="Contraseña" id="clave" type="password" error="Credenciales inválidas" required />
      </form>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
