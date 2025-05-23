/* eslint-disable no-magic-numbers */
import { Chem } from '@constants/monomers/Chem';
import { Peptides } from '@constants/monomers/Peptides';
import { Presets } from '@constants/monomers/Presets';
import { test, expect, Page, Locator } from '@playwright/test';
import {
  takeEditorScreenshot,
  addSingleMonomerToCanvas,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvasMacro,
  pressButton,
  saveToFile,
  receiveFileComparisonData,
  openFileAndAddToCanvasAsNewProject,
  getMolfile,
  getSequence,
  openFile,
  getFasta,
  openFileAndAddToCanvasAsNewProjectMacro,
  delay,
  moveMouseAway,
  selectOptionInTypeDropdown2,
  clickOnCanvas,
  selectMonomer,
  selectSequenceLayoutModeTool,
  selectAllStructuresOnCanvas,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  selectSnakeLayoutModeTool,
  selectFlexLayoutModeTool,
  waitForPageInit,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

import {
  connectMonomersWithBonds,
  getMonomerLocator,
  moveMonomer,
} from '@utils/macromolecules/monomer';
import {
  bondTwoMonomers,
  bondTwoMonomersPointToPoint,
} from '@utils/macromolecules/polymerBond';
import {
  pressRedoButton,
  pressUndoButton,
  selectClearCanvasTool,
  selectOpenFileTool,
  turnOnMacromoleculesEditor,
} from '@tests/pages/common/TopLeftToolbar';
import { goToPeptidesTab } from '@utils/macromolecules/library';
import {
  bondSelectionTool,
  selectEraseTool,
} from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { chooseTab, Tabs } from '@utils/macromolecules';

let page: Page;

async function configureInitialState(page: Page) {
  await chooseTab(page, Tabs.Rna);
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
  await configureInitialState(page);
});

test.afterEach(async () => {
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  // await resetZoomLevelToDefault(page);
  await selectClearCanvasTool(page);
  // await resetZoomLevelToDefault(page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

async function saveAndCompareMolfile(
  page: Page,
  saveFilePath: string,
  expectedFilePath: string,
  metaDataIndexes: number[],
  fileFormat: 'v3000',
) {
  const expectedFile = await getMolfile(page, fileFormat);
  await saveToFile(saveFilePath, expectedFile);

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: expectedFilePath,
      metaDataIndexes,
      fileFormat,
    });

  expect(molFile).toEqual(molFileExpected);

  await openFileAndAddToCanvasAsNewProject(saveFilePath, page);
}
async function getConnectionLine(page: Page, nth = 0) {
  return await page.locator('g[pointer-events="stroke"]').nth(nth);
}
async function openEditConnectionPointsMenu(page: Page, bondLine: Locator) {
  await bondLine.click({ button: 'right' });
  await page.getByText('Edit Connection Points...').click();
}

test('Create bond between two peptides', async () => {
  /* 
    Test case: #2334 - Create peptide chain (HELM style) - Center-to-Center
    Description: Polymer bond tool
    */
  // Choose peptide
  await goToPeptidesTab(page);
  const peptide1 = await addSingleMonomerToCanvas(
    page,
    Peptides.Tza,
    300,
    300,
    0,
  );
  const peptide2 = await addSingleMonomerToCanvas(
    page,
    Peptides.Tza,
    400,
    400,
    1,
  );
  const peptide3 = await addSingleMonomerToCanvas(
    page,
    Peptides.Tza,
    500,
    500,
    2,
  );
  const peptide4 = await addSingleMonomerToCanvas(
    page,
    Peptides.Tza,
    500,
    200,
    3,
  );

  // Select bond tool
  await bondSelectionTool(page, MacroBondType.Single);

  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });

  // Create bonds between peptides, taking screenshots in middle states
  await bondTwoMonomers(page, peptide1, peptide2);

  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });

  await bondTwoMonomers(page, peptide2, peptide3);

  await bondTwoMonomers(page, peptide4, peptide3);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Create bond between two chems', async () => {
  /* 
    Test case: #2497 - Adding chems to canvas - Center-to-Center
    Description: Polymer bond tool
    */
  // Choose chems
  await selectMonomer(page, Chem.hxy);

  // Create 2 chems on canvas
  await clickOnCanvas(page, 300, 300);
  await moveMouseAway(page);
  await clickOnCanvas(page, 400, 400);

  // Get 2 chems locators
  const chem1 = getMonomerLocator(page, Chem.hxy).first();
  const chem2 = getMonomerLocator(page, Chem.hxy).nth(1);

  // Select bond tool
  await bondSelectionTool(page, MacroBondType.Single);

  // Create bonds between chems, taking screenshots in middle states
  await chem1.hover();
  await page.mouse.down();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
  await chem2.hover();
  await page.mouse.up();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Select monomers and pass a bond', async () => {
  /* 
      Test case: Macro: #3385 - Overlapping of bonds between 2 monomers
      https://github.com/epam/ketcher/issues/3385 
      Description: The system shall unable user to create more
      than 1 bond between the first and the second monomer
      */

  await goToPeptidesTab(page);
  const peptide1 = await addSingleMonomerToCanvas(
    page,
    Peptides.Tza,
    300,
    300,
    0,
  );
  const peptide2 = await addSingleMonomerToCanvas(
    page,
    Peptides.Tza,
    400,
    400,
    1,
  );
  await bondSelectionTool(page, MacroBondType.Single);
  await bondTwoMonomers(page, peptide1, peptide2);
  await bondTwoMonomers(page, peptide2, peptide1);
  await page.waitForSelector('#error-tooltip');
  const errorTooltip = await page.getByTestId('error-tooltip').innerText();
  const errorMessage =
    "There can't be more than 1 bond between the first and the second monomer";
  expect(errorTooltip).toEqual(errorMessage);
});

