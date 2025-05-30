/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@playwright/test';
import {
  ArrowTool,
  copyAndPaste,
  cutAndPaste,
  saveStructureWithReaction,
  screenshotBetweenUndoRedo,
  selectLeftPanelButton,
  selectNestedTool,
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  clickOnTheCanvas,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  INPUT_DELAY,
  getControlModifier,
  LeftPanelButton,
  Point,
  waitForPageInit,
  waitForRender,
  openDropdown,
  selectRectangleArea,
  copyToClipboardByKeyboard,
  cutToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  selectAllStructuresOnCanvas,
  clickOnCanvas,
  selectCleanTool,
  selectLayoutTool,
} from '@utils';
import { pageReloadMicro } from '@utils/common/helpers';
import {
  pressRedoButton,
  pressUndoButton,
  selectClearCanvasTool,
  selectSaveTool,
} from '@tests/pages/common/TopLeftToolbar';
import {
  selectAreaSelectionTool,
  selectEraseTool,
} from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';

const xOffsetFromCenter = -35;
const idToTitle: {
  [key: string]: string;
} = {
  'reaction-arrow-open-angle': 'Arrow Open Angle Tool',
  'reaction-arrow-filled-triangle': 'Arrow Filled Triangle Tool',
  'reaction-arrow-filled-bow': 'Arrow Filled Bow Tool',
  'reaction-arrow-dashed-open-angle': 'Arrow Dashed Open Angle Tool',
  'reaction-arrow-failed': 'Failed Arrow Tool',
  'reaction-arrow-retrosynthetic': 'Retrosynthetic Arrow Tool',
  'reaction-arrow-both-ends-filled-triangle':
    'Arrow Both Ends Filled Triangle Tool',
  'reaction-arrow-equilibrium-filled-half-bow':
    'Arrow Equilibrium Filled Half Bow Tool',
  'reaction-arrow-equilibrium-filled-triangle':
    'Arrow Equilibrium Filled Triangle Tool',
  'reaction-arrow-equilibrium-open-angle': 'Arrow Equilibrium Open Angle Tool',
  'reaction-arrow-unbalanced-equilibrium-filled-half-bow':
    'Arrow Unbalanced Equilibrium Filled Half Bow Tool',
  'reaction-arrow-unbalanced-equilibrium-open-half-angle':
    'Arrow Unbalanced Equilibrium Open Half Angle Tool',
  'reaction-arrow-unbalanced-equilibrium-large-filled-half-bow':
    'Arrow Unbalanced Equilibrium Large Filled Half Bow Tool',
  'reaction-arrow-unbalanced-equilibrium-filled-half-triangle':
    'Arrow Unbalanced Equilibrium Filled Half Triangle Tool',
  'reaction-arrow-elliptical-arc-arrow-filled-bow':
    'Arrow Elliptical Arc Filled Bow Tool',
  'reaction-arrow-elliptical-arc-arrow-filled-triangle':
    'Arrow Elliptical Arc Filled Triangle Tool',
  'reaction-arrow-elliptical-arc-arrow-open-angle':
    'Arrow Elliptical Arc Open Angle Tool',
  'reaction-arrow-elliptical-arc-arrow-open-half-angle':
    'Arrow Elliptical Arc Open Half Angle Tool',
};

const formatsForSave = [
  {
    name: 'Daylight SMILES',
    fileExtension: 'smi',
  },
  {
    name: 'Extended SMILES',
    fileExtension: 'cxsmi',
  },
  {
    name: 'CML',
    fileExtension: 'cml',
  },
];

const OFFSET_FROM_ARROW = 15;

