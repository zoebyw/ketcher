import { Chem } from '@constants/monomers/Chem';
import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvasMacro,
  pressButton,
  selectMonomer,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@tests/pages/common/TopLeftToolbar';
import { hideMonomerPreview } from '@utils/macromolecules';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { bondSelectionTool } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';

/* 
Test case: #2497 - Add chem to canvas
*/

test('Select chem and drag it to canvas', async ({ page }) => {
  await waitForPageInit(page);

  // Click on POLYMER_TOGGLER
  await turnOnMacromoleculesEditor(page);
  await selectMonomer(page, Chem.sDBL);
  // Click on <svg> #polymer-editor-canvas
  await clickInTheMiddleOfTheScreen(page);
  await hideMonomerPreview(page);

  await takeEditorScreenshot(page);
});

test.describe('Actions with CHEM', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Check that CHEM name fits in its icon when placed on canvas', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures
    Description: CHEM name fits in its icon when placed on canvas.
    */
    await openFileAndAddToCanvasMacro('KET/all-chems.ket', page);
    await bondSelectionTool(page, MacroBondType.Single);
    await takeEditorScreenshot(page);
  });

  test('Check that APs are not redrawn incorrectly after opening the modal window', async ({
    page,
  }) => {
    /* 
    Test case: Actions with structures https://github.com/epam/ketcher/issues/3585
    https://github.com/epam/ketcher/issues/3582
    Description: APs are not redrawn incorrectly after opening the modal window.
    */
    await openFileAndAddToCanvasMacro('KET/chems-not-connected.ket', page);
    await bondSelectionTool(page, MacroBondType.Single);
    await getMonomerLocator(page, Chem.Test_6_Ch).hover();
    await page.mouse.down();
    await getMonomerLocator(page, Chem.A6OH).hover();
    await page.mouse.up();
    await takeEditorScreenshot(page);
    await pressButton(page, 'Cancel');
    await takeEditorScreenshot(page);
  });
});