test('Check in full-screen mode it is possible to add a bond between a Peptide monomers if this bond is pulled not from a specific attachment point R', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/4149
    Description: In full-screen mode it is possible to add a bond between 
    a Peptide monomers if this bond is pulled not from a specific attachment point R (connect it from center to center).
    */
  const x = 800;
  const y = 350;
  await page.locator('.css-kp5gpq').click();
  await selectMonomer(page, Peptides.bAla);
  await clickInTheMiddleOfTheScreen(page);
  await selectMonomer(page, Peptides.Edc);
  await clickOnCanvas(page, x, y);
  await connectMonomersWithBonds(page, ['bAla', 'Edc']);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Check in full-screen mode it is possible to add a bond between a RNA monomers if this bond is pulled not from a specific attachment point R', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/4149
    Description: In full-screen mode it is possible to add a bond between 
    a RNA monomers if this bond is pulled not from a specific attachment point R (connect it from center to center).
    */
  const x = 800;
  const y = 350;
  await page.locator('.css-kp5gpq').click();
  await selectMonomer(page, Presets.MOE_A_P);
  await clickInTheMiddleOfTheScreen(page);
  await selectMonomer(page, Presets.dR_U_P);
  await clickOnCanvas(page, x, y);
  await connectMonomersWithBonds(page, ['P', 'dR']);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Check in full-screen mode it is possible to add a bond between a CHEM monomers if this bond is pulled not from a specific attachment point R', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/4149
    Description: In full-screen mode it is possible to add a bond between 
    a CHEM monomers if this bond is pulled not from a specific attachment point R.
    */
  const x = 800;
  const y = 350;
  await page.locator('.css-kp5gpq').click();
  await selectMonomer(page, Chem.A6OH);
  await clickInTheMiddleOfTheScreen(page);
  await selectMonomer(page, Chem.Test_6_Ch);
  await clickOnCanvas(page, x, y);
  await connectMonomersWithBonds(page, ['A6OH', 'Test-6-Ch']);
  await page
    .locator('div')
    .filter({ hasText: /^R2H$/ })
    .getByRole('button')
    .click();
  await page.getByRole('button', { name: 'R1' }).nth(1).click();
  await page.getByRole('button', { name: 'Connect' }).click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that the context menu with the "Edit Connection Points..." option appears when the user right-clicks on a bond', async () => {
  /* 
    Test case: #4905
    Description: Context menu with the "Edit Connection Points..." option appears when the user right-clicks on a bond.
    */
  const bondLine = await getConnectionLine(page);
  await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
  await bondLine.click({ button: 'right' });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that clicking on the "Edit Connection Points..." option opens the dialog', async () => {
  /* 
    Test case: #4905
    Description: Clicking on the "Edit Connection Points..." option opens the dialog.
    */
  const bondLine = await getConnectionLine(page);
  await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
  await openEditConnectionPointsMenu(page, bondLine);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that the user can interact with teal and white attachment points in the dialog', async () => {
  /* 
    Test case: #4905
    Description: User can interact with teal and white attachment points in the dialog.
    */
  const bondLine = await getConnectionLine(page);
  await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
  await openEditConnectionPointsMenu(page, bondLine);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that if there are no available (white) connection points on both monomers, the "Reconnect" button is disabled', async () => {
  /* 
    Test case: #4905
    Description: If there are no available (white) connection points on both monomers, the "Reconnect" button is disabled.
    */
  const bondLine = await getConnectionLine(page);
  await openFileAndAddToCanvasMacro('KET/two-connected-bases.ket', page);
  await openEditConnectionPointsMenu(page, bondLine);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that clicking "Reconnect" with different attachment points chosen results in deletion of the previous bond and establishment of a new one', async () => {
  /* 
    Test case: #4905
    Description: Clicking "Reconnect" with different attachment points chosen results 
    in deletion of the previous bond and establishment of a new one.
    */
  const bondLine = await getConnectionLine(page);
  await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
  await openEditConnectionPointsMenu(page, bondLine);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await pressButton(page, 'Reconnect');
  await bondSelectionTool(page, MacroBondType.Single);
  await bondLine.hover();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that clicking "Reconnect" without changing the attachment points results in no change', async () => {
  /* 
    Test case: #4905
    Description: Clicking "Reconnect" without changing the attachment points results in no change.
    */
  const bondLine = await getConnectionLine(page);
  await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
  await openEditConnectionPointsMenu(page, bondLine);
  await pressButton(page, 'Reconnect');
  await bondSelectionTool(page, MacroBondType.Single);
  await bondLine.hover();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that clicking "Cancel" in the dialog results in no change to the bond', async () => {
  /* 
    Test case: #4905
    Description: Clicking "Cancel" in the dialog results in no change to the bond.
    Test working not a proper way because we have a bug https://github.com/epam/ketcher/issues/5209
    After fix we should update snapshots.
    */
  const bondLine = await getConnectionLine(page);
  await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
  await openEditConnectionPointsMenu(page, bondLine);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
  await pressButton(page, 'Cancel');
  await bondSelectionTool(page, MacroBondType.Single);
  await bondLine.hover();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that closing the dialog without clicking "Reconnect" or "Cancel" does not save any changes (click on cross)', async () => {
  /* 
    Test case: #4905
    Description: Closing the dialog without clicking "Reconnect" or "Cancel" does not save any changes (click on cross).
    Test working not a proper way because we have a bug https://github.com/epam/ketcher/issues/5209
    After fix we should update snapshots.
    */
  const bondLine = await getConnectionLine(page);
  await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
  await openEditConnectionPointsMenu(page, bondLine);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
  await page.getByTitle('Close window').click();
  await bondSelectionTool(page, MacroBondType.Single);
  await bondLine.hover();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that changes made in the "Edit Connection Points" dialog can be undone and redone', async () => {
  /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog can be undone and redone.
    */
  const bondLine = await getConnectionLine(page);
  await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
  await openEditConnectionPointsMenu(page, bondLine);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await pressButton(page, 'Reconnect');
  await bondSelectionTool(page, MacroBondType.Single);
  await bondLine.hover();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
  await pressUndoButton(page);
  await bondSelectionTool(page, MacroBondType.Single);
  await bondLine.hover();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
  await pressRedoButton(page);
  await bondSelectionTool(page, MacroBondType.Single);
  await bondLine.hover();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a KET file and can be loaded', async () => {
  /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a KET file and can be loaded.
    */
  const bondLine = await getConnectionLine(page);
  await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
  await openEditConnectionPointsMenu(page, bondLine);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await pressButton(page, 'Reconnect');
  await verifyFileExport(
    page,
    'KET/two-peptides-connected-expected.ket',
    FileType.KET,
  );
  await bondSelectionTool(page, MacroBondType.Single);
  await bondLine.hover();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Verify that changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a Mol V3000 file and can be loaded', async () => {
  /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a Mol V3000 file and can be loaded.
    */
  const bondLine = await getConnectionLine(page);
  await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
  await openEditConnectionPointsMenu(page, bondLine);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await pressButton(page, 'Reconnect');

  await saveAndCompareMolfile(
    page,
    'Molfiles-V3000/two-peptides-connected-expected.mol',
    'tests/test-data/Molfiles-V3000/two-peptides-connected-expected.mol',
    [1],
    'v3000',
  );

  await bondSelectionTool(page, MacroBondType.Single);
  await bondLine.hover();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a Sequence file and can be loaded', async () => {
  /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a Sequence file and can be loaded.
    */
  const bondLine = await getConnectionLine(page);
  await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
  await openEditConnectionPointsMenu(page, bondLine);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await pressButton(page, 'Reconnect');
  const expectedFile = await getSequence(page);
  await saveToFile(
    'Sequence/two-peptides-connected-expected.seq',
    expectedFile,
  );
  const METADATA_STRING_INDEX = [1];
  const { fileExpected: sequenceFileExpected, file: sequenceFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/Sequence/two-peptides-connected-expected.seq',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(sequenceFile).toEqual(sequenceFileExpected);

  await openFileAndAddToCanvasAsNewProjectMacro(
    'Sequence/two-peptides-connected-expected.seq',
    page,
    'Peptide',
  );

  // await selectOpenFileTool(page);
  // await openFile('Sequence/two-peptides-connected-expected.seq', page);
  // await selectOptionInTypeDropdown('Peptide', page);
  // await pressButton(page, 'Open as New');
  await bondSelectionTool(page, MacroBondType.Single);
  await bondLine.hover();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a FASTA file and can be loaded', async () => {
  /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a FASTA file and can be loaded.
    */
  const bondLine = await getConnectionLine(page);
  await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
  await openEditConnectionPointsMenu(page, bondLine);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await pressButton(page, 'Reconnect');
  const expectedFile = await getFasta(page);
  await saveToFile('FASTA/two-peptides-connected-expected.fasta', expectedFile);

  const METADATA_STRING_INDEX = [1];

  const { fileExpected: fastaFileExpected, file: fastaFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/FASTA/two-peptides-connected-expected.fasta',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(fastaFile).toEqual(fastaFileExpected);
  await selectOpenFileTool(page);
  await openFile('FASTA/two-peptides-connected-expected.fasta', page);
  await selectOptionInTypeDropdown2('Peptide', page);
  await pressButton(page, 'Open as New');
  await bondSelectionTool(page, MacroBondType.Single);
  await bondLine.hover();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a IDT file and can be loaded', async () => {
  /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a IDT file and can be loaded.
    */
  const bondLine = await getConnectionLine(page, 1);
  await selectMonomer(page, Presets.MOE_A_P);
  await clickInTheMiddleOfTheScreen(page);
  await openEditConnectionPointsMenu(page, bondLine);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await pressButton(page, 'Reconnect');
  await verifyFileExport(page, 'IDT/moe-idt-expected.idt', FileType.IDT);
  await openFileAndAddToCanvasAsNewProject('IDT/moe-idt-expected.idt', page);
  await bondSelectionTool(page, MacroBondType.Single);
  await bondLine.hover();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify changing connection points of a side chain bond', async () => {
  /* 
    Test case: #4905
    Description: Side chain bond reconnected.
    */
  const bondLine = await getConnectionLine(page);
  await openFileAndAddToCanvasMacro('KET/side-chain-peptide-chem.ket', page);
  await openEditConnectionPointsMenu(page, bondLine);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R1' }).nth(1).click();
  await pressButton(page, 'Reconnect');
  await bondSelectionTool(page, MacroBondType.Single);
  await bondLine.hover();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify editing of a cyclic structure', async () => {
  /* 
    Test case: #4905
    Description: Cyclic chain bond reconnected.
    */
  const bondLine = await getConnectionLine(page, 2);
  await openFileAndAddToCanvasMacro('KET/cyclic-three-chems-chain.ket', page);
  await openEditConnectionPointsMenu(page, bondLine);
  await page
    .locator('div')
    .filter({ hasText: /^R3H$/ })
    .getByRole('button')
    .click();
  await page
    .locator('div')
    .filter({ hasText: /^R3Br$/ })
    .getByRole('button')
    .click();
  await pressButton(page, 'Reconnect');
  await bondSelectionTool(page, MacroBondType.Single);
  await bondLine.hover();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify correct display and changing of connection points in the dialog for Nucleotides', async () => {
  /* 
    Test case: #4905
    Description: Nucleotides chain bond reconnected.
    */
  const bondLine = await getConnectionLine(page);
  await openFileAndAddToCanvasMacro('KET/two-nucleotides-connected.ket', page);
  await openEditConnectionPointsMenu(page, bondLine);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await pressButton(page, 'Reconnect');
  await bondSelectionTool(page, MacroBondType.Single);
  await bondLine.hover();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify behaviour when a non-bond is right-clicked', async () => {
  /* 
    Test case: #4905
    Description: Nothing happen.
    */
  await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
  await clickOnCanvas(page, 200, 200, { button: 'right' });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
  await getMonomerLocator(page, Peptides.Phe4Me).click({ button: 'right' });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Edit long bonds connections by Edit attachment point menu', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6167
    Description: Long bond can be edited by Edit Connection Point menu.
    Case:
    1. Load ket file with five peptides
    2. Connect first monomer and fifth monomer by R1 and R3
    3. Right click on Long bond
    4. Click on Edit Connection Points
    5. Click on R3 and R2
    6. Click on Reconnect
    7. Take screenshot
    */
  const firstMonomer = getMonomerLocator(page, Peptides.C);
  const secondMonomer = getMonomerLocator(page, Peptides.dC);
  await openFileAndAddToCanvasMacro(
    'KET/five-peptides-connected-by-r2-r1.ket',
    page,
  );
  await bondTwoMonomersPointToPoint(
    page,
    firstMonomer,
    secondMonomer,
    'R1',
    'R3',
  );
  await page.mouse.click(517, 364, { button: 'right' });
  await page.getByText('Edit Connection Points...').click();
  await page.getByRole('button', { name: 'R3' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await takeEditorScreenshot(page);
  await pressButton(page, 'Reconnect');
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Delete long bonds and perform Undo/Redo actions', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6167
    Description: Long bond can be deleted and restored.
    Case:
    1. Load ket file with five peptides
    2. Connect first monomer and fifth monomer by R1 and R3
    3. Delete long bond
    4. Take screenshot
    5. Perform Undo action
    6. Perform Redo action
    7. Take screenshot
    */
  const firstMonomer = getMonomerLocator(page, Peptides.C);
  const secondMonomer = getMonomerLocator(page, Peptides.dC);
  await openFileAndAddToCanvasMacro(
    'KET/five-peptides-connected-by-r2-r1.ket',
    page,
  );
  await bondTwoMonomersPointToPoint(
    page,
    firstMonomer,
    secondMonomer,
    'R1',
    'R3',
  );
  await selectEraseTool(page);
  await page.mouse.click(517, 364);
  await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
  await pressUndoButton(page);
  await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
  await pressRedoButton(page);
  await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
});

test('Delete monomer in structure with long bonds and perform Undo/Redo actions', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6167
    Description: Monomer in structure with long bonds can be deleted and restored.
    Case:
    1. Load ket file with five peptides
    2. Connect first monomer and fifth monomer by R1 and R3
    3. Delete monomer
    4. Take screenshot
    5. Perform Undo action
    6. Perform Redo action
    7. Take screenshot
    */
  const firstMonomer = getMonomerLocator(page, Peptides.C);
  const secondMonomer = getMonomerLocator(page, Peptides.dC);
  await openFileAndAddToCanvasMacro(
    'KET/five-peptides-connected-by-r2-r1.ket',
    page,
  );
  await bondTwoMonomersPointToPoint(
    page,
    firstMonomer,
    secondMonomer,
    'R1',
    'R3',
  );
  await selectEraseTool(page);
  await firstMonomer.click();
  await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
  await pressUndoButton(page);
  await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
  await pressRedoButton(page);
  await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
});

test('Copy structure with long bonds and paste on canvas', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6167
    Description: Structure with long bonds can be copied.
    Case:
    1. Load ket file with five peptides
    2. Copy structure
    3. Paste structure
    4. Take screenshot
    */
  await openFileAndAddToCanvasMacro(
    'KET/five-peptides-connected-by-r2-r1-expected.ket',
    page,
  );
  await takeEditorScreenshot(page);
  await selectAllStructuresOnCanvas(page);
  await copyToClipboardByKeyboard(page);
  await page.mouse.move(300, 300);
  await pasteFromClipboardByKeyboard(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

const connectionVariants = [
  { from: 'R1', to: 'R3' },
  { from: 'R3', to: 'R2' },
  { from: 'R3', to: 'R3' },
];

connectionVariants.forEach(({ from, to }) => {
  test(`Verify that an ${from}-${to} connection forms a long bond that appears on top of monomers (modes Flex, Sequence)`, async () => {
    /*
      Test case: https://github.com/epam/ketcher/issues/6167
      Description: Checks that a long bond between two peptides is placed above monomers in both Flex and Sequence modes.
      Steps:
      1. Switch to Flex mode
      2. Load a .ket file with five peptides
      3. Connect first monomer and fifth monomer by the specified R-group pair
      4. Take a screenshot
      5. Switch to Sequence mode
      6. Take another screenshot
    */
    await selectFlexLayoutModeTool(page);

    const firstMonomer = getMonomerLocator(page, Peptides.C);
    const secondMonomer = getMonomerLocator(page, Peptides.dC);
    await openFileAndAddToCanvasMacro(
      'KET/five-peptides-connected-by-r2-r1.ket',
      page,
    );
    await moveMouseAway(page);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      from,
      to,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});

const connectionVariants2 = [
  { from: 'R1', to: 'R3' },
  { from: 'R3', to: 'R2' },
  { from: 'R3', to: 'R3' },
];

connectionVariants2.forEach(({ from, to }) => {
  test(`Verify that an ${from}-${to} connection forms a long bond that appears on top of monomers (modes Snake, Sequence)`, async () => {
    /*
      Test case: https://github.com/epam/ketcher/issues/6167
      Description: Checks that a long bond between two peptides is placed above monomers in both Snake and Sequence modes.
      Steps:
      1. Load a .ket file with five peptides in Snake mode
      2. Connect first monomer and fifth monomer by the specified R-group pair
      3. Take a screenshot
      4. Switch to Sequence mode
      5. Take another screenshot
    */
    await selectSnakeLayoutModeTool(page);
    const firstMonomer = getMonomerLocator(page, Peptides.C);
    const secondMonomer = getMonomerLocator(page, Peptides.dC);
    await openFileAndAddToCanvasMacro(
      'KET/five-peptides-connected-by-r2-r1.ket',
      page,
    );
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      from,
      to,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});

test('Save and Open structure with long bonds to/from KET', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6167
    Description: Long bond can be saved and opened to/from KET.
    Case:
    1. Load ket file with five peptides
    2. Connect first monomer and fifth monomer by R1 and R3
    3. Save to KET
    4. Open saved KET
    5. Take screenshot
    */
  await selectFlexLayoutModeTool(page);
  const firstMonomer = getMonomerLocator(page, Peptides.C);
  const secondMonomer = getMonomerLocator(page, Peptides.dC);
  await openFileAndAddToCanvasMacro(
    'KET/five-peptides-connected-by-r2-r1.ket',
    page,
  );
  await bondTwoMonomersPointToPoint(
    page,
    firstMonomer,
    secondMonomer,
    'R1',
    'R3',
  );
  await verifyFileExport(
    page,
    'KET/five-peptides-connected-by-r2-r1-expected.ket',
    FileType.KET,
  );
  await openFileAndAddToCanvasAsNewProject(
    'KET/five-peptides-connected-by-r2-r1-expected.ket',
    page,
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Save and Open structure with long bonds to/from MOL V3000', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6167
    Description: Long bond can be saved and opened to/from KET.
    Case:
    1. Load ket file with five peptides
    2. Connect first monomer and fifth monomer by R1 and R3
    3. Save to MOL V3000
    4. Open saved MOL V3000
    5. Take screenshot
    */
  const firstMonomer = getMonomerLocator(page, Peptides.C);
  const secondMonomer = getMonomerLocator(page, Peptides.dC);
  await openFileAndAddToCanvasMacro(
    'KET/five-peptides-connected-by-r2-r1.ket',
    page,
  );
  await bondTwoMonomersPointToPoint(
    page,
    firstMonomer,
    secondMonomer,
    'R1',
    'R3',
  );
  await verifyFileExport(
    page,
    'Molfiles-V3000/five-peptides-connected-by-r2-r1-expected.mol',
    FileType.MOL,
    'v3000',
  );
  await openFileAndAddToCanvasAsNewProject(
    'Molfiles-V3000/five-peptides-connected-by-r2-r1-expected.mol',
    page,
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Connection R3-R3 not overlap each other when connected on one structure', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6167
    Description: Connection R3-R3 not overlap each other when connected on one structure.
    Case:
    1. Load ket file with five peptides
    2. Connect first monomer and fifth monomer by R3 and R3
    3. Connect second monomer and fourth monomer by R3 and R3
    4. Take screenshot
    We have a bug https://github.com/epam/ketcher/issues/6459
    After fix we should update snapshot.
    */
  const firstMonomer = getMonomerLocator(page, Peptides.C);
  const secondMonomer = getMonomerLocator(page, Peptides.Hcy);
  const fourthMonomer = getMonomerLocator(page, Peptides.meC);
  const fifthMonomer = getMonomerLocator(page, Peptides.dC);
  await openFileAndAddToCanvasMacro(
    'KET/five-peptides-connected-by-r2-r1.ket',
    page,
  );
  await bondTwoMonomersPointToPoint(
    page,
    firstMonomer,
    fifthMonomer,
    'R3',
    'R3',
  );
  await bondTwoMonomersPointToPoint(
    page,
    secondMonomer,
    fourthMonomer,
    'R3',
    'R3',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Check the existance of magnetic area for snapping to an angle or closest radial line', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6215
    Description: The existance of magnetic area for snapping to an angle is 15px perpendicular from every one of 
    the 12 radial lines (every 30 degrees) (black lines bellow), or to the closest radial line (if the 15px areas overlap).
    Scenario:
    1. Load ket file with two peptides connected by ordinary bond
    2. Hover over the bond and move it
    3. Take screenshot
    */
  await openFileAndAddToCanvasAsNewProjectMacro(
    'KET/two-peptides-connected.ket',
    page,
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await getMonomerLocator(page, Peptides.meE).click();
  await page.mouse.down();
  const coords = [
    [600, 350],
    [587, 300],
    [465, 250],
    [410, 280],
    [410, 380],
  ];
  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i];
    await page.mouse.move(x, y);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  }
});

test('Check that magnetic areas (radial rays) exist only for monomers connected by covalent and hydrogen', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6215
    Description: Magnetic areas (radial rays) exist only for monomers connected by covalent and hydrogen.
    Scenario:
    1. Load ket file with two peptides connected by hydrogen bond
    2. Hover over the bond and move it
    3. Take screenshot
    */
  await openFileAndAddToCanvasAsNewProjectMacro(
    'KET/two-peptides-connected-by-hydrogen-bond.ket',
    page,
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await getMonomerLocator(page, Peptides.meE).click();
  await page.mouse.down();
  const coords = [
    [600, 350],
    [587, 300],
    [465, 250],
    [410, 280],
    [410, 380],
  ];
  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i];
    await page.mouse.move(x, y);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  }
});

test('Check that If the user holds down CRTL (⌘/Command for MacOS) while moving the monomer no snapping should happen', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6215
    Description: If the user holds down CRTL (⌘/Command for MacOS) while moving the monomer no snapping should happen.
    Scenario:
    1. Load ket file with two peptides connected by hydrogen bond
    2. Hover over the bond and move it with pressed CTRL
    3. Take screenshot
    */
  await openFileAndAddToCanvasAsNewProjectMacro(
    'KET/two-peptides-connected-by-hydrogen-bond.ket',
    page,
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await getMonomerLocator(page, Peptides.meE).click();
  await page.mouse.down();
  await page.keyboard.down('Control');
  const coords = [
    [600, 350],
    [587, 300],
    [465, 250],
    [410, 280],
    [410, 380],
  ];
  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i];
    await page.mouse.move(x, y);
    await takeEditorScreenshot(page);
  }
});

test('Check that for snake mode, snapping should only happen at 4 radial lines (every 90 degrees)', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6215
    Description: For snake mode, snapping only happen at 4 radial lines (every 90 degrees).
    Scenario:
    1. Load ket file in Snake mode with two peptides connected by ordinary bond
    2. Hover over the bond and move it
    3. Take screenshot
    */
  await selectSnakeLayoutModeTool(page);
  await openFileAndAddToCanvasAsNewProjectMacro(
    'KET/two-peptides-connected.ket',
    page,
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await getMonomerLocator(page, Peptides.meE).click();
  await page.mouse.down();
  const coords = [
    [100, 150],
    [300, 100],
  ];
  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i];
    await page.mouse.move(x, y);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  }
});

test('Check the existance of magnetic area for snapping to an angle or closest radial line when drag monomer in the middle', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6215
    Description: Check the existance of magnetic area for snapping to an angle or closest radial line when drag monomer in the middle.
    Scenario:
    1. Load ket file with three peptides connected by ordinary bond
    2. Hover over the bond and move it
    3. Take screenshot
    */
  await selectFlexLayoutModeTool(page);
  await openFileAndAddToCanvasAsNewProjectMacro(
    'KET/three-monomer-connected-by-bond.ket',
    page,
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await getMonomerLocator(page, Peptides.meE).click();
  await page.mouse.down();
  const coords = [
    [520, 350],
    [587, 300],
    [500, 250],
    [410, 280],
    [410, 380],
  ];
  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i];
    await page.mouse.move(x, y);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  }
});

test('Long bond not turns into a direct bond when moving the second monomer', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6167
    Description: Long bond not turns into a direct bond when moving the second monomer.
    Case:
    1. Load ket file with five peptides
    2. Connect first monomer and fifth monomer by R1 and R3
    3. Move second monomer up to long bond
    4. Take screenshot
    We have a bug https://github.com/epam/ketcher/issues/6458
    After fix we should update snapshot.
    */
  const firstMonomer = getMonomerLocator(page, Peptides.C);
  const secondMonomer = getMonomerLocator(page, Peptides.Hcy);
  const fifthMonomer = getMonomerLocator(page, Peptides.dC);
  await openFileAndAddToCanvasMacro(
    'KET/five-peptides-connected-by-r2-r1.ket',
    page,
  );
  await bondTwoMonomersPointToPoint(
    page,
    firstMonomer,
    fifthMonomer,
    'R1',
    'R3',
  );
  await moveMonomer(page, secondMonomer, 460, 350);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

interface KETPath {
  testDescription: string;
  KETFile: string;
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
}

const ambiguousMonomers: KETPath[] = [
  {
    testDescription: '1. Ambiguous CHEM',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherCHEM.ket',
  },
  {
    testDescription: '2. Ambiguous CHEM Weighted',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherCHEMWeighted.ket',
  },
  {
    testDescription: '3. Ambiguous Sugar',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherSugar.ket',
  },
  {
    testDescription: '4. Ambiguous Sugar Weighted',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherSugarWeighted.ket',
  },
  {
    testDescription: '5. Ambiguous Base',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherBase.ket',
  },
  {
    testDescription: '6. Ambiguous Base Weighted',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherBaseWeightedTBD.ket',
  },
  {
    testDescription: '7. Ambiguous Phosphate',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherPhosphate.ket',
  },
  {
    testDescription: '8. Ambiguous Phosphate Weighted',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherPhosphateWeighted.ket',
  },
  /*
  {
    testDescription: '9. Ambiguous Nucleotide',
    KETFile:'',
  },
  {
    testDescription: '10. Ambiguous Nucleotide Weighted',
    KETFile:'',
  },
  */
  {
    testDescription: '11. Ambiguous Peptide',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherPeptide.ket',
  },
  {
    testDescription: '12. Ambiguous Peptide Weighted',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherPeptideWeighted.ket',
  },
  /*
  {
    testDescription: '13. Ambiguous Monomer',
    KETFile: '',
  },
  {
    testDescription: '14. Ambiguous Monomer Weighted',
    KETFile: '',
  },
  */
];

test.describe('Verify "Select/Edit Connection Points" dialogues for ambiguous monomers', () => {
  for (const ambiguousMonomer of ambiguousMonomers) {
    test(`${ambiguousMonomer.testDescription}`, async () => {
      /* 
      Test case: #5627
      Description: Verify "Select/Edit Connection Points" dialogues for ambiguous monomers
      Case: 
      1. Load ket file with two pairs of alternatives and mixtures (with wheights and without)
      2. Hover over first connection
      3. Take screenshot 
      4. Hover over second connection
      5. Take screenshot 
      6. Verify all tooltips corresponds to monomer types 
      */
      await openFileAndAddToCanvasMacro(ambiguousMonomer.KETFile, page);
      await moveMouseAway(page);
      const bondLine = await getConnectionLine(page);
      await bondLine.hover();
      await delay(1);
      await takeEditorScreenshot(page);
      await openEditConnectionPointsMenu(page, bondLine);
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
      await pressButton(page, 'Cancel');
    });
  }
});