test.describe('Plus and Arrows tools ', () => {
  const CANVAS_CLICK_X = 300;
  const CANVAS_CLICK_Y = 300;

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.describe('Create reactions', () => {
    /**
     * Test case: EPMLSOPKET-1783
     * Description: Create Reactions
     */
    for (const tool of Object.values(ArrowTool)) {
      test(` ${tool} check`, async ({ page }) => {
        await openFileAndAddToCanvas(
          'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
          page,
        );
        await selectNestedTool(page, tool);
        await clickOnTheCanvas(page, xOffsetFromCenter, 0);
        await takeEditorScreenshot(page);
        await pressUndoButton(page);
        await takeEditorScreenshot(page);
      });
    }
  });

  test('Resizing arrow', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1784
     * Description: Arrow is resized correctly
     */
    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + 100, y + 100, page);
    await selectAreaSelectionTool(page, SelectionToolType.Rectangle);
    await takeEditorScreenshot(page);
    await page.mouse.move(x + 98, y + 98);
    await dragMouseTo(x + 150, y + 150, page);
    await takeEditorScreenshot(page);
  });

  test('Copy/paste, cut/paste arrow', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2872
     * Description: Copy/cut/paste reaction tools
     */
    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + 100, y + 100, page);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await cutAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify reaction is registered in undo/redo chain', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1790
     * Description: Verify reaction is registered in undo/redo chain
     */
    const xOffsetFromCenter1 = -235;
    const xOffsetFromCenter2 = 235;
    await openFileAndAddToCanvas('Molfiles-V2000/four-structures.mol', page);
    await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
    await clickOnTheCanvas(page, xOffsetFromCenter1, 0);
    await clickOnTheCanvas(page, xOffsetFromCenter2, 0);
    await takeEditorScreenshot(page);

    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    await clickOnTheCanvas(page, -80, 0);
    await takeEditorScreenshot(page);

    await selectEraseTool(page);
    await clickOnTheCanvas(page, -60, 0);
    await takeEditorScreenshot(page);

    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    await clickOnTheCanvas(page, xOffsetFromCenter1, -100);
    await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
    await clickOnTheCanvas(page, xOffsetFromCenter2, -100);
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await pressUndoButton(page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await pressRedoButton(page);
    }
    await takeEditorScreenshot(page);
  });

  test.describe('Plus sign - Manipulations with different Tools', () => {
    /**
     * Test case: EPMLSOPKET - 1791
     * Description: Plus sign - Manipulations with different Tools
     */
    let point: Point;
    test.beforeEach(async ({ page }) => {
      await openFileAndAddToCanvas('Rxn-V2000/reaction-3.rxn', page);
      await selectAreaSelectionTool(page, SelectionToolType.Rectangle);
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    });

    test('Select the plus sign and move it', async ({ page }) => {
      await waitForRender(page, async () => {
        await page.mouse.move(point.x - 150, point.y - 10);
        await dragMouseTo(point.x - 150, point.y - 40, page);
      });
    });

    test('Select the plus sign with any reaction component(s) and move them', async ({
      page,
    }) => {
      await waitForRender(page, async () => {
        await page.mouse.move(point.x - 300, point.y - 100);
        await dragMouseTo(point.x - 140, point.y + 100, page);
      });

      await waitForRender(page, async () => {
        await page.mouse.move(point.x - 200, point.y - 20);
        await dragMouseTo(point.x - 300, point.y - 100, page);
      });
    });

    test('Select the whole reaction and move it', async ({ page }) => {
      await waitForRender(page, async () => {
        await selectAllStructuresOnCanvas(page);
        await page.mouse.move(point.x - 20, point.y - 20);
      });
      await dragMouseTo(point.x - 100, point.y - 100, page);
    });

    test.skip(
      // Consider refactoring of this test since it doesn't work
      'Select plus sign, cut and paste it onto the canvas',
      {
        tag: ['@FlackyTest'],
      },
      async ({ page }) => {
        await clickOnCanvas(page, point.x - 200, point.y + 15);
        await selectRectangleArea(
          page,
          point.x - 200 - 20,
          point.y + 15 - 20,
          point.x - 200 + 20,
          point.y + 15 + 20,
        );
        await cutToClipboardByKeyboard(page);
        await pasteFromClipboardByKeyboard(page);
        // await selectTopPanelButton(TopPanelButton.Cut, page);
        // await waitForSpinnerFinishedWork(
        //   page,
        //   async () => await selectTopPanelButton(TopPanelButton.Cut, page),
        // );

        // await pasteFromClipboardByKeyboard(page);
        // await waitForSpinnerFinishedWork(
        //   page,
        //   async () => await pasteFromClipboardByKeyboard(page);
        // );

        await clickOnTheCanvas(page, 0, -100);
      },
    );

    test.skip('Select plus sign, copy and paste it onto the canvas', async ({
      // Consider refactoring of this test since it doesn't work
      // Selection of plus sign doesn't happen and the rest of the scrips works wrong
      page,
    }) => {
      await clickOnCanvas(page, point.x - 150, point.y - 10);
      await copyToClipboardByKeyboard(page);
      await pasteFromClipboardByKeyboard(page);

      await clickOnTheCanvas(page, 0, -100);
    });

    test('Select the whole reaction and move it, Undo, Erase tool', async ({
      page,
    }) => {
      await copyAndPaste(page);
      await clickOnCanvas(page, point.x - 100, point.y - 100);
      await takeEditorScreenshot(page);
      await pressUndoButton(page);
      await takeEditorScreenshot(page);
      await selectEraseTool(page);
      await page.mouse.move(point.x - 300, point.y - 100);
      await dragMouseTo(point.x - 140, point.y + 100, page);
    });
  });
  test.describe('Reaction Arrow - Manipulations with different Tools', () => {
    /**
     * Test case: EPMLSOPKET - 1792
     * Description: Reaction Arrow - Manipulations with different Tools
     */
    let point: Point;
    test.beforeEach(async ({ page }) => {
      await openFileAndAddToCanvas('Rxn-V2000/reaction-3.rxn', page);
      await selectAreaSelectionTool(page, SelectionToolType.Rectangle);
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    });

    test('Select the reaction arrow and move it', async ({ page }) => {
      await page.mouse.move(point.x + 60, point.y);
      await dragMouseTo(point.x + 60, point.y - 40, page);
    });

    test('Select the reaction arrow with any reaction component(s) and move them', async ({
      page,
    }) => {
      await page.mouse.move(point.x + 50, point.y - 300);
      await dragMouseTo(point.x + 400, point.y + 100, page);
      await page.mouse.move(point.x + 70, point.y);
      await dragMouseTo(point.x + 300, point.y - 100, page);
    });

    test('Select the whole reaction and move it', async ({ page }) => {
      await selectAllStructuresOnCanvas(page);
      await page.mouse.move(point.x - 20, point.y - 20);
      await dragMouseTo(point.x - 100, point.y - 100, page);
    });

    test('Select reaction arrow, cut and paste it onto the canvas', async ({
      page,
    }) => {
      await clickOnCanvas(page, point.x + 60, point.y);
      await cutToClipboardByKeyboard(page);
      await pasteFromClipboardByKeyboard(page);

      await clickOnTheCanvas(page, 0, -100);
    });

    test(
      'Select reaction arrow, copy and paste it onto the canvas',
      {
        tag: ['@FlakyTest'],
      },
      async ({ page }) => {
        await clickOnCanvas(page, point.x + 60, point.y);
        await copyToClipboardByKeyboard(page);
        await pasteFromClipboardByKeyboard(page, { delay: INPUT_DELAY });

        await clickOnTheCanvas(page, 0, -100);
      },
    );

    test('Select the whole reaction and move it, Undo, Erase tool', async ({
      page,
    }) => {
      await copyAndPaste(page);
      await clickOnCanvas(page, point.x - 100, point.y - 100);
      await takeEditorScreenshot(page);
      await pressUndoButton(page);
      await takeEditorScreenshot(page);
      await selectEraseTool(page);
      await page.mouse.move(point.x - 300, point.y - 100);
      await dragMouseTo(point.x - 140, point.y + 100, page);
    });
  });
  test.describe('Non-default Reaction Arrow Tool - Manipulations with different tool', () => {
    /**
     * Test case: EPMLSOPKET-2250
     *Description: Non-default Reaction Arrow Tool - Manipulations with different tools
     */
    let point: Point;
    test.beforeEach(async ({ page }) => {
      await configureInitialState(page);
    });

    async function configureInitialState(page: Page) {
      await openFileAndAddToCanvas(
        'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
        page,
      );
      await selectNestedTool(page, ArrowTool.ARROW_EQUILIBRIUM_FILLED_HALF_BOW);
      await clickOnTheCanvas(page, -40, 0);
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
      await selectAreaSelectionTool(page, SelectionToolType.Rectangle);
    }

    test('Select the reaction arrow and move it', async ({ page }) => {
      await page.mouse.move(point.x + OFFSET_FROM_ARROW, point.y);
      await dragMouseTo(point.x + OFFSET_FROM_ARROW, point.y - 40, page);
    });

    test('Select the reaction arrow with any reaction component(s) and move them', async ({
      page,
    }) => {
      await page.mouse.move(point.x - 40, point.y - 300);
      await dragMouseTo(point.x + 400, point.y + 100, page);
      await moveMouseToTheMiddleOfTheScreen(page);
      await dragMouseTo(point.x + 300, point.y - 100, page);
    });

    test('Select the whole reaction and move it', async ({ page }) => {
      await selectAllStructuresOnCanvas(page);
      await moveMouseToTheMiddleOfTheScreen(page);
      await dragMouseTo(point.x - 100, point.y - 100, page);
    });

    test('Select reaction arrow, cut and paste it onto the canvas', async ({
      page,
    }) => {
      await clickOnCanvas(page, point.x + OFFSET_FROM_ARROW, point.y);
      await cutToClipboardByKeyboard(page);
      await pasteFromClipboardByKeyboard(page, { delay: INPUT_DELAY });
      await clickOnTheCanvas(page, 0, -100);
    });

    test('Select a part of the reaction with the equilibrium arrow, cut and paste it onto canvas.', async ({
      page,
    }) => {
      await page.mouse.move(point.x - 40, point.y - 300);
      await dragMouseTo(point.x + 400, point.y + 100, page);

      await cutToClipboardByKeyboard(page);
      await pasteFromClipboardByKeyboard(page, { delay: INPUT_DELAY });

      await clickOnTheCanvas(page, 0, -100);
    });

    test('Select reaction arrow, copy and paste it onto the canvas', async ({
      page,
    }) => {
      await pageReloadMicro(page);
      await configureInitialState(page);

      await clickOnCanvas(page, point.x + OFFSET_FROM_ARROW, point.y);

      await copyToClipboardByKeyboard(page);
      await pasteFromClipboardByKeyboard(page, { delay: INPUT_DELAY });

      await clickOnTheCanvas(page, 0, -100);
      await screenshotBetweenUndoRedo(page);
    });

    test('Click the equilibrium arrow with the Erase tool, Undo, Erase for part of reaction, Undo/Redo', async ({
      page,
    }) => {
      await selectEraseTool(page);
      await clickOnTheCanvas(page, -OFFSET_FROM_ARROW, 0);
      await takeEditorScreenshot(page);
      await pressUndoButton(page);
      await takeEditorScreenshot(page);
      await selectEraseTool(page);
      await page.mouse.move(point.x - 40, point.y - 300);
      await dragMouseTo(point.x + 400, point.y + 100, page);
      await moveMouseToTheMiddleOfTheScreen(page);
      await dragMouseTo(point.x + 300, point.y - 100, page);
      await screenshotBetweenUndoRedo(page);
    });
  });

  test('Actions on the reaction with non-default reaction arrows', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-2881
     * Description: Actions on the reaction with non-default reaction arrows
     */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
      page,
    );
    await selectNestedTool(page, ArrowTool.ARROW_FAILED);
    const point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(point.x - 30, point.y);
    await dragMouseTo(point.x + 20, point.y + 50, page);
    await takeEditorScreenshot(page);
    await selectLayoutTool(page);
    await takeEditorScreenshot(page);
    await pressUndoButton(page);
    await selectCleanTool(page);
  });

  test('Save plus sign and arrow', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1793
     * Description: Save plus sign and arrow
     */

    await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectSaveTool(page);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await takeEditorScreenshot(page);
    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    const offsetFromCenter = -35;
    await clickOnTheCanvas(page, offsetFromCenter, 0);
    await selectSaveTool(page);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  });

  test.describe('Save multiple reaction arrows', () => {
    /**
     * Test case: EPMLSOPKET-2251
     * Description: Save/Open structure with non-default reaction in KET file
     */
    test('add default arrow and save in KET file', async ({ page }) => {
      await openFileAndAddToCanvas(
        'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
        page,
      );
      await selectNestedTool(page, ArrowTool.ARROW_OPEN_ANGLE);
      const offsetFromCenter = -35;
      await clickOnTheCanvas(page, offsetFromCenter, 0);
      await clickOnTheCanvas(page, offsetFromCenter, offsetFromCenter);
      await saveStructureWithReaction(page, 'Ket Format');
    });

    test('open file', async ({ page }) => {
      await openFileAndAddToCanvas(
        'KET/default-reaction-arrow-tool-saving.ket',
        page,
      );
    });
  });

  test.describe('Multiple Non-default Reaction Arrows - Saving', () => {
    /**
     * Test case: EPMLSOPKET-2252
     * Description: Save/Open structure with non-default reaction in KET file
     */
    test('add non default arrow and save in KET file', async ({ page }) => {
      await openFileAndAddToCanvas(
        'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
        page,
      );
      await selectNestedTool(page, ArrowTool.ARROW_EQUILIBRIUM_FILLED_HALF_BOW);
      const offsetFromCenter = -35;
      await clickOnTheCanvas(page, offsetFromCenter, 0);
      await clickOnTheCanvas(page, offsetFromCenter, offsetFromCenter);
      await saveStructureWithReaction(page, 'Ket Format');
    });

    test('open file', async ({ page }) => {
      await openFileAndAddToCanvas(
        'KET/non-default-reaction-arrow-tool-saving.ket',
        page,
      );
    });
  });

  test.describe('Non-default Reaction Arrow Tool - Saving', () => {
    /**
     * Test case: EPMLSOPKET-2867
     * Description: Save/Open structure with non-default reaction in RXN file
     */
    test('add non default arrow and save in RXN file', async ({ page }) => {
      await openFileAndAddToCanvas(
        'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
        page,
      );
      await selectNestedTool(page, ArrowTool.ARROW_EQUILIBRIUM_FILLED_HALF_BOW);
      await clickOnTheCanvas(page, xOffsetFromCenter, 0);
      await saveStructureWithReaction(page);
    });

    test('open file', async ({ page }) => {
      await openFileAndAddToCanvas(
        'Other-Files/non-default-reaction-arrow-tool-saving.rxn',
        page,
      );
    });
  });

  test.describe(' Save multiple reaction arrows - All formats', () => {
    /**
     * Test case: EPMLSOPKET-2275
     * Description:  Save multiple reaction arrows - All formats
     */
    for (const { name, fileExtension } of formatsForSave) {
      test(`save in ${fileExtension} file`, async ({ page }) => {
        await openFileAndAddToCanvas(
          'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
          page,
        );
        await selectNestedTool(page, ArrowTool.ARROW_OPEN_ANGLE);
        await clickOnTheCanvas(page, xOffsetFromCenter, 15);
        await clickOnTheCanvas(page, xOffsetFromCenter, -15);
        await saveStructureWithReaction(page, name);
      });

      test(`open ${fileExtension} file`, async ({ page }) => {
        await openFileAndAddToCanvas(
          `Other-Files/default-reaction-arrow-tool-saving.${fileExtension}`,
          page,
        );
      });
    }
  });

  test.describe(' Save non-default reaction arrows - All formats', () => {
    /**
     * Test case: EPMLSOPKET-2868
     * Description:  Save non-default reaction arrows - All formats
     */
    for (const { name, fileExtension } of formatsForSave) {
      test(`save in ${fileExtension} file`, async ({ page }) => {
        await openFileAndAddToCanvas(
          'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
          page,
        );
        await selectNestedTool(page, ArrowTool.ARROW_EQUILIBRIUM_OPEN_ANGLE);
        await clickOnTheCanvas(page, xOffsetFromCenter, 0);
        await saveStructureWithReaction(page, name);
      });

      test(`open ${fileExtension} file`, async ({ page }) => {
        await openFileAndAddToCanvas(
          `Other-Files/non-default-reaction-arrow-tool-saving.${fileExtension}`,
          page,
        );
      });
    }
  });

  test.describe('Resizing reaction arrow - Saving', () => {
    /**
     *  Test case: EPMLSOPKET-2869
     * Description: Resizing reaction arrow - Saving
     */
    test('Resize and save', async ({ page }) => {
      await openFileAndAddToCanvas(
        'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
        page,
      );
      await selectNestedTool(page, ArrowTool.ARROW_FILLED_BOW);
      await clickOnTheCanvas(page, xOffsetFromCenter, 0);
      const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
      await page.mouse.move(x - 35, y - 1);
      await dragMouseTo(x - 25, y - 50, page);
      await saveStructureWithReaction(page);
      await saveStructureWithReaction(page, 'Ket Format');
    });

    test('open files', async ({ page }) => {
      /*
       */
      await openFileAndAddToCanvas(
        `Rxn-V2000/resizing-reaction-arrow-saving.rxn`,
        page,
      );
      await takeEditorScreenshot(page);
      await selectClearCanvasTool(page);
      await openFileAndAddToCanvas(
        `KET/resizing-reaction-arrow-saving.ket`,
        page,
      );
    });
  });

  test('Check that pressing Clear Canvas with Reaction Arrow under mouse cursor does not cause errors in DevTool console', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-12971
     * Description:  Check that pressing Clear Canvas with Reaction Arrow under mouse cursor doesn't cause errors in DevTool console
     */
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await selectNestedTool(page, ArrowTool.ARROW_EQUILIBRIUM_OPEN_ANGLE);
    await clickInTheMiddleOfTheScreen(page);

    await selectAreaSelectionTool(page, SelectionToolType.Rectangle);
    await clickInTheMiddleOfTheScreen(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page, { delay: INPUT_DELAY });

    await selectClearCanvasTool(page);
  });

  test.describe('Arrow snapping', () => {
    let point: Point;
    test.beforeEach(async ({ page }) => {
      await selectNestedTool(page, ArrowTool.ARROW_FILLED_TRIANGLE);
      await moveMouseToTheMiddleOfTheScreen(page);
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    });

    test('to Horizontal Position with Angle greater than 15 Degrees', async ({
      page,
    }) => {
      /**
       * Test case: Test case: EPMLSOPKET-15546
       * Description: Arrow Snapping to Horizontal Position with Angle greater than 15 Degrees
       */
      await page.mouse.down();
      await page.mouse.move(point.x + 100, point.y - 50);
    });

    test('to Vertical Position greater than 15 Degrees', async ({ page }) => {
      /**
       * Test case: Test case: EPMLSOPKET-15548
       * Description: Arrow Snapping to Vertical Position with Angle ≤ 15 Degrees
       */
      await page.mouse.down();
      await page.mouse.move(point.x + 100, point.y - 50);
    });

    test('to Horizontal Position with Angle ≤ 15 Degrees', async ({ page }) => {
      /**
       * Test case: Test case: EPMLSOPKET-15548
       * Description: Arrow Snapping to Horizontal Position with Angle ≤ 15 Degrees
       */
      await page.mouse.down();
      await page.mouse.move(point.x + 100, point.y - 20);
      await takeEditorScreenshot(page);
      await page.mouse.up();
    });

    test('to Vertical Position with Angle ≤ 15 Degrees', async ({ page }) => {
      /**
       * Test case: Test case: EPMLSOPKET-15549
       * Description: Arrow Snapping to Vertical Position with Angle ≤ 15 Degrees
       */
      await page.mouse.down();
      await page.mouse.move(point.x + 20, point.y - 100);
      await takeEditorScreenshot(page);
      await page.mouse.up();
    });

    test('to Horizontal Position with Ctrl Key Pressed', async ({ page }) => {
      /**
       * Test case: Test case: EPMLSOPKET-15550
       * Description: Arrow Snapping to Horizontal Position with Ctrl Key Pressed
       */
      const x = point.x + 100;
      const modifier = getControlModifier();
      await page.keyboard.down(modifier);
      await page.mouse.down();

      await page.mouse.move(x, point.y - 50);
      await takeEditorScreenshot(page);
      await page.mouse.move(x, point.y - 20);
      await takeEditorScreenshot(page);
      await page.mouse.move(x, point.y);
      await takeEditorScreenshot(page);
      await page.mouse.up();
    });

    test('to Vertical Position with Ctrl Key Pressed', async ({ page }) => {
      /**
       * Test case: Test case: EPMLSOPKET-15551
       * Description: Arrow Snapping to Vertical Position with Ctrl Key Pressed
       */
      const y = point.y - 100;
      const modifier = getControlModifier();
      await page.keyboard.down(modifier);
      await page.mouse.down();

      await page.mouse.move(point.x + 50, y);
      await takeEditorScreenshot(page);
      await page.mouse.move(point.x + 20, y);
      await takeEditorScreenshot(page);
      await page.mouse.move(point.x, y);
      await takeEditorScreenshot(page);
      await page.mouse.up();
    });
  });

  for (const [_, id] of Object.values(ArrowTool)) {
    test(`${id} should have correct naming`, async ({ page }) => {
      /**
       * Test case: Test case: EPMLSOPKET - 16947
       * Description:  All Arrows should have correct tooltip
       */
      await openDropdown(page, 'reaction-arrow-open-angle');
      const button = page.locator(
        `.default-multitool-dropdown [data-testid="${id}"]`,
      );
      await expect(button).toHaveAttribute('title', idToTitle[id]);
      await button.click();
      await clickInTheMiddleOfTheScreen(page);
    });
  }

  test('Resizing retrosynthetic arrow', async ({ page }) => {
    /**
     * Test case: #4985
     * Description: Retrosynthetic Arrow is resized correctly
     */
    await selectNestedTool(page, ArrowTool.ARROW_RETROSYNTHETIC);
    await clickOnTheCanvas(page, xOffsetFromCenter, 0);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + 200, y + 200, page);
  });

  test('Copy/paste retrosynthetic arrow', async ({ page }) => {
    /**
    Test case: #4985
    Description: Retrosynthetic Arrow Copy/paste
     */
    await selectNestedTool(page, ArrowTool.ARROW_RETROSYNTHETIC);
    await clickInTheMiddleOfTheScreen(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await screenshotBetweenUndoRedo(page);
  });

  test('Cut/paste retrosynthetic arrow', async ({ page }) => {
    /**
    Test case: #4985
    Description: Retrosynthetic Arrow Cut/paste
     */
    await selectNestedTool(page, ArrowTool.ARROW_RETROSYNTHETIC);
    await clickInTheMiddleOfTheScreen(page);
    await cutAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await screenshotBetweenUndoRedo(page);
  });
});
