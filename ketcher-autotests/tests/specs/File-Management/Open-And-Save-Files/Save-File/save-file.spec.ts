/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@playwright/test';
import {
  AtomButton,
  FILE_TEST_DATA,
  RingButton,
  clickInTheMiddleOfTheScreen,
  drawBenzeneRing,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  openPasteFromClipboard,
  pasteFromClipboardAndAddToCanvas,
  pressButton,
  receiveFileComparisonData,
  saveToFile,
  selectAtomInToolbar,
  selectOptionByText,
  selectRingButton,
  takeEditorScreenshot,
  waitForIndigoToLoad,
  waitForPageInit,
  waitForRender,
} from '@utils';
import { drawReactionWithTwoBenzeneRings } from '@utils/canvas/drawStructures';
import {
  clickOnFileFormatDropdown,
  getMolfile,
  getSmiles,
} from '@utils/formats';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { selectSaveTool } from '@tests/pages/common/TopLeftToolbar';

const RING_OFFSET = 150;
const ARROW_OFFSET = 20;
const ARROW_LENGTH = 100;

async function getPreviewForSmiles(page: Page, smileType: string) {
  await selectSaveTool(page);
  await clickOnFileFormatDropdown(page);
  await page.getByRole('option', { name: smileType }).click();
}

test.describe('Save files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Save file - Save *.rxn file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1849
     * Description: Reaction is saved correctly in .rxn file
     */

    await drawReactionWithTwoBenzeneRings(
      page,
      RING_OFFSET,
      ARROW_OFFSET,
      ARROW_LENGTH,
    );

    await verifyFileExport(
      page,
      'Rxn-V2000/rxn-1849-to-compare-expectedV2000.rxn',
      FileType.RXN,
      'v2000',
    );
  });

  test('Save file - Save *.mol file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1848
     * Description: Structure (benzine ring) is saved correctly to .mol format
     */

    await drawBenzeneRing(page);
    await verifyFileExport(
      page,
      'Molfiles-V2000/mol-1848-to-compare-expectedV2000.mol',
      FileType.MOL,
      'v2000',
    );
  });

  test('Save file - Save *.ket file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2934
     * Description: Sctuctures are saved correctly in .ket file
     */

    await drawReactionWithTwoBenzeneRings(
      page,
      RING_OFFSET,
      ARROW_OFFSET,
      ARROW_LENGTH,
    );

    await verifyFileExport(
      page,
      'KET/ket-2934-to-compare-expected.ket',
      FileType.KET,
    );
  });

  test('Click and Save as *.smi file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1851
    Description: Click the 'Save As' button, save as Smiles file ('Daylight SMILES' format).
    */
    await openFileAndAddToCanvas('KET/two-benzene-connected.ket', page);
    const expectedFile = await getSmiles(page);
    await saveToFile('KET/two-benzene-connected-expected.smi', expectedFile);
    const { fileExpected: smiFileExpected, file: smiFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/two-benzene-connected-expected.smi',
      });
    expect(smiFile).toEqual(smiFileExpected);
  });

  test('Save as a .rxn file if reaction consists of two or more reaction arrows', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4729
    Description: Structure reaction consists of two or more reaction arrows saved as .rxn file
    */
    await openFileAndAddToCanvas('KET/two-arrows-and-plus.ket', page);
    await verifyFileExport(
      page,
      'Rxn-V2000/two-arrows-and-plus-expected.rxn',
      FileType.RXN,
      'v2000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V2000/two-arrows-and-plus-expected.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Automatic selection of MDL Molfile v3000 encoding is work if the number of atoms (or bonds) exceeds 999', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-5260
     * Description: Structure is saved according to automated selected format MDL Molfile v3000
     */

    await openFileAndAddToCanvas(
      'Molfiles-V3000/structure-where-atoms-exceeds999.mol',
      page,
    );
    const expectedFile = await getMolfile(page);
    await saveToFile(
      'Molfiles-V3000/structure-where-atoms-exceeds999-expected.mol',
      expectedFile,
    );
    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V3000/structure-where-atoms-exceeds999-expected.mol',
        metaDataIndexes: METADATA_STRING_INDEX,
      });
    expect(molFile).toEqual(molFileExpected);
  });

  test('The file formats in the Save Structure window match the mockup', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4739
    Description: File formats in the Save Structure window match the mockup
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectSaveTool(page);
    await page.getByText('MDL Molfile V2000').click();
  });

  test('An atom or structure copied to the clipboard is saved without coordinates', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-8921
      Description: In the save window that opens, in the preview section, 
      the atom or structure has no coordinates because they were not added to the canvas.
    */
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await selectSaveTool(page);

    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/nitrogen-atom-under-cursor-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/nitrogen-atom-under-cursor-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Support for exporting to "InChiKey" file format', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-18030
     * Description: Save file - InChiKey for Benzene ring on canvas
     */
    // Can't select TestId because after press drop-down menu there is no InchIKey.
    await waitForIndigoToLoad(page);
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectSaveTool(page);
    await clickOnFileFormatDropdown(page);
    await selectOptionByText(page, 'InChIKey');
    const inChistring = await page
      .getByTestId('inChIKey-preview-area-text')
      .inputValue();
    expect(inChistring).toEqual('UHOVQNZJYSORNB-UHFFFAOYSA-N');
  });

  test('Support for exporting to "SDF V2000" file format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-18031
      Description: Structure saves in SDF V2000 format
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await verifyFileExport(
      page,
      'SDF/chain-expected.sdf',
      FileType.SDF,
      'v2000',
    );
  });

  test('Support for exporting to "SDF V3000" file format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-18031
      Description: Structure saves in SDF V3000 format
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);

    await verifyFileExport(
      page,
      'SDF/chain-expectedV3000.sdf',
      FileType.SDF,
      'v3000',
    );
  });
});

