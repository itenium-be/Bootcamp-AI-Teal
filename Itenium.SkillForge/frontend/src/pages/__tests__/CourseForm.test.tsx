import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@itenium-forge/ui', () => {
  const S = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return {
    Sheet: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
      open ? <div data-testid="sheet">{children}</div> : null,
    SheetContent: S,
    SheetHeader: S,
    SheetTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    SheetDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
    SheetFooter: S,
    Button: ({
      children,
      type,
      onClick,
      disabled,
    }: {
      children: React.ReactNode;
      type?: 'button' | 'submit' | 'reset';
      onClick?: () => void;
      disabled?: boolean;
    }) => (
      <button type={type} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    ),
  };
});

import { CourseForm } from '../CourseForm';

const mockOnOpenChange = vi.fn();
const mockOnSave = vi.fn();

interface Course {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  level: string | null;
}

function renderForm(props?: { course?: Course }) {
  return render(<CourseForm open={true} onOpenChange={mockOnOpenChange} onSave={mockOnSave} {...props} />);
}

beforeEach(() => {
  mockOnOpenChange.mockReset();
  mockOnSave.mockReset();
});

describe('CourseForm', () => {
  it('shows "Add Course" title for new course', () => {
    renderForm();
    expect(screen.getByText('courses.addCourse')).toBeInTheDocument();
  });

  it('shows "Edit Course" title when editing', () => {
    renderForm({ course: { id: 1, name: 'React Basics', description: null, category: null, level: null } });
    expect(screen.getByText('courses.editCourse')).toBeInTheDocument();
  });

  it('pre-fills name field when editing', () => {
    renderForm({
      course: { id: 1, name: 'React Basics', description: 'Intro', category: 'Dev', level: 'Beginner' },
    });
    expect(screen.getByLabelText('courses.name')).toHaveValue('React Basics');
  });

  it('shows validation error when submitting with empty name', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'common.save' }));
    await waitFor(() => {
      expect(screen.getByText('courses.nameRequired')).toBeInTheDocument();
    });
  });

  it('calls onSave with form data when valid', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('courses.name'), { target: { value: 'New Course' } });
    fireEvent.click(screen.getByRole('button', { name: 'common.save' }));
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Course' }), expect.anything());
    });
  });

  it('closes when Cancel is clicked', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
