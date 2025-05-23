import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
  pasteFromClipboardAndAddToCanvas,
  FILE_TEST_DATA,
  clickInTheMiddleOfTheScreen,
} from '@utils';
import { clickOnFileFormatDropdown } from '@utils/formats';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { selectSaveTool } from '@tests/pages/common/TopLeftToolbar';

async function saveFileAsCdxFormat(page: Page) {
  await selectSaveTool(page);
  await clickOnFileFormatDropdown(page);
  await page.getByRole('option', { name: 'CDX', exact: true }).click();
}

test.describe('Reagents CDX format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('File saves in "CDX" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4709
    Description: File saved in format (e.g. "ketcher.cdx")
    */

    // The reason of test failing will be investigated after release 2.21.0-rc.1
    test.fail();
    await openFileAndAddToCanvas('KET/two-reagents-above-and-below.ket', page);

    await verifyFileExport(
      page,
      'CDX/two-reagents-above-and-below-expected.cdx',
      FileType.CDX,
    );
  });

  test('Open file in "CDX" format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4711
    Description: File open in CDX format.
    */
    await openFileAndAddToCanvas('CDX/two-reagents.cdx', page);
    await takeEditorScreenshot(page);
  });

  test('Paste from clipboard in "CDX" format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4710
      Description: Reagents 'NH3' displays above reaction arrow and HCl below.
      */
    await pasteFromClipboardAndAddToCanvas(
      page,
      FILE_TEST_DATA.reagentsBelowAndAboveArrowCdx,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Detection molecule as reagent and write reagent information in CDX format in "Preview" tab', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4707, EPMLSOPKET-4708
    Description: 'Can not display binary content' in Preview window.
    */
    await openFileAndAddToCanvas('CDX/two-reagents.cdx', page);
    await saveFileAsCdxFormat(page);
    await takeEditorScreenshot(page);
  });
});
