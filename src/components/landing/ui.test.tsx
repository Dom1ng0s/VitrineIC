import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputField } from "./ui";

/**
 * Contrato de acessibilidade dos formulários (`src/lib/validate.ts`): rótulo
 * ligado ao campo, `aria-invalid` quando há erro e mensagem alcançável por
 * `aria-describedby`.
 */
describe("InputField", () => {
  it("liga o rótulo ao campo", () => {
    render(<InputField id="email" label="E-mail" value="" onChange={() => {}} />);
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
  });

  it("mostra a dica quando não há erro", () => {
    render(<InputField id="email" label="E-mail" value="" onChange={() => {}} hint="Use o institucional." />);
    expect(screen.getByText("Use o institucional.")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).not.toHaveAttribute("aria-invalid");
  });

  it("marca o campo como inválido e aponta para a mensagem", () => {
    render(<InputField id="email" label="E-mail" value="x" onChange={() => {}} error="E-mail inválido." />);
    const campo = screen.getByLabelText("E-mail");
    expect(campo).toHaveAttribute("aria-invalid", "true");
    expect(campo).toHaveAccessibleDescription("E-mail inválido.");
  });

  it("troca a dica pelo erro, não mostra as duas", () => {
    render(
      <InputField
        id="email"
        label="E-mail"
        value="x"
        onChange={() => {}}
        hint="Use o institucional."
        error="E-mail inválido."
      />,
    );
    expect(screen.getByText("E-mail inválido.")).toBeInTheDocument();
    expect(screen.queryByText("Use o institucional.")).not.toBeInTheDocument();
  });

  it("avisa cada tecla digitada", async () => {
    const onChange = vi.fn();
    render(<InputField id="nome" label="Nome" value="" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Nome"), "ana");
    expect(onChange).toHaveBeenCalledTimes(3);
  });
});
