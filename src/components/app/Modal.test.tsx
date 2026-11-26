import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

/**
 * Foco do modal. O botão X é o primeiro focável em ordem de DOM; o foco
 * inicial precisa ignorá-lo, e um `onClose` recriado a cada render da tela de
 * origem não pode remontar a armadilha de foco — era o que fazia cada letra
 * digitada num campo levar o foco para o X.
 */
describe("Modal", () => {
  function Campo({ onClose }: { onClose: () => void }) {
    return (
      <Modal eyebrow="Cadastro" title="Novo projeto." onClose={onClose}>
        <input aria-label="Título" />
      </Modal>
    );
  }

  it("põe o foco no conteúdo, não no botão de fechar", () => {
    render(<Campo onClose={() => {}} />);
    expect(screen.getByLabelText("Título")).toHaveFocus();
  });

  it("mantém o foco no campo quando a tela de origem recria o onClose", async () => {
    const { rerender } = render(<Campo onClose={() => {}} />);
    const campo = screen.getByLabelText("Título");

    await userEvent.type(campo, "V");
    rerender(<Campo onClose={() => {}} />);

    expect(campo).toHaveFocus();
  });

  it("fecha pelo Esc com o onClose mais recente", async () => {
    const antigo = vi.fn();
    const novo = vi.fn();
    const { rerender } = render(<Campo onClose={antigo} />);
    rerender(<Campo onClose={novo} />);

    await userEvent.keyboard("{Escape}");

    expect(novo).toHaveBeenCalledTimes(1);
    expect(antigo).not.toHaveBeenCalled();
  });
});
