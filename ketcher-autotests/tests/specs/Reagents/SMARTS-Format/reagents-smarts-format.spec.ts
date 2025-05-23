import { Page, test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  pressButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  pasteFromClipboard,
  waitForLoad,
  waitForPageInit,
  moveMouseAway,
} from '@utils';
import {
  selectOpenFileTool,
  selectSaveTool,
} from '@tests/pages/common/TopLeftToolbar';
import {
  verifyFileExport,
  FileType,
} from '@utils/files/receiveFileComparisonData';
import { clickOnFileFormatDropdown } from '@utils/formats';

async function saveSmarts(page: Page) {
  await selectSaveTool(page);
  await clickOnFileFormatDropdown(page);
  await page.getByRole('option', { name: 'Daylight SMARTS' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}

async function previewSmarts(page: Page) {
  await selectSaveTool(page);
  await clickOnFileFormatDropdown(page);
  await page.getByRole('option', { name: 'Daylight SMARTS' }).click();
}

test.describe('Reagents SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test(`Detection molecule as reagent
  and write reagent information in "Daylight SMARTS" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4681
    Description: System detect molecule as reagent and write reagent in "Daylight SMARTS'
    format in "Preview" tab (e.g. [#6]-1=[#6]-[#6]=[#6]-[#6]=[#6]-1>[#7]>[#6]-1=[#6]-[#6]=[#6]-[#6]=[#6]-1)
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );

    await verifyFileExport(
      page,
      'SMARTS/expected-smarts-file.smarts',
      FileType.SMARTS,
    );

    await previewSmarts(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test(`Detection molecule below arrow as reagent
  and write reagent information in "Daylight SMARTS" format in "Preview" tab`, async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4681
    Description: System detect molecule as reagent and write reagent in "Daylight SMARTS'
    format in "Preview" tab (e.g.
      [#6]1(-[#6])-[#6](-[#8])=[#6]-[#6](-[#16])=[#6](-[#7])-[#6]=1>[#17]>[#6]1(-[#35])-[#6](-[#6])=[#6]-[#6](-[#53])=[#6](-[#8])-[#6]=1
    )
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );

    await verifyFileExport(
      page,
      'SMARTS/expected-smarts-below.smarts',
      FileType.SMARTS,
    );

    await previewSmarts(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Paste from clipboard in "Daylight SMARTS" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4687
    Description: Reagent 'Cl' displays above reaction arrow
    */
    await selectOpenFileTool(page);
    await page.getByText('Paste from clipboard').click();
    await pasteFromClipboard(
      page,
      '[#6]-[#6]1-[#6](-[#8])=[#6]-[#6](-[#16])=[#6](-[#7])-[#6]=1>[#17]>[#6]-[#6]1-[#6](-,:[#35])=[#6]-[#6](-[#8])=[#6](-,:[#53])-[#6]=1',
    );
    await waitForLoad(page, async () => {
      await pressButton(page, 'Add to Canvas');
    });
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Open from file in "Daylight SMARTS" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4689
    Description: Reagent 'Cl' below the reaction arrow
    */
    await openFileAndAddToCanvas('SMARTS/expected-smarts-below.smarts', page);
    await takeEditorScreenshot(page);
  });

  test('Structure is opened with Not List atoms saved in "Daylight SMARTS" format', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4706
    Description: Chain is opened with Not List atoms ![Zr,Au,Zn]
    */
    await openFileAndAddToCanvas('SMARTS/not-list-atoms-smarts.smarts', page);
    await takeEditorScreenshot(page);
  });
});

test.describe('Reagents SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('File saves in "Daylight SMARTS" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4685
    Description: File saved in format (e.g. "ketcher.smarts")
    */
    await openFileAndAddToCanvas(
      'KET/benzene-arrow-benzene-reagent-nh3.ket',
      page,
    );

    await verifyFileExport(
      page,
      'SMARTS/expected-smarts-file.smarts',
      FileType.SMARTS,
    );

    await saveSmarts(page);
  });
});
