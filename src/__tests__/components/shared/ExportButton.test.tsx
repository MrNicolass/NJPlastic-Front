import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EXPORT } from '@/constants/ConstantsAndParams';
import { ExportButton } from '@/components/shared/ExportButton';

// jsdom does not implement these APIs, which antd's Dropdown/Trigger observes.
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('ExportButton', () => {
  it('renders the default export label', () => {
    render(<ExportButton onExport={jest.fn()} />);

    expect(screen.getByText(EXPORT.BUTTON_LABEL)).toBeInTheDocument();
  });

  it('fires onExport with csv when the primary button is clicked', async () => {
    const user = userEvent.setup();
    const onExport = jest.fn();

    render(<ExportButton onExport={onExport} />);
    // The Dropdown.Button renders the trigger button with the label
    const primary = screen.getByText(EXPORT.BUTTON_LABEL).closest('button')!;
    await user.click(primary);

    expect(onExport).toHaveBeenCalledWith('csv');
  });

  it('disables the dropdown button when disabled is true', () => {
    render(<ExportButton onExport={jest.fn()} disabled />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.every((button) => button.hasAttribute('disabled'))).toBe(true);
  });

  it('exposes both CSV and PDF menu items when csvOnly is false', async () => {
    const user = userEvent.setup();
    const onExport = jest.fn();

    render(<ExportButton onExport={onExport} />);
    // The arrow button opens the dropdown menu - click it to open
    const buttons = screen.getAllByRole('button');
    const arrow = buttons[buttons.length - 1];
    await user.click(arrow);

    expect(await screen.findByText(EXPORT.FORMAT_CSV)).toBeInTheDocument();
    expect(await screen.findByText(EXPORT.FORMAT_PDF)).toBeInTheDocument();
  });

  it('hides the PDF menu item when csvOnly is true', async () => {
    const user = userEvent.setup();

    render(<ExportButton onExport={jest.fn()} csvOnly />);
    const buttons = screen.getAllByRole('button');
    const arrow = buttons[buttons.length - 1];
    await user.click(arrow);

    expect(await screen.findByText(EXPORT.FORMAT_CSV)).toBeInTheDocument();
    expect(screen.queryByText(EXPORT.FORMAT_PDF)).not.toBeInTheDocument();
  });

  it('invokes onExport with pdf when the PDF menu item is clicked', async () => {
    const user = userEvent.setup();
    const onExport = jest.fn();

    render(<ExportButton onExport={onExport} />);
    const buttons = screen.getAllByRole('button');
    const arrow = buttons[buttons.length - 1];
    await user.click(arrow);
    const pdfOption = await screen.findByText(EXPORT.FORMAT_PDF);
    await user.click(pdfOption);

    expect(onExport).toHaveBeenCalledWith('pdf');
  });
});
