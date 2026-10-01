/// <reference types="cypress" />

describe('Bill composer (smoke)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/admin/bills/create');
  });

  it('renders the preview with the default template', () => {
    cy.contains('Bill composer');
    cy.contains('PHIEU TINH TIEN/RECEIPT');
  });

  it('render API returns a png', () => {
    cy.request({ url: '/api/bills/render?template=winmart&seed=cy', encoding: 'binary' })
      .its('headers')
      .its('content-type')
      .should('include', 'image/png');
  });
});
