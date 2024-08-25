// Number of blocks in the experiment
const nbBlocks: number = 5;

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
  const nextInstButton: string = 'Next';
  for (let page: number = 0; page < 5; page++) {
    // Verify instruction content and navigate to the next page
    cy.contains('Tutorial');
    cy.get('.inst-monitor').should('be.visible');
    cy.contains(nextInstButton).click();
  }

  // Verify video visibility and continue
  cy.get('video').should('be.visible');
  cy.contains(nextInstButton).click();

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
  for (let task = 0; task < nbBlocks * 4; task++) {
    // Wait for task to be ready and perform the task
    cy.wait(1651 + 500 + 250 + 1000);
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

    cy.contains('Skip connection').click();

    // Enter fullscreen mode
    cy.contains('Fullscreen').click();

    // Navigate through initial instructions
    cy.contains('Quit');

    cy.contains('Use card').click();
    cy.contains('Skip calibration').click();

    // Test the instruction screens
    testInstructions();

    cy.contains('Begin').click();

    // Verify progress bar is empty
    cy.get('#jspsych-progressbar-inner').should('not.be.visible');

    // Perform a part of the experiment
    testPartOfExp();

    cy.contains('Continue').click();

    testInstructions();

    cy.contains('Begin').click();

    // Verify progress bar is not empty
    cy.get('#jspsych-progressbar-inner').should('be.visible');
    testPartOfExp();

    // Verify end message
    cy.contains('Thank you');

    cy.readFile(
      require('path').join('cypress/downloads', 'experiment-data.csv'),
    ).should('exist');

    cy.readFile(
      require('path').join('cypress/downloads', 'experiment-data.csv'),
    ).should('exist');
  });
});

// Second test suite
describe('Quit screen test', () => {
  it('opens quit window and aborts experiment', () => {
    // Visit the application
    cy.visit(`http://localhost:3000`);
    cy.get('#jspsych-progressbar-outer').should('be.visible');

    cy.contains('Skip connection').click();

    // Navigate through initial instructions
    cy.contains('Quit').click();
    !cy.contains('Completion progress');
    cy.contains('Close').click();

    cy.contains('Fullscreen');
    cy.get('#jspsych-progressbar-outer').should('be.visible');
    cy.contains('Quit').click();

    !cy.contains('Completion progress');
    cy.contains('Other').click();
    cy.contains('Abort the experiment').click();

    cy.contains('aborted!');

    cy.readFile(
      require('path').join('cypress/downloads', 'experiment-data.csv'),
    ).should('exist');
  });
});

// Third test suite
describe('Edge cases test', () => {
  it('visits all input elements and tests edge case entries', () => {
    // Visit the application
    cy.visit(`http://localhost:3000`);
    cy.get('#jspsych-progressbar-outer').should('be.visible');

    cy.contains('Skip connection').click();

    // Enter fullscreen mode
    cy.contains('Fullscreen').click();

    // Navigate through initial instructions
    cy.contains('Quit');

    cy.contains('Use card').click();
    cy.contains('Skip calibration').click();

    // Test the instruction screens
    testInstructions();

    cy.contains('Begin').click();

    cy.wait(1651 + 500 + 250 + 1000);
    cy.get('#task-input').type('-1');
    cy.contains('Continue').click();
    cy.get('#task-input').should('have.value', '-1');
    cy.get('#task-input').clear();

    cy.get('#task-input').type('1.5');
    cy.contains('Continue').click();
    cy.get('#task-input').should('have.value', '1.5');
    cy.get('#task-input').clear();

    cy.get('#task-input').type('+00');
    cy.contains('Continue').click();
    cy.wait(1651 + 500 + 250 + 1000);
    cy.get('#task-input').should('not.contain.value');

    cy.contains('Quit').click();
    cy.contains('Abort the experiment').click();

    cy.contains('Other').click();
    cy.contains('Abort the experiment').click();

    cy.contains('aborted!');
  });
});
