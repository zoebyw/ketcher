/* eslint-disable no-magic-numbers */
import { expect, test, Page } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  drawBenzeneRing,
  getCoordinatesTopAtomOfBenzeneRing,
  clickOnAtom,
  selectNestedTool,
  ArrowTool,
  clickOnTheCanvas,
  RgroupTool,
  pressButton,
  selectLeftPanelButton,
  LeftPanelButton,
  dragMouseTo,
  setAttachmentPoints,
  moveMouseToTheMiddleOfTheScreen,
  getCoordinatesOfTheMiddleOfTheScreen,
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
  setReactionMarginSizeOptionUnit,
  setReactionMarginSizeValue,
  setBondLengthOptionUnit,
  setBondLengthValue,
  openSettings,
  clickOnCanvas,
  selectLayoutTool,
  setHashSpacingValue,
  setHashSpacingOptionUnit,
  openBondsSettingsSection,
} from '@utils';
import {
  selectClearCanvasTool,
  selectSaveTool,
} from '@tests/pages/common/TopLeftToolbar';
import { drawReactionWithTwoBenzeneRings } from '@utils/canvas/drawStructures';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { selectEraseTool } from '@tests/pages/common/CommonLeftToolbar';

async function savedFileInfoStartsWithRxn(page: Page, wantedResult = false) {
  await selectSaveTool(page);
  const textareaSelector = 'textarea[class^="Save-module_previewArea"]';
  const textareaElement = await page.$(textareaSelector);
  const textareaText = await textareaElement?.textContent();
  const expectedSentence = '$RXN';
  wantedResult
    ? expect(textareaText?.startsWith(expectedSentence)).toBeTruthy()
    : expect(textareaText?.startsWith(expectedSentence)).toBeFalsy();
}