test.describe('Open/Save/Paste files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Paste the content from mol-string', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1844
      Description: MolFile is pasted to canvas
      */
    await openPasteFromClipboard(
      page,
      FILE_TEST_DATA.benzeneArrowBenzeneReagentHclV2000,
    );
    await waitForRender(page, async () => {
      await pressButton(page, 'Add to Canvas');
    });
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Paste from clipboard in "Daylight SMILES" format structure with attachment point and query features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1846
    Description: Daylight SMILES is pasted to canvas with attachment point and query features
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'C1%91C(O)=C(C2[CH]=CC(C)=CC=2N)C(C)=CC=1.[*:1]%91 |$;;;;;;;;;;;;;;;;_AP1$,rb:10:2,u:10,s:10:*|',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Paste from clipboard in "Extended SMILES" format structure with attachment point and query features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1846
    Description: Extended SMILES is pasted to canvas with attachment point and query features
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'C1%91C(O)=C(C2[CH]=CC(C)=CC=2N)C(C)=C%92C=1O1C=CN=CC=1.[*:1]%91.[*:2]%92 |$;;;;;;;;;;;;;;;;;;;;;;_AP1;_AP2$,rb:10:2,u:10,s:10:*|',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Paste from clipboard in "InChi" format structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1847
    Description: InChi is pasted to canvas
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'InChI=1S/C16H18/c1-11-5-12(2)8-15(7-11)16-9-13(3)6-14(4)10-16/h5-10H,1-4H3',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Save structure with SVG format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-2253
      Description: File is shown in the preview
    */
    await openFileAndAddToCanvas('KET/two-benzene-connected.ket', page);
    await selectSaveTool(page);
    await clickOnFileFormatDropdown(page);
    await page.getByRole('option', { name: 'SVG Document' }).click();
    await takeEditorScreenshot(page);
  });

  test('Save structure with PNG format', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-2254
      Description: File is shown in the preview
    */
    await openFileAndAddToCanvas('KET/two-benzene-connected.ket', page);
    await selectSaveTool(page);
    await clickOnFileFormatDropdown(page);
    await page.getByRole('option', { name: 'PNG Image' }).click();
    await takeEditorScreenshot(page);
  });

  test('Saving structure with QUERY in Smiles format', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-3944
    Description: Message is shown: The message should be: "Structure contains query properties 
    of atoms and bonds that are not supported in the SMILES. 
    Query properties will not be reflected in the file saved."
    */
    await openFileAndAddToCanvas('Molfiles-V2000/attached-data.mol', page);

    await getPreviewForSmiles(page, 'Daylight SMILES');
    await page.getByText('Warnings').click();
    await takeEditorScreenshot(page);
  });

  test('Save *.ket file with atom list and atom properties', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3387
     * Description: All the atom properties (general and query specific) for atom list should be saved in ket format
     */
    await openFileAndAddToCanvas(
      'KET/benzene-with-atom-list-and-all-atom-and-query-attributes.ket',
      page,
    );

    await verifyFileExport(
      page,
      'KET/benzene-with-atom-list-and-all-atom-and-query-attributes-to-compare.ket',
      FileType.KET,
    );

    await takeEditorScreenshot(page);
  });
});
