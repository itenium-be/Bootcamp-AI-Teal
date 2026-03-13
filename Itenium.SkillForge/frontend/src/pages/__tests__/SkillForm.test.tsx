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

import { SkillForm } from '../SkillForm';
import type { SkillProfile, Skill } from '@/api/client';

const mockOnOpenChange = vi.fn();
const mockOnSave = vi.fn();

const profiles: SkillProfile[] = [
  { id: 1, name: '.NET Developer' },
  { id: 2, name: 'Java Developer' },
];

const skills: Skill[] = [
  { id: 1, name: 'C#', category: 'Backend', description: null, levelCount: 3, isUniversal: false, profileId: 1 },
  {
    id: 2,
    name: 'JavaScript',
    category: 'Frontend',
    description: null,
    levelCount: 3,
    isUniversal: false,
    profileId: null,
  },
];

function renderForm(props?: { skill?: Skill }) {
  return render(
    <SkillForm
      open={true}
      onOpenChange={mockOnOpenChange}
      onSave={mockOnSave}
      profiles={profiles}
      skills={skills}
      {...props}
    />,
  );
}

beforeEach(() => {
  mockOnOpenChange.mockReset();
  mockOnSave.mockReset();
});

describe('SkillForm', () => {
  it('shows "Add Skill" title for new skill', () => {
    renderForm();
    expect(screen.getByText('skills.addSkill')).toBeInTheDocument();
  });

  it('shows "Edit Skill" title when editing', () => {
    renderForm({ skill: skills[0] });
    expect(screen.getByText('skills.editSkill')).toBeInTheDocument();
  });

  it('pre-fills name field when editing', () => {
    renderForm({ skill: skills[0] });
    expect(screen.getByLabelText('skills.name')).toHaveValue('C#');
  });

  it('pre-fills levelCount when editing', () => {
    renderForm({ skill: skills[0] });
    expect(screen.getByLabelText('skills.levelCount')).toHaveValue(3);
  });

  it('shows validation error when submitting with empty name', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'common.save' }));
    await waitFor(() => {
      expect(screen.getByText('skills.nameRequired')).toBeInTheDocument();
    });
  });

  it('calls onSave with form data when valid', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('skills.name'), { target: { value: 'TypeScript' } });
    fireEvent.click(screen.getByRole('button', { name: 'common.save' }));
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'TypeScript' }), expect.anything());
    });
  });

  it('closes when Cancel is clicked', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
