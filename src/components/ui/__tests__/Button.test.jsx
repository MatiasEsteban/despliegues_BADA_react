import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('renderiza un <button> y usa type="button" por defecto (R-CODE-02)', () => {
    render(<Button>Texto</Button>);

    const button = screen.getByRole('button', { name: 'Texto' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renderiza los children y aplica las clases de la variante', () => {
    render(<Button variant="danger">Eliminar</Button>);

    const button = screen.getByRole('button', { name: 'Eliminar' });
    expect(button).toHaveTextContent('Eliminar');
    expect(button).toHaveClass('btn', 'btn-danger');
  });

  it('responde a onClick con userEvent', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Pulsar</Button>);

    await user.click(screen.getByRole('button', { name: 'Pulsar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('respeta type="submit" explícito (T-05)', () => {
    render(<Button type="submit">Guardar</Button>);

    expect(screen.getByRole('button', { name: 'Guardar' })).toHaveAttribute(
      'type',
      'submit',
    );
  });
});
