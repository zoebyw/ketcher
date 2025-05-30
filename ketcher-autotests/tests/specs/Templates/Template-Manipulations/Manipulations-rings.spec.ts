/* eslint-disable no-magic-numbers */
import { test, Page, expect } from '@playwright/test';
import { BondType } from '@utils/canvas/types';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { selectButtonByTitle } from '@utils/clicks/selectButtonByTitle';
import {
  getBondByIndex,
  getLeftBondByAttributes,
  getRightBondByAttributes,
} from '@utils/canvas/bonds';
import {
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  dragMouseTo,
  moveMouseAway,
  RingButton,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import {
  pressRedoButton,
  pressUndoButton,
  selectClearCanvasTool,
} from '@tests/pages/common/TopLeftToolbar';
import { selectAreaSelectionTool } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';

async function checkTooltip(type: RingButton, page: Page) {
  const templateButton = page.getByRole('button', { name: type });
  await expect(templateButton).toHaveAttribute('title', `${type} (T)`);
}

async function placeTwoRingsMergedByAtom(type: RingButton, page: Page) {
  await selectButtonByTitle(type, page);
  await clickInTheMiddleOfTheScreen(page);
  await moveMouseAway(page);

  // Attaching Second Ring By Atom
  await selectButtonByTitle(type, page);
  const point = await getAtomByIndex(page, { label: 'C' }, 2);
  await clickOnCanvas(page, point.x, point.y);
}

async function mergeRingByBond(type: RingButton, page: Page) {
  await selectButtonByTitle(type, page);
  const point = await getBondByIndex(page, { type: BondType.SINGLE }, 5);
  await clickOnCanvas(page, point.x, point.y);
}

async function mergeDistantRingByABond(type: RingButton, page: Page) {
  await selectButtonByTitle(type, page);
  let point = await getAtomByIndex(page, { label: 'C' }, 2);
  const selectionRange = point.x / 4;
  await clickOnCanvas(
    page,
    selectionRange + selectionRange,
    selectionRange + selectionRange,
  );
  point = await getLeftBondByAttributes(page, { reactingCenterStatus: 0 });
  await selectAreaSelectionTool(page, SelectionToolType.Rectangle);
  await clickOnCanvas(page, point.x + selectionRange, point.y + selectionRange);
  await dragMouseTo(point.x - selectionRange, point.y - selectionRange, page);

  await page.mouse.move(point.x - 1, point.y - 1);
  point = await getRightBondByAttributes(page, { reactingCenterStatus: 0 });
  await dragMouseTo(point.x, point.y, page);
}

async function deleteRightBondInRing(page: Page) {
  const point = await getRightBondByAttributes(page, {
    reactingCenterStatus: 0,
  });
  await moveMouseAway(page);
  await page.keyboard.press('Escape');
  await clickOnCanvas(page, point.x, point.y);
  await page.keyboard.press('Delete');
}

async function checkHistoryForBondDeletion(page: Page) {
  await pressUndoButton(page);
  await pressUndoButton(page);
  await pressRedoButton(page);
  await pressUndoButton(page);
  await pressRedoButton(page);
  await pressRedoButton(page);
  await pressUndoButton(page);
}

async function manipulateRingsByName(type: RingButton, page: Page) {
  await checkTooltip(type, page);
  await placeTwoRingsMergedByAtom(type, page);
  await moveMouseAway(page);
  await takeEditorScreenshot(page);
  await selectClearCanvasTool(page);

  await placeTwoRingsMergedByAtom(type, page);
  await mergeRingByBond(type, page);
  await mergeDistantRingByABond(type, page);
  await moveMouseAway(page);
  await takeEditorScreenshot(page);
  await selectClearCanvasTool(page);

  await selectButtonByTitle(type, page);
  await clickInTheMiddleOfTheScreen(page);
  await deleteRightBondInRing(page);
  await moveMouseAway(page);
  await takeEditorScreenshot(page);

  await checkHistoryForBondDeletion(page);
}

test.describe('Templates - Rings manipulations', () => {
  // EPMLSOPKET: connecting different rings to rings, applying changes to a single ring, history check

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const templates = Object.values(RingButton);

  for (const template of templates) {
    test(template, async ({ page }) => {
      // EPLMSOPCKET-1668, EPLMSOPCKET-1675, EPLMSOPCKET-1677, EPLMSOPCKET-1679, EPLMSOPCKET-1680, EPLMSOPCKET-1681
      // EPLMSOPCKET-1682, EPLMSOPCKET-1683
      await manipulateRingsByName(template, page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    });
  }
});