test.describe('Tests for Open and Save RXN file operations', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Open and Save file - Reaction with atom and bond properties', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1897
     * Description: Reaction with atom and bond properties
     */
    await openFileAndAddToCanvas(
      'Rxn-V2000/reaction-with-atom-and-bond-properties-saved.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Reaction from file that contains Rgroup', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1901
     * Description: Reaction from file that contains Rgroup
     */
    test.slow();
    const xOffsetFromCenter = 40;
    await drawBenzeneRing(page);
    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    await clickOnAtom(page, 'C', 1);
    await page.getByRole('button', { name: 'R7' }).click();
    await page.getByRole('button', { name: 'Apply' }).click();
    await selectNestedTool(page, ArrowTool.ARROW_FILLED_BOW);
    await clickOnTheCanvas(page, xOffsetFromCenter, 0);
    await selectSaveTool(page);
    const saveButtonOne = page.getByRole('button', {
      name: 'Save',
      exact: true,
    });
    await expect(saveButtonOne).not.toHaveAttribute('disabled', 'disabled');

    await pressButton(page, 'Cancel');
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await setAttachmentPoints(
      page,
      { label: 'C', index: 2 },
      { primary: true },
      'Apply',
    );
    await selectSaveTool(page);
    const saveButtonTwo = page.getByRole('button', {
      name: 'Save',
      exact: true,
    });
    await expect(saveButtonTwo).not.toHaveAttribute('disabled', 'disabled');

    await page.getByRole('button', { name: 'Cancel' }).click();
    await selectNestedTool(page, RgroupTool.R_GROUP_FRAGMENT);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await page.getByRole('button', { name: 'R22' }).click();
    await page.getByRole('button', { name: 'Apply' }).click();
    await selectSaveTool(page);
    const saveButtonThree = page.getByRole('button', {
      name: 'Save',
      exact: true,
    });
    await expect(saveButtonThree).not.toHaveAttribute('disabled', 'disabled');
  });

  test('Open and Save file - Reaction from file that contains Sgroup', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1903
     * Description: Reaction from file that contains Sgroup
     */
    test.slow();
    await openFileAndAddToCanvas(
      'Rxn-V2000/structure-with-s-groups-with-unsupported-s-group-type.rxn',
      page,
    );
    await verifyFileExport(
      page,
      'Rxn-V2000/structure-with-s-groups-with-unsupported-s-group-type-saved.rxn',
      FileType.RXN,
      'v2000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/structure-with-s-groups-with-unsupported-s-group-type-saved.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - File without arrow or(and) plus-symbol', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1905
     * Description: File without arrow or(and) plus-symbol
     */
    test.slow();
    await selectLeftPanelButton(LeftPanelButton.Chain, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const xDelta = 300;
    const xDeltaHalf = 150;
    const yDelta50 = 50;
    const yDelta20 = 20;
    const xCoordinatesWithShift = x + xDelta;
    const xCoordinatesWithShiftHalf = x + xDeltaHalf;
    const yCoordinatesWithShift = y + yDelta50;
    await dragMouseTo(xCoordinatesWithShift, y, page);
    await savedFileInfoStartsWithRxn(page);

    await pressButton(page, 'Cancel');
    await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
    await clickOnCanvas(page, xCoordinatesWithShiftHalf, yCoordinatesWithShift);
    const ySecondChain = yCoordinatesWithShift + yDelta50;
    await selectLeftPanelButton(LeftPanelButton.Chain, page);
    await page.mouse.move(x, ySecondChain);
    await dragMouseTo(xCoordinatesWithShift, ySecondChain, page);
    await savedFileInfoStartsWithRxn(page);

    await pressButton(page, 'Cancel');
    await selectEraseTool(page);
    await clickOnCanvas(page, xCoordinatesWithShiftHalf, yCoordinatesWithShift);
    await selectNestedTool(page, ArrowTool.ARROW_FILLED_BOW);
    const yArrowStart = y + yDelta20;
    const yArrowEnd = yArrowStart + yDelta20;
    await page.mouse.move(xCoordinatesWithShiftHalf, yArrowStart);
    await dragMouseTo(xCoordinatesWithShiftHalf, yArrowEnd, page);
    await savedFileInfoStartsWithRxn(page, true);

    await pressButton(page, 'Cancel');
    await selectClearCanvasTool(page);
    await selectNestedTool(page, ArrowTool.ARROW_FILLED_BOW);
    await page.mouse.move(xCoordinatesWithShiftHalf, yArrowStart);
    await dragMouseTo(xCoordinatesWithShiftHalf, yArrowEnd, page);
    await savedFileInfoStartsWithRxn(page, true);
  });

  test('Open and Save file - Structure is not missing when "Paste from clipboard" or "Open from file" if reaction consists of two or more reaction arrows and structures', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-8904
     * Description: Structure isn't missing when "Paste from clipboard" or "Open from file" if reaction consists of two or more reaction arrows and structures
     */
    test.slow();
    const RING_OFFSET = 150;
    const ARROW_OFFSET = 20;
    const ARROW_LENGTH = 100;
    await drawReactionWithTwoBenzeneRings(
      page,
      RING_OFFSET,
      ARROW_OFFSET,
      ARROW_LENGTH,
    );

    const xOffsetFromCenter = 50;
    await selectNestedTool(page, ArrowTool.ARROW_FILLED_BOW);
    await moveMouseToTheMiddleOfTheScreen(page);
    await clickOnTheCanvas(page, xOffsetFromCenter, 0);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Rxn-V2000/structure-with-two-reaction-arrows-saved.rxn',
      FileType.RXN,
      'v2000',
    );
    await verifyFileExport(
      page,
      'Rxn-V3000/structure-with-two-reaction-arrows-saved.rxn',
      FileType.RXN,
      'v3000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V3000/structure-with-two-reaction-arrows-saved.rxn',
      page,
    );
    await takeEditorScreenshot(page);

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/structure-with-two-reaction-arrows-saved.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Import the structure from the saved RXN 2000/3000 file', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-12964
     * Description: Import the structure from the saved RXN 2000/3000 file
     */
    await openFileAndAddToCanvas(
      'Rxn-V3000/reaction-with-several-components.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Open the RXN v3000 file with S-Group Properties Type = Multiple group', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-12967 for Open RXN v3000 file with 'S-Group Properties Type = Multiple group rxnV3000Multiple.zip
     * Description: Open the RXN v3000 file with S-Group Properties Type = Multiple group
     */
    await openFileAndAddToCanvas(
      'Rxn-V3000/structure-with-s-groups-with-unsupported-s-group-type.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Open the RXN v2000 file with S-Group Properties Type = Multiple group', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-12967 for Open RXN v2000 file with 'S-Group Properties Type = Multiple group rxnV2000Multiple.zip
     * Description: Open the RXN v2000 file with S-Group Properties Type = Multiple group
     */
    await openFileAndAddToCanvas(
      'Rxn-V2000/structure-with-s-groups-with-unsupported-s-group-type.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Reaction from file that contains abbreviation 1/2 - open', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1899(1)
     * Description: Reaction with abbreviations is opened and saved correctly
     */
    await openFileAndAddToCanvas('Rxn-V2000/sec-butyl-abr.rxn', page);
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Reaction from file that contains abbreviation 2/2 - save', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1899(2)
     * Description: Reaction with abbreviations is opened and saved correctly
     */
    await openFileAndAddToCanvas('Rxn-V2000/sec-butyl-abr.rxn', page);
    await verifyFileExport(
      page,
      'Rxn-V2000/sec-butyl-abr-expectedV2000.rxn',
      FileType.RXN,
      'v2000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/sec-butyl-abr-expectedV2000.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Reaction from file that contains Heteroatoms 1/2 - open', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1904(1)
     * Description: Reaction with heteroatoms is opened and saved correctly
     */
    await openFileAndAddToCanvas('Rxn-V2000/heteroatoms.rxn', page);
    // check that structure opened from file is displayed correctly
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - Reaction from file that contains Heteroatoms 2/2 - save', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1904(2)
     * Description: Reaction with heteroatoms is opened and saved correctly
     */
    await openFileAndAddToCanvas('Rxn-V2000/heteroatoms.rxn', page);
    await verifyFileExport(
      page,
      'Rxn-V2000/heteroatoms-expectedV2000.rxn',
      FileType.RXN,
      'v2000',
    );
  });

  test('Open and Save file - V3000 rxn file contains Rgroup 1/2 - open', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1902(1)
     * Description: Reaction can be opened correctly from rxn V3000 file
     */
    await openFileAndAddToCanvas('Rxn-V3000/r-group-V3000.rxn', page);
    // check that structure opened from file is displayed correctly
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - V3000 rxn file contains Rgroup 2/2 - save', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1902(2)
     * Description: Reaction can be saved correctly to rxn V3000 file
     */
    await openFileAndAddToCanvas('Rxn-V3000/r-group-V3000.rxn', page);
    await verifyFileExport(
      page,
      'Rxn-V3000/r-group-V3000-expectedV3000.rxn',
      FileType.RXN,
      'v3000',
    );
  });

  test('Validate that unsplit nucleotides connected with phosphates could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with phosphates could be saved to rxn2000 file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-phosphates.ket',
      page,
    );
    await selectEraseTool(page);
    await selectNestedTool(page, ArrowTool.ARROW_OPEN_ANGLE);
    await page.mouse.move(100, 500);
    await dragMouseTo(900, 100, page);

    await verifyFileExport(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-phosphates.rxn',
      FileType.RXN,
      'v2000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/unsplit-nucleotides-connected-with-phosphates.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with peptides could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with peptides could be saved to rxn2000 file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-peptides.ket',
      page,
    );
    await selectEraseTool(page);
    await selectNestedTool(page, ArrowTool.ARROW_OPEN_ANGLE);
    await page.mouse.move(100, 500);
    await dragMouseTo(900, 100, page);

    await verifyFileExport(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-peptides.rxn',
      FileType.RXN,
      'v2000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/unsplit-nucleotides-connected-with-peptides.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with other nucleotides could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with other nucleotides could be saved to rxn2000 file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
      page,
    );
    await selectEraseTool(page);
    await selectNestedTool(page, ArrowTool.ARROW_OPEN_ANGLE);
    await page.mouse.move(100, 500);
    await dragMouseTo(700, 100, page);

    await verifyFileExport(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-nucleotides.rxn',
      FileType.RXN,
      'v2000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/unsplit-nucleotides-connected-with-nucleotides.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with chems could be saved to rxn2000 file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-chems.ket',
      page,
    );
    await selectEraseTool(page);
    await selectNestedTool(page, ArrowTool.ARROW_OPEN_ANGLE);
    await page.mouse.move(100, 500);
    await dragMouseTo(900, 100, page);
    await verifyFileExport(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-chems.rxn',
      FileType.RXN,
      'v2000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/unsplit-nucleotides-connected-with-chems.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with bases could be saved to rxn2000 file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-bases.ket',
      page,
    );
    await selectEraseTool(page);
    await selectNestedTool(page, ArrowTool.ARROW_OPEN_ANGLE);
    await page.mouse.move(100, 500);
    await dragMouseTo(900, 100, page);

    await verifyFileExport(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-bases.rxn',
      FileType.RXN,
      'v2000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/unsplit-nucleotides-connected-with-bases.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with sugars could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with sugars could be saved to rxn2000 file and loaded back
    */
    test.slow();
    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-sugars.ket',
      page,
    );
    await selectEraseTool(page);
    await selectNestedTool(page, ArrowTool.ARROW_OPEN_ANGLE);
    await page.mouse.move(100, 500);
    await dragMouseTo(900, 100, page);

    await verifyFileExport(
      page,
      'Rxn-V2000/unsplit-nucleotides-connected-with-sugars.rxn',
      FileType.RXN,
      'v2000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/unsplit-nucleotides-connected-with-sugars.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that simple schema with retrosynthetic arrow could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn2000 file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
      page,
    );

    await verifyFileExport(
      page,
      'Rxn-V2000/simple-schema-with-retrosynthetic-arrow.rxn',
      FileType.RXN,
      'v2000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/simple-schema-with-retrosynthetic-arrow.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that simple schema with retrosynthetic arrow could be saved to rxn3000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn3000 file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
      page,
    );

    await verifyFileExport(
      page,
      'Rxn-V3000/simple-schema-with-retrosynthetic-arrow.rxn',
      FileType.RXN,
      'v3000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V3000/simple-schema-with-retrosynthetic-arrow.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with retrosynthetic, angel arrows and plus could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn2000 file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-retrosynthetic-angel-arrows-and-plus.ket',
      page,
    );

    await verifyFileExport(
      page,
      'Rxn-V2000/schema-with-retrosynthetic-angel-arrows-and-plus.rxn',
      FileType.RXN,
      'v2000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/schema-with-retrosynthetic-angel-arrows-and-plus.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with retrosynthetic, angel arrows and plus could be saved to rxn3000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn3000 file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-retrosynthetic-angel-arrows-and-plus.ket',
      page,
    );

    await verifyFileExport(
      page,
      'Rxn-V3000/schema-with-retrosynthetic-angel-arrows-and-plus.rxn',
      FileType.RXN,
      'v3000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V3000/schema-with-retrosynthetic-angel-arrows-and-plus.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with vertical retrosynthetic arrow could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn2000 file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-vertical-retrosynthetic-arrow.ket',
      page,
    );

    await verifyFileExport(
      page,
      'Rxn-V2000/schema-with-vertical-retrosynthetic-arrow.rxn',
      FileType.RXN,
      'v2000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/schema-with-vertical-retrosynthetic-arrow.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with vertical retrosynthetic arrow could be saved to rxn3000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn3000 file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-vertical-retrosynthetic-arrow.ket',
      page,
    );

    await verifyFileExport(
      page,
      'Rxn-V3000/schema-with-vertical-retrosynthetic-arrow.rxn',
      FileType.RXN,
      'v3000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V3000/schema-with-vertical-retrosynthetic-arrow.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with two retrosynthetic arrows could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn2000 file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-two-retrosynthetic-arrows.ket',
      page,
    );

    await verifyFileExport(
      page,
      'Rxn-V2000/schema-with-two-retrosynthetic-arrows.rxn',
      FileType.RXN,
      'v2000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/schema-with-two-retrosynthetic-arrows.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with two retrosynthetic arrows could be saved to rxn3000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn3000 file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-two-retrosynthetic-arrows.ket',
      page,
    );

    await verifyFileExport(
      page,
      'Rxn-V3000/schema-with-two-retrosynthetic-arrows.rxn',
      FileType.RXN,
      'v3000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V3000/schema-with-two-retrosynthetic-arrows.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with diagonaly retrosynthetic arrow could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn2000 file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-diagonal-retrosynthetic-arrow.ket',
      page,
    );

    await verifyFileExport(
      page,
      'Rxn-V2000/schema-with-diagonal-retrosynthetic-arrow.rxn',
      FileType.RXN,
      'v2000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/schema-with-diagonal-retrosynthetic-arrow.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with diagonaly retrosynthetic arrow could be saved to rxn3000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn3000 file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-diagonal-retrosynthetic-arrow.ket',
      page,
    );

    await verifyFileExport(
      page,
      'Rxn-V3000/schema-with-diagonal-retrosynthetic-arrow.rxn',
      FileType.RXN,
      'v3000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V3000/schema-with-diagonal-retrosynthetic-arrow.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with reverse retrosynthetic arrow and pluses could be saved to rxn2000 file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn2000 file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-reverse-retrosynthetic-arrow-and-pluses.ket',
      page,
    );

    await verifyFileExport(
      page,
      'Rxn-V2000/schema-with-reverse-retrosynthetic-arrow-and-pluses.rxn',
      FileType.RXN,
      'v2000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/schema-with-reverse-retrosynthetic-arrow-and-pluses.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with reverse retrosynthetic arrow and pluses could be saved to rxn3000 file and loaded back', async ({
    page,
  }) => {
    /*

    Test case: Import/Saving files
    Description: Validate that schema with retrosynthetic arrow could be saved to rxn3000 file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-reverse-retrosynthetic-arrow-and-pluses.ket',
      page,
    );

    await verifyFileExport(
      page,
      'Rxn-V3000/schema-with-reverse-retrosynthetic-arrow-and-pluses.rxn',
      FileType.RXN,
      'v3000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V3000/schema-with-reverse-retrosynthetic-arrow-and-pluses.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Bond length setting with px option is applied and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied and it should be save to RXN2000
  */
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await setBondLengthOptionUnit(page, 'px-option');
    await setBondLengthValue(page, '7.8');
    await pressButton(page, 'Apply');
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-catalyst-px-bond-lengh.rxn',
      FileType.RXN,
      'v2000',
    );
  });

  test('The Hash spacing setting with px option is applied and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied and it should be save to RXN2000
  */
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await setHashSpacingOptionUnit(page, 'px-option');
    await setHashSpacingValue(page, '7.8');
    await pressButton(page, 'Apply');
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-catalyst-px-hash-spacing-expected.rxn',
      FileType.RXN,
      'v2000',
    );

    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/layout-with-catalyst-px-hash-spacing-expected.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with px option is applied and it should be save to RXN3000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied and it should be save to RXN3000
  */
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await setHashSpacingOptionUnit(page, 'px-option');
    await setHashSpacingValue(page, '7.8');
    await pressButton(page, 'Apply');
    await verifyFileExport(
      page,
      'Rxn-V3000/layout-with-catalyst-px-hash-spacing-expected.rxn',
      FileType.RXN,
      'v3000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V3000/layout-with-catalyst-px-hash-spacing-expected.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Bond length setting with pt option is applied and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied and it should be save to RXN2000
  */
    await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await setBondLengthOptionUnit(page, 'pt-option');
    await setBondLengthValue(page, '67.8');
    await pressButton(page, 'Apply');
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-diagonally-arrow-pt-bond-lengh.rxn',
      FileType.RXN,
      'v2000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/layout-with-diagonally-arrow-pt-bond-lengh.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with pt option is applied and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied and it should be save to RXN2000
  */
    await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await setHashSpacingOptionUnit(page, 'pt-option');
    await setHashSpacingValue(page, '7.8');
    await pressButton(page, 'Apply');
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-diagonally-arrow-pt-hash-spacing-expected.rxn',
      FileType.RXN,
      'v2000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/layout-with-diagonally-arrow-pt-hash-spacing-expected.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with pt option is applied and it should be save to RXN3000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied and it should be save to RXN3000
  */
    await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await setHashSpacingOptionUnit(page, 'pt-option');
    await setHashSpacingValue(page, '7.8');
    await pressButton(page, 'Apply');
    await verifyFileExport(
      page,
      'Rxn-V3000/layout-with-diagonally-arrow-pt-hash-spacing-expected.rxn',
      FileType.RXN,
      'v3000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V3000/layout-with-diagonally-arrow-pt-hash-spacing-expected.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Bond length setting with cm option is applied and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied and it should be save to RXN2000
  */
    await openFileAndAddToCanvas('KET/layout-with-dif-elements.ket', page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await setBondLengthOptionUnit(page, 'cm-option');
    await setBondLengthValue(page, '7.8');
    await pressButton(page, 'Apply');
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-dif-elements-cm-bond-lengh.rxn',
      FileType.RXN,
      'v2000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/layout-with-dif-elements-cm-bond-lengh.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with cm option is applied and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied and it should be save to RXN2000
  */
    await openFileAndAddToCanvas('KET/layout-with-dif-elements.ket', page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await setHashSpacingOptionUnit(page, 'cm-option');
    await setHashSpacingValue(page, '7.8');
    await pressButton(page, 'Apply');
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-dif-elements-cm-hash-spacing-expected.rxn',
      FileType.RXN,
      'v2000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/layout-with-dif-elements-cm-hash-spacing-expected.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with cm option is applied and it should be save to RXN3000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied and it should be save to RXN3000
  */
    await openFileAndAddToCanvas('KET/layout-with-dif-elements.ket', page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await setHashSpacingOptionUnit(page, 'cm-option');
    await setHashSpacingValue(page, '7.8');
    await pressButton(page, 'Apply');
    await verifyFileExport(
      page,
      'Rxn-V3000/layout-with-dif-elements-cm-hash-spacing-expected.rxn',
      FileType.RXN,
      'v3000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V3000/layout-with-dif-elements-cm-hash-spacing-expected.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Bond length setting with inch option is applied and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied and it should be save to RXN2000
  */
    await openFileAndAddToCanvas('KET/layout-with-long-molecule.ket', page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await setBondLengthOptionUnit(page, 'inch-option');
    await setBondLengthValue(page, '7.8');
    await pressButton(page, 'Apply');
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-long-molecule-inch-bond-lengh.rxn',
      FileType.RXN,
      'v2000',
    );
  });

  test('The Hash spacing setting with inch option is applied and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied and it should be save to RXN2000
  */
    await openFileAndAddToCanvas('KET/layout-with-long-molecule.ket', page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await setHashSpacingOptionUnit(page, 'inch-option');
    await setHashSpacingValue(page, '7.8');
    await pressButton(page, 'Apply');
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-long-molecule-inch-hash-spacing-expected.rxn',
      FileType.RXN,
      'v2000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/layout-with-long-molecule-inch-hash-spacing-expected.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with inch option is applied and it should be save to RXN3000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied and it should be save to RXN3000
  */
    await openFileAndAddToCanvas('KET/layout-with-long-molecule.ket', page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await setHashSpacingOptionUnit(page, 'inch-option');
    await setHashSpacingValue(page, '7.8');
    await pressButton(page, 'Apply');
    await verifyFileExport(
      page,
      'Rxn-V3000/layout-with-long-molecule-inch-hash-spacing-expected.rxn',
      FileType.RXN,
      'v3000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V3000/layout-with-long-molecule-inch-hash-spacing-expected.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Reaction component margin size setting with px option is applied, click on layout and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to RXN2000
  */
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await setReactionMarginSizeOptionUnit(page, 'px-option');
    await setReactionMarginSizeValue(page, '47.8');
    await pressButton(page, 'Apply');
    await pressButton(page, 'OK');
    await selectLayoutTool(page);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-catalyst-px-margin-size.rxn',
      FileType.RXN,
      'v2000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/layout-with-catalyst-px-margin-size.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The ACS setting is applied, click on layout and it should be save to RXN2000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/ketcher/issues/5156
  Description: add new option ACS style and check saving to different format
  */
    await openFileAndAddToCanvas('KET/layout-with-long-molecule.ket', page);
    await openSettings(page);
    await pressButton(page, 'Set ACS Settings');
    await pressButton(page, 'Apply');
    await pressButton(page, 'OK');
    await selectLayoutTool(page);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Rxn-V2000/layout-with-long-molecule-acs-style.rxn',
      FileType.RXN,
      'v2000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/layout-with-long-molecule-acs-style.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The ACS setting is applied, click on layout and it should be save to RXN3000', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/ketcher/issues/5156
  Description: add new option ACS style and check saving to different format
  */
    await openFileAndAddToCanvas('KET/layout-with-long-molecule.ket', page);
    await openSettings(page);
    await pressButton(page, 'Set ACS Settings');
    await pressButton(page, 'Apply');
    await pressButton(page, 'OK');
    await selectLayoutTool(page);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Rxn-V3000/layout-with-long-molecule-acs-style.rxn',
      FileType.RXN,
      'v3000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V3000/layout-with-long-molecule-acs-style.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });
});
