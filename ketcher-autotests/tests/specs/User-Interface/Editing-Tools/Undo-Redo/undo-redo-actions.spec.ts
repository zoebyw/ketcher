/* eslint-disable no-magic-numbers */
import { Page, expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectRing,
  RingButton,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  pressButton,
  selectLeftPanelButton,
  LeftPanelButton,
  selectAtomInToolbar,
  AtomButton,
  doubleClickOnAtom,
  doubleClickOnBond,
  BondType,
  moveOnAtom,
  dragMouseTo,
  screenshotBetweenUndoRedo,
  openFileAndAddToCanvas,
  selectNestedTool,
  ReactionMappingTool,
  fillFieldByPlaceholder,
  getCoordinatesTopAtomOfBenzeneRing,
  selectRingButton,
  RgroupTool,
  AttachmentPoint,
  copyAndPaste,
  cutAndPaste,
  waitForPageInit,
  waitForRender,
  openSettings,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  selectAllStructuresOnCanvas,
  clickOnCanvas,
  selectUndoByKeyboard,
  selectRedoByKeyboard,
  ZoomInByKeyboard,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import {
  pressRedoButton,
  pressUndoButton,
} from '@tests/pages/common/TopLeftToolbar';
import {
  bondSelectionTool,
  selectAreaSelectionTool,
  selectEraseTool,
} from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';

const CANVAS_CLICK_X = 300;
const CANVAS_CLICK_Y = 300;

async function selectBondProperties(
  page: Page,
  bondType: string,
  bondTopology: string,
  bondReactingCenter: string,
  finalizationButton: string,
) {
  await page.getByTestId('type-input-span').click();
  await page.getByRole('option', { name: bondType, exact: true }).click();
  await page.getByTestId('topology-input-span').click();
  await page.getByRole('option', { name: bondTopology }).click();
  await page.getByTestId('reacting-center-input-span').click();
  await page
    .getByRole('option', { name: bondReactingCenter, exact: true })
    .click();
  await pressButton(page, finalizationButton);
}

async function selectSruPolymer(
  page: Page,
  text: string,
  dataName: string,
  polymerLabel: string,
  repeatPattern: string,
) {
  await page.locator('span').filter({ hasText: text }).click();
  await page.getByRole('option', { name: dataName }).click();
  await page.getByLabel('Polymer label').fill(polymerLabel);
  await page
    .locator('label')
    .filter({ hasText: 'Repeat Pattern' })
    .locator('span')
    .nth(1)
    .click();
  await page.getByRole('option', { name: repeatPattern }).click();
  await pressButton(page, 'Apply');
}

async function selectMultipleGroup(
  page: Page,
  text: string,
  dataName: string,
  valueRepeatCount: string,
) {
  await page.locator('span').filter({ hasText: text }).click();
  await page.getByRole('option', { name: dataName }).click();
  await page.getByLabel('Repeat count').fill(valueRepeatCount);
  await pressButton(page, 'Apply');
}

async function addNameToSuperatom(
  page: Page,
  fieldLabel: string,
  superatomName: string,
) {
  await page.locator('span').filter({ hasText: 'Data' }).click();
  await page.getByRole('option', { name: 'Superatom' }).click();
  await page.getByLabel(fieldLabel).fill(superatomName);
  await pressButton(page, 'Apply');
}

async function fillAliasForAtom(page: Page, alias: string, button: string) {
  await page.getByLabel('Alias').fill(alias);
  await pressButton(page, button);
}

test.describe('Undo/Redo Actions', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Undo/Redo Erase template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1732
    Description: Undo/Redo actions work correctly:
    for the Undo action the deleted object is restored.
    after Redo it is deleted again.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectEraseTool(page);

    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Atom template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1740
    Description: Undo/Redo actions work correctly:
    Undo: heteroatom is removed;
    Redo: heteroatom is restored.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectAtomInToolbar(AtomButton.Chlorine, page);

    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Atom Properties template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1741
    Description: Undo/Redo actions work correctly:
    Undo: the property mark is removed.
    Redo: the property mark is restored.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectAreaSelectionTool(page, SelectionToolType.Rectangle);

    await doubleClickOnAtom(page, 'C', 0);
    await fillAliasForAtom(page, '!@#$%123AbCd', 'Apply');

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Bond Properties template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1742
    Description: Undo/Redo actions work correctly:
    Undo: the property mark is removed.
    Redo: the property mark is restored.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectAreaSelectionTool(page, SelectionToolType.Rectangle);

    await doubleClickOnBond(page, BondType.SINGLE, 0);
    await selectBondProperties(page, 'Double', 'Ring', 'Center', 'Apply');

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Single Bond template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1743
    Description: Undo/Redo action should work correctly:
    Undo: the Single bond is removed;
    Redo: the Single bond is restored.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await bondSelectionTool(page, MicroBondType.Single);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Double Bond template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1744
    Description: Undo/Redo action should work correctly:
    Undo: the Double bond is removed;
    Redo: the Double bond is restored.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await bondSelectionTool(page, MicroBondType.Double);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Triple Bond template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1750
    Description: Undo/Redo action should work correctly:
    Undo: the Triple bond is removed;
    Redo: the Triple bond is restored.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await bondSelectionTool(page, MicroBondType.Triple);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Chain template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1751
    Description: Undo/Redo action should work correctly:
    Undo: the Chain is removed;
    Redo: the Chain is restored.
    */
    const x = 300;
    const y = 300;
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.Chain, page);
    await moveOnAtom(page, 'C', 0);
    await dragMouseTo(x, y, page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Single Up stereobond template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1752
    Description: Undo/Redo action should work correctly:
    Undo: the Single Up stereobond is removed;
    Redo: the Single Up stereobond is restored.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await bondSelectionTool(page, MicroBondType.SingleUp);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Single Down stereobond template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1752
    Description: Undo/Redo action should work correctly:
    Undo: the Single Down stereobond is removed;
    Redo: the Single Down stereobond is restored.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await bondSelectionTool(page, MicroBondType.SingleDown);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Single Up/Down stereobond template action', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1752
    Description: Undo/Redo action should work correctly:
    Undo: the Single Up/Down stereobond is removed;
    Redo: the Single Up/Down stereobond is restored.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await bondSelectionTool(page, MicroBondType.SingleUpDown);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Double Cis/Trans stereobond template action', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1752
    Description: Undo/Redo action should work correctly:
    Undo: the Double Cis/Trans stereobond is removed;
    Redo: the Double Cis/Trans stereobond is restored.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await bondSelectionTool(page, MicroBondType.DoubleCisTrans);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Any Query Bond template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1753
    Description: Undo/Redo action should work correctly:
    Undo: the Any Query Bond is removed;
    Redo: the Any Query Bond is restored.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await bondSelectionTool(page, MicroBondType.Any);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Aromatic Query Bond template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1753
    Description: Undo/Redo action should work correctly:
    Undo: the Aromatic Query Bond is removed;
    Redo: the Aromatic Query Bond is restored.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await bondSelectionTool(page, MicroBondType.Aromatic);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Single/Double Query Bond template action', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1753
    Description: Undo/Redo action should work correctly:
    Undo: the Single/Double Query Bond is removed;
    Redo: the Single/Double Query Bond is restored.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await bondSelectionTool(page, MicroBondType.SingleDouble);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Single/Aromatic Query Bond template action', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1753
    Description: Undo/Redo action should work correctly:
    Undo: the Single/Aromatic Query Bond is removed;
    Redo: the Single/Aromatic Query Bond is restored.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await bondSelectionTool(page, MicroBondType.SingleAromatic);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Double/Aromatic Query Bond template action', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1753
    Description: Undo/Redo action should work correctly:
    Undo: the Double/Aromatic Query Bond is removed;
    Redo: the Double/Aromatic Query Bond is restored.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await bondSelectionTool(page, MicroBondType.DoubleAromatic);
    await clickOnAtom(page, 'C', 0);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Mapping tool template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1754
    Description: Undo/Redo action should work correctly:
    Undo: the Mapping tool is removed;
    Redo: the Mapping tool is restored.
    */
    await openFileAndAddToCanvas('KET/reaction-chain.ket', page);
    await selectNestedTool(page, ReactionMappingTool.AUTOMAP);
    await waitForRender(page, async () => {
      await pressButton(page, 'Apply');
    });
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Data S-Group tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1755
    Description: Undo/Redo action should work correctly:
    Undo: the Data S-group is removed;
    Redo: the Data S-group is restored;
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectAllStructuresOnCanvas(page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await fillFieldByPlaceholder(page, 'Enter name', 'Test');
    await fillFieldByPlaceholder(page, 'Enter value', '33');
    await pressButton(page, 'Apply');
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Multiple Group tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1755
    Description: Undo/Redo action should work correctly:
    Undo: the Multiple Group is removed;
    Redo: the Multiple Group is restored;
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectAllStructuresOnCanvas(page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await selectMultipleGroup(page, 'Data', 'Multiple group', '88');
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo SRU Polymer tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1755
    Description: Undo/Redo action should work correctly:
    Undo: the SRU Polymer is removed;
    Redo: the SRU Polymer is restored;
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectAllStructuresOnCanvas(page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await selectSruPolymer(page, 'Data', 'SRU Polymer', 'A', 'Head-to-tail');
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Superatom tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1755
    Description: Undo/Redo action should work correctly:
    Undo: the Superatom is removed;
    Redo: the Superatom is restored;
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectAllStructuresOnCanvas(page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await addNameToSuperatom(page, 'Name', 'Test@!#$%12345');
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo R-Group Label tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1756
    Description: Undo/Redo action should work correctly:
    Undo: the R-Group Label tool is removed;
    Redo: the R-Group Label tool is restored;
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    // need fix getCoordinatesTopAtomOfBenzeneRing after change canvas design
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo R-Group Fragment tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1756
    Description: Undo/Redo action should work correctly:
    Undo: the R-Group Fragment tool is removed;
    Redo: the R-Group Fragment tool is restored;
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectNestedTool(page, RgroupTool.R_GROUP_FRAGMENT);
    // need fix getCoordinatesTopAtomOfBenzeneRing after change canvas design
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await pressButton(page, 'R8');
    await pressButton(page, 'Apply');
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Attachment Point tool', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1756
    Description: Undo/Redo action should work correctly:
    Undo: the Attachment Point tool is removed;
    Redo: the Attachment Point tool is restored;
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', 3);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await pressButton(page, 'Apply');
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Multiple Undo/Redo', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1757
    Description: Undo/Redo action should work correctly
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', 2);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await pressButton(page, 'Apply');

    await clickOnAtom(page, 'C', 3);
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await pressButton(page, 'Apply');

    await clickOnAtom(page, 'C', 4);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await pressButton(page, 'Apply');

    for (let i = 0; i < 2; i++) {
      await pressUndoButton(page);
    }
    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await pressRedoButton(page);
    }
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Copy/Paste', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1758
    Description: Undo/Redo action should work correctly
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', 3);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await pressButton(page, 'Apply');
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Cut/Paste', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1758
    Description: Undo/Redo action should work correctly
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', 3);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await pressButton(page, 'Apply');
    await cutAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Hotkeys', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1759
    Description: Undo/Redo hotkeys action should work correctly
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', 3);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await pressButton(page, 'Apply');
    for (let i = 0; i < 2; i++) {
      await selectUndoByKeyboard(page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectRedoByKeyboard(page);
    }
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo Zoom In/Zoom Out', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1760
    Description: Undo/Redo hotkeys action should work correctly
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', 3);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await pressButton(page, 'Apply');
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Control+_');
    }
    for (let i = 0; i < 2; i++) {
      await selectUndoByKeyboard(page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectRedoByKeyboard(page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 5; i++) {
      await ZoomInByKeyboard(page);
    }
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo S-Group , Structure, Chain', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2960
    Description: Undo/Redo action should work correctly
    */
    const yDelta = 300;
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectAllStructuresOnCanvas(page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await fillFieldByPlaceholder(page, 'Enter name', 'Test');
    await fillFieldByPlaceholder(page, 'Enter value', '33');
    await pressButton(page, 'Apply');
    await selectLeftPanelButton(LeftPanelButton.Chain, page);
    const point = await getAtomByIndex(page, { label: 'C' }, 2);
    await clickOnCanvas(page, point.x, point.y);
    const coordinatesWithShift = point.y + yDelta;
    await dragMouseTo(point.x, coordinatesWithShift, page);
    for (let i = 0; i < 2; i++) {
      await pressUndoButton(page);
    }
    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await pressRedoButton(page);
    }
    await takeEditorScreenshot(page);
  });
});

test.describe('Undo/Redo Actions', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Undo/Redo paste template action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1731
    Description: Undo/Redo actions work correctly:
    for Undo action the template is removed from the canvas,
    for Redo action the template is appeared on the canvas again.
    After one action is performed on the canvas and then the Undo button is pressed, the Redo button 
    becomes enabled and the Undo button becomes disabled.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await pressUndoButton(page);
    await expect(page).toHaveScreenshot();
    await pressRedoButton(page);
    await expect(page).toHaveScreenshot();
  });

  test('When mouse hovering - hotkey CTRL+Z is working', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-11847
    Description:
    Draw 'Benzene'
    Draw any bonds on Benzene atoms
    Hover mouse cursor over of 'Benzene' and press CTRL+Z (Undo)
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await bondSelectionTool(page, MicroBondType.Single);
    await clickOnAtom(page, 'C', 2);
    await page.getByTestId('canvas').hover();
    await takeEditorScreenshot(page);
    await selectUndoByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Undo deletes previously placed template', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-16939
    Description:
    Open Ketcher settings.In the dropdown list for "reset to Select tool" choose "Off"
    Place a Benzene ring on the canvas.
    Use select tool to choose and CTRL+C placed ring.
    Press CTRL+V and place the ring. Press CTRL+Z.
    */
    await openSettings(page);
    await page.getByTestId('reset-to-select-input-span').click();
    await page.getByRole('option', { name: 'off' }).click();
    await takeEditorScreenshot(page);
    await page.getByTestId('OK').click();
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await selectUndoByKeyboard(page);
    await selectUndoByKeyboard(page);
  });
});
