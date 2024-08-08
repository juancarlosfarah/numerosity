// Number of blocks in the experiment
const nb_blocks: number = 5;

// Handle uncaught exceptions in Cypress
Cypress.on('uncaught:exception', (err) => {
  // Prevent Cypress from failing the test on specific exceptions
  if (err.message.includes('Permissions check failed')) {
    cy.get('iframe')
      .its('0.contentDocument')
      .should('exist')
      .then((doc) => {
        // Access elements inside the iframe and click the dismiss button
        cy.wrap(doc).find('button[aria-label="Dismiss"]').click();
      });
    return false;
  }
  return true;
});

/**
 * @function testInstructions
 * @description Tests the instruction screens by navigating through them.
 */
function testInstructions() {
  const next_inst_btn: string = 'Next';
  for (let page: number = 0; page < 5; page++) {
    // Verify instruction content and navigate to the next page
    cy.contains('Instructions');
    cy.get('.inst-monitor').should('be.visible');
    cy.contains(next_inst_btn).click();
  }

  // Verify video visibility and continue
  cy.get('video').should('be.visible');
  cy.contains(next_inst_btn).click();

  // Click through specific instruction steps
  cy.contains('inside the virtual ').click();
  cy.contains('Continue').click();

  // Verify image visibility and continue
  cy.get('img').should('be.visible');
  cy.contains('ready ').click();
}

/**
 * @function testPartOfExp
 * @description Simulates performing part of the experiment by entering input and navigating through tasks.
 */
function testPartOfExp() {
  for (let task = 0; task < nb_blocks * 4; task++) {
    // Wait for task to be ready and perform the task
    cy.wait(500 + 250 + 1);
    cy.contains('in the virtual ');
    cy.get('#task-input').type(task.toString());
    cy.contains('Continue').click();
  }
}

// Main test suite
describe('Ordinary run', () => {
  it('does task as expected', () => {
    // Visit the application
    cy.visit(`http://localhost:3000`);
    cy.get('#jspsych-progressbar-outer').should('be.visible');

    // Enter fullscreen mode
    cy.contains('Fullscreen').click();

    // Navigate through initial instructions
    cy.contains('Quit');
    cy.contains('Continue').click();

    // Test the instruction screens
    testInstructions();

    // Verify progress bar is empty
    cy.get('#jspsych-progressbar-inner').should('not.be.visible');

    // Perform a part of the experiment
    testPartOfExp();
    testInstructions();

    // Verify progress bar is not empty
    cy.get('#jspsych-progressbar-inner').should('be.visible');
    testPartOfExp();

    // Verify end message
    cy.contains('Thank you');
  });
});
