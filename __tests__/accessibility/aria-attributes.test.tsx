/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock components for testing
const MockButton = ({ children, ...props }) => (
  <button {...props}>{children}</button>
);

const MockInput = ({ label, error, ...props }) => (
  <div>
    {label && <label htmlFor={props.id}>{label}</label>}
    <input {...props} />
    {error && (
      <div id={`${props.id}-error`} role="alert" aria-live="polite">
        {error}
      </div>
    )}
  </div>
);

const MockSelect = ({ label, options, ...props }) => (
  <div>
    {label && <label htmlFor={props.id}>{label}</label>}
    <select {...props}>
      {options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const MockModal = ({ isOpen, title, children, ...props }) =>
  isOpen ? (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" {...props}>
      <h2 id="modal-title">{title}</h2>
      {children}
    </div>
  ) : null;

const MockTable = ({ data, columns, ...props }) => (
  <table role="table" {...props}>
    <thead>
      <tr role="row">
        {columns?.map((col) => (
          <th key={col.key} role="columnheader">
            {col.header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data?.map((row, index) => (
        <tr key={index} role="row">
          {columns?.map((col) => (
            <td key={col.key} role="cell">
              {row[col.accessor]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const MockAlert = ({ variant, title, description, ...props }) => (
  <div
    role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
    aria-live="polite"
    {...props}
  >
    {title && <h3>{title}</h3>}
    {description && <p>{description}</p>}
  </div>
);

describe('ARIA Attributes Implementation', () => {
  describe('Button Component', () => {
    it('should have proper ARIA attributes', async () => {
      const { container } = render(
        <MockButton
          aria-busy={true}
          aria-describedby="button-description"
          aria-expanded={false}
          aria-pressed={false}
        >
          Test Button
        </MockButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-describedby', 'button-description');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-pressed', 'false');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be accessible when loading', async () => {
      const { container } = render(
        <MockButton aria-busy={true} disabled>
          Loading...
        </MockButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toBeDisabled();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Input Component', () => {
    it('should have proper ARIA attributes for form inputs', async () => {
      const { container } = render(
        <MockInput
          id="test-input"
          label="Test Input"
          aria-required={true}
          aria-invalid={false}
          aria-describedby="input-helper"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-invalid', 'false');
      expect(input).toHaveAttribute('aria-describedby', 'input-helper');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should show error state with proper ARIA attributes', async () => {
      const { container } = render(
        <MockInput
          id="test-input"
          label="Test Input"
          error="This field is required"
          aria-invalid={true}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('This field is required');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Select Component', () => {
    it('should have proper ARIA attributes for select elements', async () => {
      const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ];

      const { container } = render(
        <MockSelect
          id="test-select"
          label="Test Select"
          options={options}
          aria-required={true}
          aria-describedby="select-helper"
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-required', 'true');
      expect(select).toHaveAttribute('aria-describedby', 'select-helper');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Modal Component', () => {
    it('should have proper ARIA attributes for modals', async () => {
      const { container } = render(
        <MockModal
          isOpen={true}
          title="Test Modal"
          aria-describedby="modal-description"
        >
          <p id="modal-description">Modal content</p>
        </MockModal>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(modal).toHaveAttribute('aria-describedby', 'modal-description');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Table Component', () => {
    it('should have proper ARIA attributes for tables', async () => {
      const data = [
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Jane', age: 25 },
      ];

      const columns = [
        { key: 'id', header: 'ID', accessor: 'id' },
        { key: 'name', header: 'Name', accessor: 'name' },
        { key: 'age', header: 'Age', accessor: 'age' },
      ];

      const { container } = render(
        <MockTable
          data={data}
          columns={columns}
          aria-label="Test Table"
          aria-describedby="table-description"
        />
      );

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Test Table');
      expect(table).toHaveAttribute('aria-describedby', 'table-description');

      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders).toHaveLength(3);

      const cells = screen.getAllByRole('cell');
      expect(cells).toHaveLength(6); // 2 rows × 3 columns

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Alert Component', () => {
    it('should have proper ARIA attributes for alerts', async () => {
      const { container } = render(
        <MockAlert
          variant="error"
          title="Error Alert"
          description="Something went wrong"
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes for info alerts', async () => {
      const { container } = render(
        <MockAlert
          variant="info"
          title="Info Alert"
          description="Here is some information"
        />
      );

      const alert = screen.getByRole('status');
      expect(alert).toHaveAttribute('aria-live', 'polite');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper form structure with ARIA attributes', async () => {
      const { container } = render(
        <form role="form" aria-label="Test Form">
          <fieldset>
            <legend>Personal Information</legend>
            <MockInput
              id="name"
              label="Name"
              aria-required={true}
              aria-describedby="name-helper"
            />
            <MockSelect
              id="country"
              label="Country"
              options={[
                { value: 'br', label: 'Brazil' },
                { value: 'us', label: 'United States' },
              ]}
              aria-required={true}
            />
          </fieldset>
          <div role="group" aria-label="Form actions">
            <MockButton type="submit">Submit</MockButton>
            <MockButton type="button">Cancel</MockButton>
          </div>
        </form>
      );

      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label', 'Test Form');

      const fieldset = screen.getByRole('group');
      expect(fieldset).toBeInTheDocument();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Navigation Accessibility', () => {
    it('should have proper navigation structure with ARIA attributes', async () => {
      const { container } = render(
        <nav role="navigation" aria-label="Main navigation">
          <ul>
            <li>
              <a href="/home" aria-current="page">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </nav>
      );

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation');

      const currentPageLink = screen.getByRole('link', { name: 'Home' });
      expect(currentPageLink).toHaveAttribute('aria-current', 'page');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Loading States', () => {
    it('should have proper ARIA attributes for loading states', async () => {
      const { container } = render(
        <div>
          <MockButton aria-busy={true} disabled>
            <span aria-hidden="true">⟳</span>
            <span className="sr-only">Loading...</span>
          </MockButton>
          <div role="status" aria-label="Loading content">
            <span aria-hidden="true">⟳</span>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      );

      const loadingButton = screen.getByRole('button');
      expect(loadingButton).toHaveAttribute('aria-busy', 'true');
      expect(loadingButton).toBeDisabled();

      const loadingStatus = screen.getByRole('status');
      expect(loadingStatus).toHaveAttribute('aria-label', 'Loading content');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
